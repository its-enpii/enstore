<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DigiflazzService
{
    private $username;

    private $apiKey;

    private $baseUrl;

    private $testing;

    private $logger;

    public function __construct(DatabaseLogger $logger)
    {
        $this->logger = $logger;
        $this->username = config('services.digiflazz.username');
        $this->apiKey = config('services.digiflazz.api_key');
        $this->baseUrl = config('services.digiflazz.base_url', 'https://api.digiflazz.com/v1');
        $this->testing = config('services.digiflazz.testing', true);
    }

    /**
     * Generate signature for Digiflazz API
     *
     * @param  string  $command
     * @return string
     */
    private function generateSign($command)
    {
        $string = $this->username.$this->apiKey.$command;

        return md5($string);
    }

    /**
     * Check balance (Cek Saldo)
     *
     * @return array
     *
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

            $this->logger->logExternalApi(
                'Digiflazz',
                'Check Balance Request',
                $payload,
                [],
                true
            );

            $response = Http::timeout(30)
                ->post($this->baseUrl.'/cek-saldo', $payload);

            $result = $response->json();

            $this->logger->logExternalApi(
                'Digiflazz',
                'Check Balance Response',
                [],
                $result ?? [],
                isset($result['data']['status']) && $result['data']['status'] === 'sukses'
            );

            if (isset($result['data']['status']) && $result['data']['status'] === 'sukses') {
                return [
                    'success' => true,
                    'balance' => $result['data']['deposit'],
                    'username' => $result['data']['username'],
                ];
            }

            throw new \Exception('Failed to check balance: '.json_encode($result));
        } catch (\Exception $e) {
            Log::error('Digiflazz Check Balance Error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get price list (all products)
     *
     * @param  bool  $useCache
     * @return array
     *
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
            Log::error('Digiflazz Get Price List Error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get postpaid price list
     *
     * @param  bool  $useCache
     * @return array
     *
     * @throws \Exception
     */
    public function getPostpaidPriceList($useCache = true)
    {
        try {
            // Cache for 1 hour
            if ($useCache) {
                return Cache::remember('digiflazz_postpaid_price_list', 3600, function () {
                    return $this->fetchPostpaidPriceList();
                });
            }

            return $this->fetchPostpaidPriceList();
        } catch (\Exception $e) {
            Log::error('Digiflazz Get Postpaid Price List Error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Fetch price list from API
     *
     * @return array
     *
     * @throws \Exception
     */
    private function fetchPriceList()
    {
        $payload = [
            'cmd' => 'prepaid',
            'username' => $this->username,
            'sign' => $this->generateSign('pricelist'),
        ];

        $this->logger->logExternalApi(
            'Digiflazz',
            'Get Price List Request',
            $payload,
            [],
            true
        );

        $response = Http::timeout(60)
            ->post($this->baseUrl.'/price-list', $payload);

        $result = $response->json();

        if (isset($result['data']) && is_array($result['data'])) {
            $this->logger->logExternalApi(
                'Digiflazz',
                'Price List Retrieved',
                [],
                ['total_products' => count($result['data'])],
                true
            );

            return $result['data'];
        }

        throw new \Exception('Failed to get price list: '.json_encode($result));
    }

    /**
     * Fetch postpaid price list from API
     *
     * @return array
     *
     * @throws \Exception
     */
    private function fetchPostpaidPriceList()
    {
        $payload = [
            'cmd' => 'pasca',
            'username' => $this->username,
            'sign' => $this->generateSign('pricelist'),
        ];

        $this->logger->logExternalApi(
            'Digiflazz',
            'Get Postpaid Price List Request',
            $payload,
            [],
            true
        );

        $response = Http::timeout(60)
            ->post($this->baseUrl.'/price-list', $payload);

        $result = $response->json();

        if (isset($result['data']) && is_array($result['data'])) {
            $this->logger->logExternalApi(
                'Digiflazz',
                'Postpaid Price List Retrieved',
                [],
                ['total_products' => count($result['data'])],
                true
            );

            return $result['data'];
        }

        throw new \Exception('Failed to get postpaid price list: '.json_encode($result));
    }

    /**
     * Create transaction (buy product)
     *
     * @param  string  $buyerSkuCode  - Product SKU (ML86, FF100, dll)
     * @param  string  $customerNo  - User ID / Phone number
     * @param  string  $refId  - Unique reference ID (transaction_code)
     * @return array
     *
     * @throws \Exception
     */
    public function createTransaction($buyerSkuCode, $customerNo, $refId, $options = [])
    {
        try {
            $payload = [
                'username' => $this->username,
                'buyer_sku_code' => $buyerSkuCode,
                'customer_no' => $customerNo,
                'ref_id' => $refId,
                'sign' => $this->generateSign($refId),
                'testing' => $this->testing,
            ];

            // Optional parameters
            if (isset($options['max_price'])) {
                $payload['max_price'] = (int) $options['max_price'];
            }

            if (isset($options['cb_url'])) {
                $payload['cb_url'] = $options['cb_url'];
            }

            if (isset($options['allow_dot'])) {
                $payload['allow_dot'] = (bool) $options['allow_dot'];
            }

            $this->logger->logExternalApi(
                'Digiflazz',
                'Create Transaction Request',
                $payload,
                [],
                true
            );

            $response = Http::timeout(60)
                ->post($this->baseUrl.'/transaction', $payload);

            $result = $response->json();

            $this->logger->logExternalApi(
                'Digiflazz',
                'Create Transaction Response',
                [],
                $result ?? [],
                isset($result['data'])
            );

            if (isset($result['data'])) {
                return [
                    'success' => true,
                    'data' => $result['data'],
                ];
            }

            throw new \Exception('Failed to create transaction: '.json_encode($result));
        } catch (\Exception $e) {
            Log::error('Digiflazz Create Transaction Error', [
                'error' => $e->getMessage(),
                'ref_id' => $refId,
            ]);
            throw $e;
        }
    }

    /**
     * Inquiry pascabayar (cek tagihan)
     * For: PLN Pascabayar, PDAM, Telkom, TV Kabel, dll
     *
     * @param  string  $buyerSkuCode  - Product SKU (pln, pdam, telkom, dll)
     * @param  string  $customerNo  - Customer ID / Meter Number
     * @param  string  $refId  - Unique reference ID (inquiry_code)
     * @return array
     *
     * @throws \Exception
     */
    public function inquiryPostpaid($buyerSkuCode, $customerNo, $refId, $options = [])
    {
        try {
            $payload = [
                'commands' => 'inq-pasca',
                'username' => $this->username,
                'buyer_sku_code' => $buyerSkuCode,
                'customer_no' => $customerNo,
                'ref_id' => $refId,
                'sign' => $this->generateSign($refId),
            ];

            // Optional parameters
            if (isset($options['max_price'])) {
                $payload['max_price'] = (int) $options['max_price'];
            }

            if (isset($options['allow_dot'])) {
                $payload['allow_dot'] = (bool) $options['allow_dot'];
            }

            $this->logger->logExternalApi(
                'Digiflazz',
                'Inquiry Postpaid Request',
                $payload,
                [],
                true
            );

            $response = Http::timeout(60)->post($this->baseUrl.'/transaction', $payload);
            $result = $response->json();

            $this->logger->logExternalApi(
                'Digiflazz',
                'Inquiry Postpaid Response',
                [],
                $result ?? [],
                isset($result['data']) && ($result['data']['rc'] ?? '') === '00'
            );

            if (isset($result['data'])) {
                return [
                    'success' => true,
                    'data' => $result['data'],
                ];
            }

            throw new \Exception('Failed to inquiry postpaid: '.json_encode($result));
        } catch (\Exception $e) {
            Log::error('Digiflazz Inquiry Postpaid Error', [
                'error' => $e->getMessage(),
                'ref_id' => $refId,
            ]);
            throw $e;
        }
    }

    /**
     * Pay pascabayar (bayar tagihan)
     * For: PLN Pascabayar, PDAM, Telkom, TV Kabel, dll
     *
     * @param  string  $buyerSkuCode  - Product SKU (pln, pdam, telkom, dll)
     * @param  string  $customerNo  - Customer ID / Meter Number
     * @param  string  $refId  - Unique reference ID (transaction_code)
     * @return array
     *
     * @throws \Exception
     */
    public function payPostpaid($buyerSkuCode, $customerNo, $refId, $options = [])
    {
        try {
            $payload = [
                'commands' => 'pay-pasca',
                'username' => $this->username,
                'buyer_sku_code' => $buyerSkuCode,
                'customer_no' => $customerNo,
                'ref_id' => $refId,
                'sign' => $this->generateSign($refId),
            ];

            // Optional: testing only (sesuai dokumentasi Digiflazz)
            if (isset($options['testing'])) {
                $payload['testing'] = (bool) $options['testing'];
            }

            $this->logger->logExternalApi(
                'Digiflazz',
                'Pay Postpaid Request',
                $payload,
                [],
                true
            );

            $response = Http::timeout(60)->post($this->baseUrl.'/transaction', $payload);
            $result = $response->json();

            $this->logger->logExternalApi(
                'Digiflazz',
                'Pay Postpaid Response',
                [],
                $result ?? [],
                isset($result['data']) && ($result['data']['rc'] ?? '') === '00'
            );

            if (isset($result['data'])) {
                return [
                    'success' => true,
                    'data' => $result['data'],
                ];
            }

            throw new \Exception('Failed to pay postpaid: '.json_encode($result));
        } catch (\Exception $e) {
            Log::error('Digiflazz Pay Postpaid Error', [
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
     * @param  string  $buyerSkuCode
     * @param  string  $customerNo
     * @param  string  $refId
     * @return array
     *
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
     * @param  array  $customerData
     * @param  string  $productType
     * @return string
     */
    public function formatCustomerNumber($customerData, $productType)
    {
        switch ($productType) {
            case 'game':
            case 'games':
                // Format: {user_id}{zone_id} (NO SEPARATOR!)
                // Example: Mobile Legends user_id=123456789, zone_id=1234 => 1234567891234
                $userId = $customerData['user_id'] ?? '';
                $zoneId = $customerData['zone_id'] ?? '';

                return $userId.$zoneId;

            case 'pulsa':
            case 'data':
            case 'ewallet':
                // Format: {phone}
                return $customerData['phone'] ?? $customerData['customer_no'] ?? '';

            case 'pln':
                // Format: {meter_number}
                return $customerData['meter_no'] ?? $customerData['meter_number'] ?? $customerData['customer_no'] ?? '';

            case 'voucher':
                // Format: {email} or empty
                return $customerData['email'] ?? '';

            case 'pascabayar':
                // Format: {customer_id}
                return $customerData['customer_id'] ?? $customerData['customer_no'] ?? '';

            default:
                // Default: try any available identifier
                return $customerData['user_id']
                  ?? $customerData['phone']
                  ?? $customerData['customer_id']
                  ?? $customerData['customer_no']
                  ?? '';
        }
    }

    /**
     * Parse Digiflazz response code
     *
     * @param  string  $rc
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

        return $codes[$rc] ?? ['status' => 'failed', 'message' => "Unknown error (RC: {$rc})"];
    }
}
