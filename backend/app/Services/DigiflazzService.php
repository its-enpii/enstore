<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class DigiflazzService
{
  private $username;
  private $apiKey;
  private $baseUrl;

  public function __construct()
  {
    $this->username = config('services.digiflazz.username');
    $this->apiKey = config('services.digiflazz.api_key');
    $this->baseUrl = config('services.digiflazz.base_url', 'https://api.digiflazz.com/v1');
  }

  /**
   * Generate signature for Digiflazz API
   * 
   * @param string $command
   * @return string
   */
  private function generateSign($command)
  {
    $string = $this->username . $this->apiKey . $command;
    return md5($string);
  }

  /**
   * Check balance (Cek Saldo)
   * 
   * @return array
   * @throws \Exception
   */
  public function checkBalance()
  {
    try {
      $payload = [
        'cmd' => 'deposit',
        'username' => $this->username,
        'sign' => $this->generateSign('depo'),
      ];

      Log::info('Digiflazz Check Balance Request', $payload);

      $response = Http::timeout(30)
        ->post($this->baseUrl . '/cek-saldo', $payload);

      $result = $response->json();

      Log::info('Digiflazz Check Balance Response', $result ?? []);

      if (isset($result['data']['status']) && $result['data']['status'] === 'sukses') {
        return [
          'success' => true,
          'balance' => $result['data']['deposit'],
          'username' => $result['data']['username'],
        ];
      }

      throw new \Exception('Failed to check balance: ' . json_encode($result));
    } catch (\Exception $e) {
      Log::error('Digiflazz Check Balance Error: ' . $e->getMessage());
      throw $e;
    }
  }

  /**
   * Get price list (all products)
   * 
   * @param bool $useCache
   * @return array
   * @throws \Exception
   */
  public function getPriceList($useCache = true)
  {
    try {
      // Cache for 1 hour
      if ($useCache) {
        return Cache::remember('digiflazz_price_list', 3600, function () {
          return $this->fetchPriceList();
        });
      }

      return $this->fetchPriceList();
    } catch (\Exception $e) {
      Log::error('Digiflazz Get Price List Error: ' . $e->getMessage());
      throw $e;
    }
  }

  /**
   * Fetch price list from API
   * 
   * @return array
   * @throws \Exception
   */
  private function fetchPriceList()
  {
    $payload = [
      'cmd' => 'prepaid',
      'username' => $this->username,
      'sign' => $this->generateSign('pricelist'),
    ];

    Log::info('Digiflazz Get Price List Request');

    $response = Http::timeout(60)
      ->post($this->baseUrl . '/price-list', $payload);

    $result = $response->json();

    if (isset($result['data']) && is_array($result['data'])) {
      Log::info('Digiflazz Price List Retrieved', [
        'total_products' => count($result['data']),
      ]);

      return $result['data'];
    }

    throw new \Exception('Failed to get price list: ' . json_encode($result));
  }

  /**
   * Create transaction (buy product)
   * 
   * @param string $buyerSkuCode - Product SKU (ML86, FF100, dll)
   * @param string $customerNo - User ID / Phone number
   * @param string $refId - Unique reference ID (transaction_code)
   * @return array
   * @throws \Exception
   */
  public function createTransaction($buyerSkuCode, $customerNo, $refId)
  {
    try {
      $payload = [
        'username' => $this->username,
        'buyer_sku_code' => $buyerSkuCode,
        'customer_no' => $customerNo,
        'ref_id' => $refId,
        'sign' => $this->generateSign($refId),
      ];

      Log::info('Digiflazz Create Transaction Request', $payload);

      $response = Http::timeout(60)
        ->post($this->baseUrl . '/transaction', $payload);

      $result = $response->json();

      Log::info('Digiflazz Create Transaction Response', $result ?? []);

      if (isset($result['data'])) {
        return [
          'success' => true,
          'data' => $result['data'],
        ];
      }

      throw new \Exception('Failed to create transaction: ' . json_encode($result));
    } catch (\Exception $e) {
      Log::error('Digiflazz Create Transaction Error', [
        'error' => $e->getMessage(),
        'ref_id' => $refId,
      ]);
      throw $e;
    }
  }

  /**
   * Check transaction status
   * (Same as create transaction, but with existing ref_id)
   * 
   * @param string $buyerSkuCode
   * @param string $customerNo
   * @param string $refId
   * @return array
   * @throws \Exception
   */
  public function checkTransactionStatus($buyerSkuCode, $customerNo, $refId)
  {
    try {
      // Same as create transaction - Digiflazz returns status if ref_id exists
      return $this->createTransaction($buyerSkuCode, $customerNo, $refId);
    } catch (\Exception $e) {
      Log::error('Digiflazz Check Transaction Status Error', [
        'error' => $e->getMessage(),
        'ref_id' => $refId,
      ]);
      throw $e;
    }
  }

  /**
   * Format customer number based on product type
   * 
   * @param array $customerData
   * @param string $productType
   * @return string
   */
  public function formatCustomerNumber($customerData, $productType)
  {
    // For games (Mobile Legends, Free Fire, dll)
    if (in_array($productType, ['game', 'games'])) {
      // Format: user_id atau user_id-zone_id
      if (isset($customerData['zone_id']) && !empty($customerData['zone_id'])) {
        return $customerData['user_id'] . '-' . $customerData['zone_id'];
      }
      return $customerData['user_id'];
    }

    // For pulsa/data
    if (in_array($productType, ['pulsa', 'data'])) {
      // Format: 081234567890
      return $customerData['phone'] ?? $customerData['customer_no'];
    }

    // For PLN
    if ($productType === 'pln') {
      // Format: meter number
      return $customerData['meter_no'] ?? $customerData['customer_no'];
    }

    // Default
    return $customerData['customer_no'] ?? '';
  }

  /**
   * Parse Digiflazz response code
   * 
   * @param string $rc
   * @return array
   */
  public function parseResponseCode($rc)
  {
    $codes = [
      '00' => ['status' => 'success', 'message' => 'Transaction successful'],
      '01' => ['status' => 'pending', 'message' => 'Transaction pending'],
      '02' => ['status' => 'failed', 'message' => 'Invalid request'],
      '03' => ['status' => 'failed', 'message' => 'Insufficient balance'],
      '201' => ['status' => 'failed', 'message' => 'Invalid customer number'],
      '202' => ['status' => 'failed', 'message' => 'Product unavailable'],
      '203' => ['status' => 'failed', 'message' => 'Product out of stock'],
      '204' => ['status' => 'failed', 'message' => 'Duplicate transaction'],
    ];

    return $codes[$rc] ?? ['status' => 'failed', 'message' => 'Unknown error'];
  }
}
