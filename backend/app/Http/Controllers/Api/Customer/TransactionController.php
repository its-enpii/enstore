<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\BalancePurchaseRequest;
use App\Http\Requests\CreatePurchaseRequest;
use App\Http\Requests\CreateTopupRequest;
use App\Jobs\ProcessDigiflazzOrder;
use App\Jobs\ProcessPostpaidPayment;
use App\Models\Payment;
use App\Services\ProductService;
use App\Services\TransactionService;
use App\Services\TripayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
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
     * Create purchase transaction (via payment gateway)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function createPurchase(CreatePurchaseRequest $request)
    {
        DB::beginTransaction();

        try {
            $user = auth()->user();
            $productItem = $this->productService->getProductItemById($request->product_item_id);

            // Create transaction
            $transaction = $this->transactionService->createPurchaseTransaction(
                $user,
                $productItem,
                $request->customer_data,
                $request->payment_method,
                $request->voucher_code
            );

            $orderItems = [
                [
                    'sku' => $productItem->digiflazz_code,
                    'name' => $productItem->product->name.' - '.$productItem->name,
                    'price' => $transaction->product_price,
                    'quantity' => 1,
                ],
            ];

            if ($transaction->admin_fee > 0) {
                $orderItems[] = [
                    'sku' => 'ADM',
                    'name' => 'Biaya Admin',
                    'price' => $transaction->admin_fee,
                    'quantity' => 1,
                ];
            }

            // Create payment via Tripay
            $tripayData = [
                'method' => $request->payment_method,
                'merchant_ref' => $transaction->transaction_code,
                'amount' => $transaction->total_price,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => $user->phone,
                'order_items' => $orderItems,
                'return_url' => config('app.frontend_url').'/transaction/'.$transaction->transaction_code,
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
                'fee' => $tripayResponse['total_fee'] ?? 0,
                'total_amount' => $tripayResponse['amount_received'],
                'payment_url' => $tripayResponse['checkout_url'] ?? null,
                'qr_url' => $tripayResponse['qr_url'] ?? null,
                'status' => 'pending',
                'expired_at' => date('Y-m-d H:i:s', $tripayResponse['expired_time']),
                'payment_instructions' => $tripayResponse['instructions'] ?? [],
            ]);

            // UPDATE TRANSACTION WITH ACTUAL FEE FROM TRIPAY
            // This ensures the "Admin Fee" and "Total Price" in database match what user pays.
            $actualFee = $tripayResponse['total_fee'] ?? 0;
            
            // Force calculation: Original Amount + Fee
            // We use the original transaction total_price (which is the product price) + actual fee
            $totalPrice = $transaction->total_price + $actualFee;

            // Force update via Query Builder to ensure it persists
            DB::table('transactions')
                ->where('id', $transaction->id)
                ->update([
                    'admin_fee' => $actualFee,
                    'total_price' => $totalPrice,
                    'updated_at' => now(),
                ]);

            // Update the model instance manually so the response has the new data
            $transaction->admin_fee = $actualFee;
            $transaction->total_price = $totalPrice;

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
            Log::error('Failed to create purchase transaction', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Create purchase transaction (via balance)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function createBalancePurchase(BalancePurchaseRequest $request)
    {
        try {
            $user = auth()->user();
            $productItem = $this->productService->getProductItemById($request->product_item_id);

            // Create transaction
            $transaction = $this->transactionService->createBalancePurchaseTransaction(
                $user,
                $productItem,
                $request->customer_data,
                $request->voucher_code
            );

            // Dispatch appropriate job based on payment type
            if ($transaction->prepaid_postpaid_type === 'postpaid') {
                ProcessPostpaidPayment::dispatch($transaction);
            } else {
                // Check provider
                $provider = strtolower($productItem->product->provider ?? '');

                if ($provider === 'digiflazz') {
                    // Dispatch prepaid order job (Digiflazz)
                    ProcessDigiflazzOrder::dispatch($transaction);
                } else {
                    // Manual provider or others
                    // Do nothing, let it stay processing
                    // Optionally dispatch notification to admin
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaction created successfully. Your order is being processed.',
                'data' => $transaction,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create balance purchase transaction', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Create topup transaction
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function createTopup(CreateTopupRequest $request)
    {
        DB::beginTransaction();

        try {
            $user = auth()->user();

            // Create transaction
            $transaction = $this->transactionService->createTopupTransaction(
                $user,
                $request->amount,
                $request->payment_method
            );

            $orderItems = [
                [
                    'sku' => 'TOPUP',
                    'name' => 'Top Up Saldo',
                    'price' => $request->amount,
                    'quantity' => 1,
                ],
            ];

            if ($transaction->admin_fee > 0) {
                $orderItems[] = [
                    'sku' => 'ADM',
                    'name' => 'Biaya Admin',
                    'price' => $transaction->admin_fee,
                    'quantity' => 1,
                ];
            }

            // Create payment via Tripay
            $tripayData = [
                'method' => $request->payment_method,
                'merchant_ref' => $transaction->transaction_code,
                'amount' => $transaction->total_price,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => $user->phone,
                'order_items' => $orderItems,
                'return_url' => config('app.frontend_url').'/transaction/'.$transaction->transaction_code,
                'expired_time' => now()->addHours(2)->timestamp,
            ];

            $tripayResponse = $this->tripayService->createPayment($tripayData);

            // Save payment
            // Save payment
            $payment = Payment::create([
                'transaction_id' => $transaction->id,
                'payment_reference' => $tripayResponse['reference'],
                'payment_code' => $tripayResponse['pay_code'] ?? null,
                'payment_method' => $tripayResponse['payment_method'],
                'payment_channel' => $tripayResponse['payment_name'],
                'amount' => $tripayResponse['amount'],
                'fee' => $tripayResponse['total_fee'] ?? 0,
                'total_amount' => $tripayResponse['amount_received'],
                'payment_url' => $tripayResponse['checkout_url'] ?? null,
                'qr_url' => $tripayResponse['qr_url'] ?? null,
                'status' => 'pending',
                'expired_at' => date('Y-m-d H:i:s', $tripayResponse['expired_time']),
                'payment_instructions' => $tripayResponse['instructions'] ?? [],
            ]);

            // UPDATE TRANSACTION WITH ACTUAL FEE FROM TRIPAY
            $actualFee = $tripayResponse['total_fee'] ?? 0;
            
            // Force calculation: Original Amount + Fee
            $totalPrice = $transaction->total_price + $actualFee;

            // Force update via Query Builder
            DB::table('transactions')
                ->where('id', $transaction->id)
                ->update([
                    'admin_fee' => $actualFee,
                    'total_price' => $totalPrice,
                    'updated_at' => now(),
                ]);

            // Update model instance manually
            $transaction->admin_fee = $actualFee;
            $transaction->total_price = $totalPrice;

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Topup transaction created successfully',
                'data' => [
                    'transaction' => $transaction,
                    'payment' => $payment,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create topup transaction', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get transaction history
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function history(Request $request)
    {
        try {
            $user = auth()->user();

            $filters = [
                'type' => $request->get('type'),
                'status' => $request->get('status'),
                'start_date' => $request->get('start_date'),
                'end_date' => $request->get('end_date'),
                'per_page' => $request->get('per_page', 20),
            ];

            $transactions = $this->transactionService->getUserTransactions($user, $filters);

            return response()->json([
                'success' => true,
                'data' => $transactions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get transaction history: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get transaction detail
     *
     * @param  string  $transactionCode
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($transactionCode)
    {
        try {
            $user = auth()->user();

            $transaction = $user->transactions()
                ->with(['productItem.product', 'payment', 'logs'])
                ->where('transaction_code', $transactionCode)
                ->firstOrFail();

            // Structure to match PublicTransactionController for consistency
            $transactionData = $transaction->toArray();
            $transactionData['product'] = [
                'name' => $transaction->productItem->product->name,
                'item' => $transaction->productItem->name,
                'image' => $transaction->productItem->product->image,
                'slug' => $transaction->productItem->product->slug,
                'brand' => $transaction->productItem->product->brand,
                'input_fields' => $transaction->productItem->product->input_fields,
                'customer_data' => $transaction->customer_data,
            ];

            return response()->json([
                'success' => true,
                'data' => $transactionData,
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
     *
     * @return \Illuminate\Http\JsonResponse
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
                'message' => 'Failed to get payment channels: '.$e->getMessage(),
            ], 500);
        }
    }
}
