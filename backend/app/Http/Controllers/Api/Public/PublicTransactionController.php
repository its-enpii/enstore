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
        'amount' => (int) $transaction->total_price,
        'customer_name' => $customerName,
        'customer_email' => $customerEmail,
        'customer_phone' => $customerPhone,
        'order_items' => array_merge(
          [
            [
              'sku' => $productItem->digiflazz_code,
              'name' => $productItem->product->name . ' - ' . $productItem->name,
              'price' => (int) $transaction->product_price,
              'quantity' => 1,
            ]
          ],
          $transaction->admin_fee > 0 ? [
            [
              'sku' => 'ADMIN-FEE',
              'name' => 'Biaya Admin',
              'price' => (int) $transaction->admin_fee,
              'quantity' => 1,
            ]
          ] : []
        ),
        'return_url' => config('app.frontend_url') . '/transaction/' . $transaction->transaction_code,
        'expired_time' => now()->addHours(2)->timestamp,
      ];

      $tripayResponse = $this->tripayService->createPayment($tripayData);

      // Save payment
      $payment = Payment::create([
        'transaction_id' => $transaction->id,
        'payment_reference' => $tripayResponse['reference'],
        'payment_code' => $tripayResponse['pay_code'] ?? null,
        'payment_method' => $tripayResponse['payment_method'],
        'payment_channel' => $tripayResponse['payment_name'],
        'amount' => $tripayResponse['amount'],
        'fee' => $tripayResponse['total_fee']['customer'] ?? 0,
        'total_amount' => $tripayResponse['amount_received'],
        'checkout_url' => $tripayResponse['checkout_url'] ?? null,
        'qr_url' => $tripayResponse['qr_url'] ?? null,
        'status' => 'pending',
        'expired_at' => date('Y-m-d H:i:s', $tripayResponse['expired_time']),
        'payment_instructions' => $tripayResponse['instructions'] ?? [],
        'tripay_merchant_ref' => $tripayResponse['merchant_ref'],
        'tripay_customer_name' => $tripayResponse['customer_name'],
        'tripay_customer_email' => $tripayResponse['customer_email'],
        'tripay_customer_phone' => $tripayResponse['customer_phone'],
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
            'checkout_url' => $transaction->payment?->checkout_url,
            'qr_url' => $transaction->payment?->qr_url,
            'payment_code' => $transaction->payment?->payment_code,
            'expired_at' => $transaction->payment?->expired_at,
            'instructions' => $transaction->payment?->payment_instructions,
          ],
          'sn' => $transaction->digiflazz_serial_number,
          'note' => $transaction->digiflazz_message,
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
