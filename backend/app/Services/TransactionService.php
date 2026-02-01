<?php

namespace App\Services;

use App\Models\User;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionLog;
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
      $code = 'TRX-' . date('Ymd') . '-' . strtoupper(Str::random(6));
    } while (Transaction::where('transaction_code', $code)->exists());

    return $code;
  }

  /**
   * Create purchase transaction (via payment gateway)
   * 
   * @param User $user
   * @param Product $product
   * @param array $customerData
   * @param string $paymentMethod
   * @return Transaction
   * @throws \Exception
   */
  public function createPurchaseTransaction(
    ?User $user,
    Product $product,
    array $customerData,
    string $paymentMethod
  ) {
    // Validate product availability
    $availability = $this->productService->checkAvailability($product);
    if (!$availability['available']) {
      throw new \Exception($availability['reason']);
    }

    DB::beginTransaction();

    try {
      // Get price
      $customerType = $user ? $user->customer_type : 'retail';
      $price = $this->productService->getPrice($product, $customerType);
      $adminFee = $this->getAdminFee($paymentMethod);
      $totalPrice = $price + $adminFee;

      // Create transaction
      $transaction = Transaction::create([
        'transaction_code' => $this->generateTransactionCode(),
        'user_id' => $user ? $user->id : null,
        'product_id' => $product->id,
        'customer_type' => $customerType,
        'payment_type' => 'gateway',
        'transaction_type' => 'purchase',
        'product_name' => $product->name,
        'product_code' => $product->digiflazz_code,
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

      Log::info('Purchase transaction created', [
        'transaction_code' => $transaction->transaction_code,
        'user_id' => $user ? $user->id : 'guest',
        'product_id' => $product->id,
        'total_price' => $totalPrice,
      ]);

      return $transaction;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to create purchase transaction', [
        'user_id' => $user ? $user->id : 'guest',
        'product_id' => $product->id,
        'error' => $e->getMessage(),
      ]);
      throw $e;
    }
  }

  /**
   * Create purchase transaction (via balance)
   * 
   * @param User $user
   * @param Product $product
   * @param array $customerData
   * @return Transaction
   * @throws \Exception
   */
  public function createBalancePurchaseTransaction(
    User $user,
    Product $product,
    array $customerData
  ) {
    // Validate product availability
    $availability = $this->productService->checkAvailability($product);
    if (!$availability['available']) {
      throw new \Exception($availability['reason']);
    }

    // Get price
    $price = $this->productService->getPrice($product, $user->customer_type);

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
        'product_id' => $product->id,
        'customer_type' => $user->customer_type,
        'payment_type' => 'balance',
        'transaction_type' => 'purchase',
        'product_name' => $product->name,
        'product_code' => $product->digiflazz_code,
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
        'Purchase: ' . $product->name,
        $transaction
      );

      // Log transaction creation
      $this->addLog($transaction, 'created', 'Transaction created via balance', [
        'balance_deducted' => $price,
      ]);

      DB::commit();

      Log::info('Balance purchase transaction created', [
        'transaction_code' => $transaction->transaction_code,
        'user_id' => $user->id,
        'product_id' => $product->id,
        'price' => $price,
      ]);

      return $transaction;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to create balance purchase transaction', [
        'user_id' => $user->id,
        'product_id' => $product->id,
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
        'payment_type' => 'gateway',
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

      Log::info('Topup transaction created', [
        'transaction_code' => $transaction->transaction_code,
        'user_id' => $user->id,
        'amount' => $amount,
        'total_price' => $totalPrice,
      ]);

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

    Log::info('Transaction status updated', [
      'transaction_code' => $transaction->transaction_code,
      'old_status' => $transaction->getOriginal('status'),
      'new_status' => $status,
    ]);
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

    // Increment product total sold
    if ($transaction->product_id) {
      $this->productService->incrementTotalSold($transaction->product);
    }
  }

  /**
   * Mark transaction as failed
   * 
   * @param Transaction $transaction
   * @param string $reason
   * @return void
   */
  public function markAsFailed(Transaction $transaction, string $reason = null)
  {
    $this->updateStatus($transaction, 'failed', [
      'failed_at' => now(),
      'failed_reason' => $reason,
    ]);
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
      ->with(['product', 'payment']);

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

    // Sort
    $query->orderBy('created_at', 'desc');

    return $query->paginate($filters['per_page'] ?? 20);
  }
}
