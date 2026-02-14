<?php

namespace App\Services;

use App\Models\User;
use App\Models\Product;
use App\Models\ProductItem;
use App\Models\Transaction;
use App\Models\TransactionLog;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TransactionService
{
  protected $productService;
  protected $balanceService;

  public function __construct(
    ProductService $productService,
    BalanceService $balanceService
  ) {
    $this->productService = $productService;
    $this->balanceService = $balanceService;
  }

  /**
   * Generate unique transaction code
   * 
   * @return string
   */
  public function generateTransactionCode()
  {
    do {
      $code = 'ENS-' . date('Ymd') . '-' . strtoupper(Str::random(6));
    } while (Transaction::where('transaction_code', $code)->exists());

    return $code;
  }

  /**
   * Create purchase transaction (via payment gateway)
   * 
   * @param User $user
   * @param ProductItem $productItem
   * @param array $customerData
   * @param string $paymentMethod
   * @return Transaction
   * @throws \Exception
   */
  public function createPurchaseTransaction(
    ?User $user,
    ProductItem $productItem,
    array $customerData,
    string $paymentMethod
  ) {
    // Validate product item availability
    if (!$productItem->isAvailable()) {
      throw new \Exception('Product is not available');
    }

    DB::beginTransaction();

    try {
      // Get price
      $customerType = $user ? $user->customer_type : 'retail';
      $price = $productItem->getPriceForCustomer($customerType);
      $adminFee = $this->getAdminFee($paymentMethod);
      $totalPrice = $price + $adminFee;

      // Create transaction
      $transaction = Transaction::create([
        'transaction_code' => $this->generateTransactionCode(),
        'user_id' => $user ? $user->id : null,
        'product_item_id' => $productItem->id,
        'customer_type' => $customerType,
        'payment_method_type' => 'gateway',
        'transaction_type' => 'purchase',
        'product_name' => $productItem->product->name . ' - ' . $productItem->name,
        'product_code' => $productItem->digiflazz_code,
        'product_price' => $price,
        'admin_fee' => $adminFee,
        'total_price' => $totalPrice,
        'customer_data' => $customerData,
        'payment_method' => $paymentMethod,
        'status' => 'pending',
        'payment_status' => 'pending',
        'expired_at' => now()->addHours(2),
      ]);

      // Log transaction creation
      $this->addLog($transaction, 'created', 'Transaction created', [
        'payment_method' => $paymentMethod,
      ]);

      DB::commit();

      return $transaction;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to create purchase transaction', [
        'user_id' => $user ? $user->id : 'guest',
        'product_item_id' => $productItem->id,
        'error' => $e->getMessage(),
      ]);
      throw $e;
    }
  }

  /**
   * Create purchase transaction (via balance)
   * 
   * @param User $user
   * @param ProductItem $productItem
   * @param array $customerData
   * @return Transaction
   * @throws \Exception
   */
  public function createBalancePurchaseTransaction(
    User $user,
    ProductItem $productItem,
    array $customerData
  ) {
    // Validate product item availability
    if (!$productItem->isAvailable()) {
      throw new \Exception('Product is not available');
    }

    // Get price
    $price = $productItem->getPriceForCustomer($user->customer_type);

    // Check balance
    if (!$this->balanceService->hasSufficientBalance($user, $price)) {
      throw new \Exception('Insufficient balance');
    }

    DB::beginTransaction();

    try {
      // Create transaction
      $transaction = Transaction::create([
        'transaction_code' => $this->generateTransactionCode(),
        'user_id' => $user->id,
        'product_item_id' => $productItem->id,
        'customer_type' => $user->customer_type,
        'payment_method_type' => 'balance',
        'transaction_type' => 'purchase',
        'product_name' => $productItem->product->name . ' - ' . $productItem->name,
        'product_code' => $productItem->digiflazz_code,
        'product_price' => $price,
        'admin_fee' => 0,
        'total_price' => $price,
        'customer_data' => $customerData,
        'payment_method' => 'balance',
        'status' => 'processing',
        'payment_status' => 'paid',
        'paid_at' => now(),
      ]);

      // Deduct balance
      $this->balanceService->deductBalance(
        $user,
        $price,
        'Purchase: ' . $productItem->product->name . ' - ' . $productItem->name,
        $transaction
      );

      // Log transaction creation
      $this->addLog($transaction, 'created', 'Transaction created via balance', [
        'balance_deducted' => $price,
      ]);

      DB::commit();

      return $transaction;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to create balance purchase transaction', [
        'user_id' => $user->id,
        'product_item_id' => $productItem->id,
        'error' => $e->getMessage(),
      ]);
      throw $e;
    }
  }

  /**
   * Create topup transaction
   * 
   * @param User $user
   * @param float $amount
   * @param string $paymentMethod
   * @return Transaction
   * @throws \Exception
   */
  public function createTopupTransaction(
    User $user,
    float $amount,
    string $paymentMethod
  ) {
    if ($amount < 10000) {
      throw new \Exception('Minimum topup amount is Rp 10.000');
    }

    DB::beginTransaction();

    try {
      $adminFee = $this->getAdminFee($paymentMethod);
      $totalPrice = $amount + $adminFee;

      // Create transaction
      $transaction = Transaction::create([
        'transaction_code' => $this->generateTransactionCode(),
        'user_id' => $user->id,
        'product_id' => null,
        'customer_type' => $user->customer_type,
        'payment_method_type' => 'gateway',
        'transaction_type' => 'topup',
        'product_name' => 'Top Up Saldo',
        'product_code' => 'TOPUP',
        'product_price' => $amount,
        'admin_fee' => $adminFee,
        'total_price' => $totalPrice,
        'customer_data' => [],
        'payment_method' => $paymentMethod,
        'status' => 'pending',
        'payment_status' => 'pending',
        'expired_at' => now()->addHours(2),
      ]);

      // Log transaction creation
      $this->addLog($transaction, 'created', 'Topup transaction created', [
        'amount' => $amount,
        'payment_method' => $paymentMethod,
      ]);

      DB::commit();

      return $transaction;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to create topup transaction', [
        'user_id' => $user->id,
        'amount' => $amount,
        'error' => $e->getMessage(),
      ]);
      throw $e;
    }
  }

  /**
   * Cancel transaction (customer/system initiated)
   * 
   * @param Transaction $transaction
   * @param string $reason
   * @return void
   * @throws \Exception
   */
  public function cancelTransaction(Transaction $transaction, string $reason = 'Cancelled by user')
  {
    if (!in_array($transaction->status, ['pending', 'unpaid'])) {
      throw new \Exception('Transaction cannot be cancelled');
    }

    $this->markAsFailed($transaction, $reason);
  }

  /**
   * Update transaction status
   * 
   * @param Transaction $transaction
   * @param string $status
   * @param array $data
   * @return void
   */
  public function updateStatus(Transaction $transaction, string $status, array $data = [])
  {
    $transaction->update(array_merge(['status' => $status], $data));

    $this->addLog($transaction, 'status_updated', "Status updated to: {$status}", $data);
  }

  /**
   * Mark transaction as success
   * 
   * @param Transaction $transaction
   * @param array $data
   * @return void
   */
  public function markAsSuccess(Transaction $transaction, array $data = [])
  {
    $this->updateStatus($transaction, 'success', array_merge([
      'completed_at' => now(),
    ], $data));

    // Increment product item total sold
    if ($transaction->product_item_id && $transaction->productItem) {
      $transaction->productItem->incrementSold();
    }
  }

  /**
   * Mark transaction as failed
   * 
   * @param Transaction $transaction
   * @param string $reason
   * @param bool $autoRefund Whether to automatically refund (for balance payments)
   * @return void
   */
  public function markAsFailed(Transaction $transaction, ?string $reason = null, bool $autoRefund = false)
  {
    $this->updateStatus($transaction, 'failed', [
      'failed_at' => now(),
      'failed_reason' => $reason,
    ]);

    // Auto-refund for balance payments when order fails at provider
    if ($autoRefund && $transaction->payment_method_type === 'balance' && $transaction->user_id) {
      $this->refundTransaction($transaction, 'Auto-refund: ' . ($reason ?? 'Transaction failed'));
    }
  }

  /**
   * Refund a transaction
   * Supports both balance and gateway payments.
   * For gateway payments, the refund is credited to the user's balance.
   * 
   * @param Transaction $transaction
   * @param string $reason
   * @return bool
   * @throws \Exception
   */
  public function refundTransaction(Transaction $transaction, string $reason = 'Refund by system')
  {
    // Validate: Can only refund failed or processing transactions
    if (!in_array($transaction->status, ['failed', 'processing', 'success'])) {
      throw new \Exception('Transaction cannot be refunded in current status: ' . $transaction->status);
    }

    // Validate: Cannot refund if already refunded
    if ($transaction->refunded_at) {
      throw new \Exception('Transaction has already been refunded');
    }

    // Must have a user to refund to
    if (!$transaction->user_id) {
      Log::warning('Cannot refund transaction without user', [
        'transaction_code' => $transaction->transaction_code,
      ]);
      throw new \Exception('Cannot refund: no user associated with this transaction');
    }

    DB::beginTransaction();

    try {
      $user = $transaction->user;
      $refundAmount = $transaction->total_price;

      // Add balance back to user
      $this->balanceService->addBalance(
        $user,
        $refundAmount,
        'Refund: ' . $transaction->transaction_code . ' - ' . $reason,
        $transaction
      );

      // Update transaction status
      $transaction->update([
        'status' => 'refunded',
        'refunded_at' => now(),
      ]);

      // Log the refund
      $this->addLog($transaction, 'refunded', 'Transaction refunded: ' . $reason, [
        'refund_amount' => $refundAmount,
        'refund_method' => 'balance',
        'original_payment_method' => $transaction->payment_method_type,
      ]);

      // Create notification
      if ($transaction->user_id) {
        Notification::create([
          'user_id' => $transaction->user_id,
          'title' => 'Refund Berhasil',
          'message' => "Dana sebesar Rp " . number_format($refundAmount, 0, ',', '.') . " telah dikembalikan ke saldo Anda untuk transaksi {$transaction->transaction_code}.",
          'type' => 'success',
          'data' => [
            'transaction_code' => $transaction->transaction_code,
            'refund_amount' => $refundAmount,
          ],
        ]);
      }

      DB::commit();

      Log::info('Transaction refunded successfully', [
        'transaction_code' => $transaction->transaction_code,
        'user_id' => $user->id,
        'refund_amount' => $refundAmount,
      ]);

      return true;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Refund Transaction Error', [
        'transaction_code' => $transaction->transaction_code,
        'error' => $e->getMessage(),
      ]);
      throw $e;
    }
  }

  /**
   * Add transaction log
   * 
   * @param Transaction $transaction
   * @param string $action
   * @param string $description
   * @param array $data
   * @return TransactionLog
   */
  public function addLog(Transaction $transaction, string $action, string $description, array $data = [])
  {
    return TransactionLog::create([
      'transaction_id' => $transaction->id,
      'action' => $action,
      'description' => $description,
      'data' => $data,
    ]);
  }

  /**
   * Get admin fee based on payment method
   * 
   * @param string $paymentMethod
   * @return float
   */
  private function getAdminFee(string $paymentMethod)
  {
    // You can customize this based on payment method
    $fees = [
      'QRIS' => 0,
      'BRIVA' => 4000,
      'BCAVA' => 4000,
      'BNIVA' => 4000,
      'MANDIRIVA' => 4000,
      'PERMATAVA' => 4000,
      'OVO' => 0,
      'DANA' => 0,
      'SHOPEEPAY' => 0,
    ];

    return $fees[$paymentMethod] ?? 1500;
  }

  /**
   * Get user transactions
   * 
   * @param User $user
   * @param array $filters
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getUserTransactions(User $user, array $filters = [])
  {
    $query = Transaction::where('user_id', $user->id)
      ->with(['productItem.product', 'payment']);

    // Filter by type
    if (!empty($filters['type'])) {
      $query->where('transaction_type', $filters['type']);
    }

    // Filter by status
    if (!empty($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    // Filter by date range
    if (!empty($filters['start_date'])) {
      $query->whereDate('created_at', '>=', $filters['start_date']);
    }

    if (!empty($filters['end_date'])) {
      $query->whereDate('created_at', '<=', $filters['end_date']);
    }

    // Search by code or product name
    if (!empty($filters['search'])) {
      $search = $filters['search'];
      $query->where(function ($q) use ($search) {
        $q->where('transaction_code', 'like', "%{$search}%")
          ->orWhere('product_name', 'like', "%{$search}%");
      });
    }

    // Sort
    $query->orderBy('created_at', 'desc');

    return $query->paginate($filters['per_page'] ?? 20);
  }

  /**
   * Create postpaid transaction (PPOB)
   * 
   * @param array $data
   * @return Transaction
   * @throws \Exception
   */
  public function createPostpaidTransaction(array $data)
  {
    DB::beginTransaction();

    try {
      $productItem = ProductItem::findOrFail($data['product_item_id']);

      // Validate product is postpaid
      if ($productItem->product->payment_type !== 'postpaid') {
        throw new \Exception('Product is not a postpaid product');
      }

      // Create transaction
      $transaction = Transaction::create([
        'transaction_code' => $this->generateTransactionCode(),
        'user_id' => $data['user_id'] ?? null,
        'product_item_id' => $productItem->id,
        'customer_type' => $data['customer_type'] ?? 'retail',
        'payment_method_type' => 'gateway',
        'prepaid_postpaid_type' => 'postpaid',
        'transaction_type' => 'purchase',
        'product_name' => $productItem->product->name . ' - ' . $productItem->name,
        'product_code' => $productItem->digiflazz_code,
        'product_price' => $data['total_price'],
        'admin_fee' => 0,
        'total_price' => $data['total_price'],
        'customer_data' => $data['customer_data'],
        'inquiry_ref' => $data['inquiry_ref'],
        'bill_data' => $data['bill_data'],
        'payment_method' => 'gateway',
        'status' => 'pending',
        'payment_status' => 'pending',
        'expired_at' => now()->addHours(2),
      ]);

      // Log transaction creation
      $this->addLog($transaction, 'created', 'Postpaid transaction created', [
        'inquiry_ref' => $data['inquiry_ref'],
        'bill_data' => $data['bill_data'],
      ]);

      DB::commit();

      return $transaction;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Create Postpaid Transaction Error: ' . $e->getMessage());
      throw $e;
    }
  }
}
