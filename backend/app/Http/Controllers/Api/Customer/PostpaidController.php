<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\ProductItem;
use App\Services\DigiflazzService;
use App\Services\TransactionService;
use App\Services\TripayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class PostpaidController extends Controller
{
    private $digiflazzService;
    private $transactionService;
    private $tripayService;

    public function __construct(
        DigiflazzService $digiflazzService,
        TransactionService $transactionService,
        TripayService $tripayService
    ) {
        $this->digiflazzService = $digiflazzService;
        $this->transactionService = $transactionService;
        $this->tripayService = $tripayService;
    }

    /**
     * Inquiry tagihan (Step 1)
     */
    public function inquiry(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_item_id' => 'required|exists:product_items,id',
            'customer_no' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $productItem = ProductItem::with('product')->findOrFail($request->product_item_id);

            // Check if product is postpaid
            if ($productItem->product->payment_type !== 'postpaid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Produk ini bukan produk pascabayar',
                ], 400);
            }

            // Generate inquiry reference
            $inquiryRef = 'INQ-' . date('YmdHis') . '-' . rand(1000, 9999);

            // Call Digiflazz inquiry
            $result = $this->digiflazzService->inquiryPostpaid(
                $productItem->digiflazz_code,
                $request->customer_no,
                $inquiryRef
            );

            if (!$result['success'] || ($result['data']['rc'] ?? '') !== '00') {
                return response()->json([
                    'success' => false,
                    'message' => $result['data']['message'] ?? 'Gagal cek tagihan',
                ], 400);
            }

            $data = $result['data'];

            // Save inquiry to cache for 30 minutes
            $inquiryData = [
                'product_item_id' => $productItem->id,
                'product_name' => $productItem->product->name . ' - ' . $productItem->name,
                'digiflazz_code' => $productItem->digiflazz_code,
                'customer_no' => $request->customer_no,
                'customer_name' => $data['customer_name'] ?? '',
                'period' => $data['period'] ?? '',
                'nominal' => $data['nominal'] ?? 0,
                'admin' => $data['admin'] ?? 0,
                'total' => $data['total_bayar'] ?? 0,
            ];

            Cache::put($inquiryRef, $inquiryData, now()->addMinutes(30));

            return response()->json([
                'success' => true,
                'message' => 'Berhasil cek tagihan',
                'data' => [
                    'inquiry_ref' => $inquiryRef,
                    'product_name' => $productItem->product->name . ' - ' . $productItem->name,
                    'customer_no' => $request->customer_no,
                    'customer_name' => $data['customer_name'] ?? '',
                    'period' => $data['period'] ?? '',
                    'tagihan' => $data['nominal'] ?? 0,
                    'admin' => $data['admin'] ?? 0,
                    'total' => $data['total_bayar'] ?? 0,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal cek tagihan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Pay tagihan (Step 2)
     */
    public function pay(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'inquiry_ref' => 'required|string',
            'payment_method' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Get inquiry data from cache
            $inquiryData = Cache::get($request->inquiry_ref);

            if (!$inquiryData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Inquiry expired atau tidak ditemukan. Silakan cek tagihan lagi.',
                ], 400);
            }

            // Create postpaid transaction
            $transaction = $this->transactionService->createPostpaidTransaction([
                'user_id' => auth()->id(),
                'product_item_id' => $inquiryData['product_item_id'],
                'customer_data' => [
                    'customer_no' => $inquiryData['customer_no'],
                ],
                'inquiry_ref' => $request->inquiry_ref,
                'bill_data' => [
                    'customer_name' => $inquiryData['customer_name'],
                    'period' => $inquiryData['period'],
                    'nominal' => $inquiryData['nominal'],
                    'admin' => $inquiryData['admin'],
                ],
                'customer_type' => auth()->user()->customer_type ?? 'retail',
                'total_price' => $inquiryData['total'],
            ]);

            // Create payment via Tripay
            // Note: Service call might be createPayment or createTransaction depending on TripayService implementation
            $tripayData = [
                'method' => $request->payment_method,
                'merchant_ref' => $transaction->transaction_code,
                'amount' => $transaction->total_price,
                'customer_name' => auth()->user()->name ?? 'Guest',
                'customer_email' => auth()->user()->email ?? 'guest@example.com',
                'customer_phone' => auth()->user()->phone ?? '08123456789',
                'order_items' => [[
                    'name' => $inquiryData['product_name'],
                    'price' => $inquiryData['total'],
                    'quantity' => 1,
                ]],
            ];

            // Some services use createPayment, some createTransaction
            $paymentResponse = method_exists($this->tripayService, 'createPayment')
                ? $this->tripayService->createPayment($tripayData)
                : $this->tripayService->createTransaction($tripayData);

            // Clear cache
            Cache::forget($request->inquiry_ref);

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil dibuat',
                'data' => [
                    'transaction_code' => $transaction->transaction_code,
                    'payment' => $paymentResponse,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage(),
            ], 500);
        }
    }
}
