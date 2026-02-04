<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TripayService;
use App\Models\Payment;
use App\Models\PaymentCallback;
use App\Models\Transaction;
use App\Models\Balance;
use App\Models\BalanceMutation;
use App\Models\Notification;
use App\Jobs\ProcessDigiflazzOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TripayCallbackController extends Controller
{
  private $tripayService;

  public function __construct(TripayService $tripayService)
  {
    $this->tripayService = $tripayService;
  }

  /**
   * Handle Tripay callback
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function handle(Request $request)
  {
    try {
      // Get callback data
      $callbackData = $request->all();

      // Validate signature
      $callbackSignature = $request->header('X-Callback-Signature');

      if (!$callbackSignature) {
        Log::warning('Tripay Callback: Missing signature');
        return response()->json([
          'success' => false,
          'message' => 'Missing signature',
        ], 400);
      }

      // Validate signature
      if (!$this->tripayService->validateCallbackSignature($callbackSignature, $callbackData)) {
        Log::warning('Tripay Callback: Invalid signature');
        return response()->json([
          'success' => false,
          'message' => 'Invalid signature',
        ], 400);
      }

      // Find payment by merchant_ref
      $merchantRef = $callbackData['merchant_ref'] ?? null;

      if (!$merchantRef) {
        Log::warning('Tripay Callback: Missing merchant_ref');
        return response()->json([
          'success' => false,
          'message' => 'Missing merchant_ref',
        ], 400);
      }

      // Find transaction
      $transaction = Transaction::where('transaction_code', $merchantRef)->first();

      if (!$transaction) {
        Log::warning('Tripay Callback: Transaction not found', ['merchant_ref' => $merchantRef]);
        return response()->json([
          'success' => false,
          'message' => 'Transaction not found',
        ], 404);
      }

      // Find payment
      $payment = $transaction->payment;

      if (!$payment) {
        Log::warning('Tripay Callback: Payment not found', ['transaction_id' => $transaction->id]);
        return response()->json([
          'success' => false,
          'message' => 'Payment not found',
        ], 404);
      }

      // Save callback data
      PaymentCallback::create([
        'payment_id' => $payment->id,
        'callback_data' => $callbackData,
        'signature' => $callbackSignature,
        'ip_address' => $request->ip(),
        'is_valid' => true,
        'processed' => true, // Marked as processed because we handle it immediately below
      ]);

      $tripayStatus = $callbackData['status'] ?? 'UNPAID';
      $paymentStatus = $this->tripayService->parsePaymentStatus($tripayStatus);

      // Handle payment status
      DB::beginTransaction();

      try {
        if ($paymentStatus === 'paid') {
          $this->handlePaymentSuccess($transaction, $payment, $callbackData);
        } elseif ($paymentStatus === 'expired' || $paymentStatus === 'failed') {
          $this->handlePaymentFailed($transaction, $payment, $callbackData);
        }

        DB::commit();

        return response()->json([
          'success' => true,
          'message' => 'Callback processed successfully',
        ]);
      } catch (\Exception $e) {
        DB::rollBack();
        throw $e;
      }
    } catch (\Exception $e) {
      Log::error('Tripay Callback Error', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Internal server error',
      ], 500);
    }
  }

  /**
   * Handle payment success
   * 
   * @param Transaction $transaction
   * @param Payment $payment
   * @param array $callbackData
   */
  private function handlePaymentSuccess($transaction, $payment, $callbackData)
  {
    // Update payment status
    $payment->update([
      'status' => 'paid',
      'paid_at' => now(),
      'meta_data' => array_merge($payment->meta_data ?? [], [
        'tripay_reference' => $callbackData['reference'] ?? null,
        'paid_amount' => $callbackData['amount_received'] ?? null,
      ]),
    ]);

    // Update transaction payment status
    $transaction->update([
      'payment_status' => 'paid',
      'paid_at' => now(),
    ]);

    // If transaction type is topup, add balance
    if ($transaction->transaction_type === 'topup') {
      $this->processTopup($transaction);
    }
    // If transaction type is purchase, process order
    elseif ($transaction->transaction_type === 'purchase') {
      $this->processPurchase($transaction);
    }

    // Create notification only if user_id exists
    if ($transaction->user_id) {
      Notification::create([
        'user_id' => $transaction->user_id,
        'title' => 'Pembayaran Berhasil',
        'message' => 'Pembayaran untuk ' . $transaction->product_name . ' telah berhasil.',
        'type' => 'payment_success',
        'data' => [
          'transaction_code' => $transaction->transaction_code,
          'amount' => $transaction->total_price,
        ],
      ]);
    }
  }

  /**
   * Handle payment failed/expired
   * 
   * @param Transaction $transaction
   * @param Payment $payment
   * @param array $callbackData
   */
  private function handlePaymentFailed($transaction, $payment, $callbackData)
  {
    $status = $callbackData['status'] === 'EXPIRED' ? 'expired' : 'failed';

    // Update payment status
    $payment->update([
      'status' => $status,
    ]);

    // Update transaction status
    $transaction->update([
      'payment_status' => $status,
      'status' => 'failed',
      'failed_at' => now(),
      $status === 'expired' ? 'expired_at' : 'failed_at' => now(),
    ]);

    // Create notification only if user_id exists
    if ($transaction->user_id) {
      Notification::create([
        'user_id' => $transaction->user_id,
        'title' => $status === 'expired' ? 'Pembayaran Kadaluarsa' : 'Pembayaran Gagal',
        'message' => 'Pembayaran untuk ' . $transaction->product_name . ' ' . ($status === 'expired' ? 'telah kadaluarsa' : 'gagal') . '.',
        'type' => 'payment_' . $status,
        'data' => [
          'transaction_code' => $transaction->transaction_code,
          'amount' => $transaction->total_price,
        ],
      ]);
    }
  }

  /**
   * Process topup transaction
   * 
   * @param Transaction $transaction
   */
  private function processTopup($transaction)
  {
    $user = $transaction->user;
    $balance = $user->balance;

    if (!$balance) {
      $balance = Balance::create([
        'user_id' => $user->id,
        'amount' => 0,
        'hold_amount' => 0,
      ]);
    }

    $balanceBefore = $balance->amount;
    $topupAmount = $transaction->total_price;
    $balanceAfter = $balanceBefore + $topupAmount;

    // Update balance
    $balance->update([
      'amount' => $balanceAfter,
    ]);

    // Create balance mutation
    BalanceMutation::create([
      'balance_id' => $balance->id,
      'transaction_id' => $transaction->id,
      'type' => 'credit',
      'amount' => $topupAmount,
      'balance_before' => $balanceBefore,
      'balance_after' => $balanceAfter,
      'description' => 'Top up saldo via ' . $transaction->payment_method,
    ]);

    // Update transaction status
    $transaction->update([
      'status' => 'success',
      'completed_at' => now(),
    ]);
  }

  /**
   * Process purchase transaction
   * 
   * @param Transaction $transaction
   */
  private function processPurchase($transaction)
  {
    // Update transaction to processing
    $transaction->update([
      'status' => 'processing',
      'processed_at' => now(),
    ]);

    // Dispatch appropriate job based on payment type
    if ($transaction->prepaid_postpaid_type === 'postpaid') {
      // Dispatch postpaid payment job
      \App\Jobs\ProcessPostpaidPayment::dispatch($transaction);
    } else {
      // Dispatch prepaid order job (default)
      ProcessDigiflazzOrder::dispatch($transaction);
    }
  }
}
