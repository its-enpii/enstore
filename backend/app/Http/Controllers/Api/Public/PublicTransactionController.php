<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreatePurchaseRequest;
use App\Services\TransactionService;
use App\Services\ProductService;
use App\Services\TripayService;
use App\Models\Payment;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PublicTransactionController extends Controller
{
  protected $transactionService;
  protected $productService;
  protected $tripayService;

  public function __construct(
    TransactionService $transactionService,
    ProductService $productService,
    TripayService $tripayService
  ) {
    $this->transactionService = $transactionService;
    $this->productService = $productService;
    $this->tripayService = $tripayService;
  }

  /**
   * Create purchase transaction (guest)
   */
  public function createPurchase(CreatePurchaseRequest $request)
  {
    DB::beginTransaction();

    try {
      $productItem = $this->productService->getProductItemById($request->product_item_id);

      // Create transaction (user is null)
      $transaction = $this->transactionService->createPurchaseTransaction(
        null, // Explicitly null for guest
        $productItem,
        $request->customer_data,
        $request->payment_method
      );

      // For guest, use customer data from request or general info
      $customerName = $request->input('customer_name', 'Guest Customer');
      $customerEmail = $request->input('customer_email', 'guest@example.com');
      $customerPhone = $request->input('customer_phone', '080000000000');

      $tripayData = [
        'method' => $request->payment_method,
        'merchant_ref' => $transaction->transaction_code,
        'amount' => $transaction->total_price,
        'customer_name' => $customerName,
        'customer_email' => $customerEmail,
        'customer_phone' => $customerPhone,
        'order_items' => [
          [
            'sku' => $productItem->digiflazz_code,
            'name' => $productItem->product->name . ' - ' . $productItem->name,
            'price' => $transaction->product_price,
            'quantity' => 1,
          ],
        ],
        'return_url' => config('app.frontend_url') . '/transaction/' . $transaction->transaction_code,
        'expired_time' => now()->addHours(2)->timestamp,
      ];

      $tripayResponse = $this->tripayService->createPayment($tripayData);

      // Save payment
      $payment = Payment::create([
        'transaction_id' => $transaction->id,
        'payment_code' => $tripayResponse['reference'],
        'payment_method' => $tripayResponse['payment_method'],
        'payment_channel' => $tripayResponse['payment_name'],
        'amount' => $tripayResponse['amount'],
        'fee' => $tripayResponse['total_fee']['customer'] ?? 0,
        'total_amount' => $tripayResponse['amount_received'],
        'payment_url' => $tripayResponse['checkout_url'] ?? null,
        'va_number' => $tripayResponse['pay_code'] ?? null,
        'qr_code_url' => $tripayResponse['qr_url'] ?? null,
        'status' => 'pending',
        'expired_at' => date('Y-m-d H:i:s', $tripayResponse['expired_time']),
        'meta_data' => [
          'instructions' => $tripayResponse['instructions'] ?? null,
        ],
      ]);

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Transaction created successfully',
        'data' => [
          'transaction' => $transaction,
          'payment' => $payment,
        ],
      ], 201);
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to create guest purchase transaction', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
      ], 400);
    }
  }

  /**
   * Check transaction status
   */
  public function checkStatus(string $transactionCode)
  {
    try {
      // Find transaction by code (public info, basic details only)
      $transaction = Transaction::with(['productItem.product', 'payment'])
        ->where('transaction_code', $transactionCode)
        ->firstOrFail();

      return response()->json([
        'success' => true,
        'data' => [
          'transaction_code' => $transaction->transaction_code,
          'status' => $transaction->status,
          'payment_status' => $transaction->payment_status,
          'product_name' => $transaction->product_name,
          'total_price' => $transaction->total_price,
          'created_at' => $transaction->created_at,
          'payment' => [
            'payment_method' => $transaction->payment?->payment_method,
            'payment_url' => $transaction->payment?->payment_url,
            'qr_code_url' => $transaction->payment?->qr_code_url,
            'va_number' => $transaction->payment?->va_number,
            'expired_at' => $transaction->payment?->expired_at,
          ]
        ],
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Transaction not found',
      ], 404);
    }
  }

  /**
   * Get payment channels
   */
  public function paymentChannels()
  {
    try {
      $channels = $this->tripayService->getPaymentChannels();

      return response()->json([
        'success' => true,
        'data' => $channels['data'],
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to get payment channels: ' . $e->getMessage(),
      ], 500);
    }
  }
}
