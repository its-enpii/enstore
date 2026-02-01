<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TripayService
{
  private $apiKey;
  private $privateKey;
  private $merchantCode;
  private $baseUrl;
  private $mode;

  public function __construct()
  {
    $this->apiKey = config('services.tripay.api_key');
    $this->privateKey = config('services.tripay.private_key');
    $this->merchantCode = config('services.tripay.merchant_code');
    $this->mode = config('services.tripay.mode', 'sandbox');

    // Set base URL based on mode
    $this->baseUrl = config('services.tripay.base_url')
      ?? ($this->mode === 'production'
        ? 'https://tripay.co.id/api'
        : 'https://tripay.co.id/api-sandbox');
  }

  /**
   * Generate signature for API request
   */
  private function generateSignature($merchantRef, $amount)
  {
    $data = $this->merchantCode . $merchantRef . $amount;
    return hash_hmac('sha256', $data, $this->privateKey);
  }

  /**
   * Generate signature for callback validation
   */
  public function generateCallbackSignature($privateKey, $callbackData)
  {
    $json = json_encode($callbackData);
    return hash_hmac('sha256', $json, $privateKey);
  }

  /**
   * Get payment channels
   * 
   * @return array
   * @throws \Exception
   */
  public function getPaymentChannels()
  {
    try {
      Log::info('Tripay Get Payment Channels Request');

      $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->apiKey,
      ])->get($this->baseUrl . '/merchant/payment-channel');

      $result = $response->json();

      Log::info('Tripay Get Payment Channels Response', [
        'success' => $result['success'] ?? false,
        'total_channels' => count($result['data'] ?? []),
      ]);

      if (isset($result['success']) && $result['success']) {
        return [
          'success' => true,
          'data' => $result['data'],
        ];
      }

      throw new \Exception('Failed to get payment channels: ' . json_encode($result));
    } catch (\Exception $e) {
      Log::error('Tripay Get Payment Channels Error: ' . $e->getMessage());
      throw $e;
    }
  }

  /**
   * Create payment transaction
   * 
   * @param array $params
   * @return array
   * @throws \Exception
   */
  public function createTransaction($params)
  {
    try {
      $merchantRef = $params['merchant_ref'];
      $amount = $params['amount'];

      $signature = $this->generateSignature($merchantRef, $amount);

      $payload = [
        'method' => $params['method'],
        'merchant_ref' => $merchantRef,
        'amount' => $amount,
        'customer_name' => $params['customer_name'],
        'customer_email' => $params['customer_email'],
        'customer_phone' => $params['customer_phone'],
        'order_items' => $params['order_items'],
        'return_url' => $params['return_url'] ?? config('app.url'),
        'expired_time' => $params['expired_time'] ?? (time() + (2 * 3600)), // 2 hours default
        'signature' => $signature,
      ];

      Log::info('Tripay Create Transaction Request', [
        'merchant_ref' => $merchantRef,
        'amount' => $amount,
        'method' => $params['method'],
      ]);

      $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->apiKey,
      ])->post($this->baseUrl . '/transaction/create', $payload);

      $result = $response->json();

      Log::info('Tripay Create Transaction Response', [
        'success' => $result['success'] ?? false,
        'reference' => $result['data']['reference'] ?? null,
      ]);

      if (isset($result['success']) && $result['success']) {
        return $result['data']; // Return data directly like in mapping file
      }

      throw new \Exception($result['message'] ?? 'Failed to create transaction');
    } catch (\Exception $e) {
      Log::error('Tripay Create Transaction Error', [
        'error' => $e->getMessage(),
        'merchant_ref' => $merchantRef ?? null,
      ]);
      throw $e;
    }
  }

  /**
   * Create payment transaction (alias for createTransaction)
   * This matches the mapping file naming convention
   * 
   * @param array $data
   * @return array
   * @throws \Exception
   */
  public function createPayment(array $data)
  {
    return $this->createTransaction($data);
  }

  /**
   * Get transaction detail
   * 
   * @param string $reference
   * @return array
   * @throws \Exception
   */
  public function getTransactionDetail($reference)
  {
    try {
      Log::info('Tripay Get Transaction Detail Request', ['reference' => $reference]);

      $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->apiKey,
      ])->get($this->baseUrl . '/transaction/detail', [
        'reference' => $reference,
      ]);

      $result = $response->json();

      Log::info('Tripay Get Transaction Detail Response', [
        'success' => $result['success'] ?? false,
        'status' => $result['data']['status'] ?? null,
      ]);

      if (isset($result['success']) && $result['success']) {
        return [
          'success' => true,
          'data' => $result['data'],
        ];
      }

      throw new \Exception('Failed to get transaction detail: ' . json_encode($result));
    } catch (\Exception $e) {
      Log::error('Tripay Get Transaction Detail Error', [
        'error' => $e->getMessage(),
        'reference' => $reference,
      ]);
      throw $e;
    }
  }

  /**
   * Validate callback signature (from header)
   * 
   * @param string $callbackSignature
   * @param array $callbackData
   * @return bool
   */
  public function validateCallbackSignature($callbackSignature, $callbackData)
  {
    $generatedSignature = $this->generateCallbackSignature($this->privateKey, $callbackData);

    Log::info('Tripay Validate Callback Signature', [
      'received' => $callbackSignature,
      'generated' => $generatedSignature,
      'valid' => $callbackSignature === $generatedSignature,
    ]);

    return $callbackSignature === $generatedSignature;
  }

  /**
   * Validate callback signature (alternative method from mapping file)
   * Validates signature from callback data array directly
   * 
   * @param array $callbackData
   * @return bool
   */
  public function validateCallbackSignatureFromData(array $callbackData)
  {
    $callbackSignature = $callbackData['signature'] ?? '';

    $generatedSignature = hash_hmac(
      'sha256',
      $this->merchantCode . $callbackData['merchant_ref'] . $callbackData['amount'],
      $this->privateKey
    );

    Log::info('Tripay Validate Callback Signature (from data)', [
      'received' => $callbackSignature,
      'generated' => $generatedSignature,
      'valid' => $callbackSignature === $generatedSignature,
    ]);

    return $callbackSignature === $generatedSignature;
  }

  /**
   * Parse payment status from Tripay
   * 
   * @param string $status
   * @return string
   */
  public function parsePaymentStatus($status)
  {
    $statusMap = [
      'UNPAID' => 'pending',
      'PAID' => 'paid',
      'EXPIRED' => 'expired',
      'FAILED' => 'failed',
      'REFUND' => 'refunded',
    ];

    return $statusMap[$status] ?? 'pending';
  }

  /**
   * Get payment instructions
   * 
   * @param string $code
   * @return array
   * @throws \Exception
   */
  public function getPaymentInstructions($code)
  {
    try {
      Log::info('Tripay Get Payment Instructions Request', ['code' => $code]);

      $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->apiKey,
      ])->get($this->baseUrl . '/merchant/payment-channel', [
        'code' => $code,
      ]);

      $result = $response->json();

      if (isset($result['success']) && $result['success']) {
        return [
          'success' => true,
          'data' => $result['data'],
        ];
      }

      throw new \Exception('Failed to get payment instructions: ' . json_encode($result));
    } catch (\Exception $e) {
      Log::error('Tripay Get Payment Instructions Error: ' . $e->getMessage());
      throw $e;
    }
  }

  /**
   * Get calculator fee
   * 
   * @param string $code
   * @param int $amount
   * @return array
   * @throws \Exception
   */
  public function calculateFee($code, $amount)
  {
    try {
      $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->apiKey,
      ])->get($this->baseUrl . '/merchant/fee-calculator', [
        'code' => $code,
        'amount' => $amount,
      ]);

      $result = $response->json();

      if (isset($result['success']) && $result['success']) {
        return [
          'success' => true,
          'data' => $result['data'],
        ];
      }

      throw new \Exception('Failed to calculate fee: ' . json_encode($result));
    } catch (\Exception $e) {
      Log::error('Tripay Calculate Fee Error: ' . $e->getMessage());
      throw $e;
    }
  }
}
