<?php

namespace App\Services;

use App\Models\User;
use App\Models\Balance;
use App\Models\BalanceMutation;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BalanceService
{
  /**
   * Get or create user balance
   * 
   * @param User $user
   * @return Balance
   */
  public function getOrCreateBalance(User $user)
  {
    $balance = $user->balance;

    if (!$balance) {
      $balance = Balance::create([
        'user_id' => $user->id,
        'amount' => 0,
        'hold_amount' => 0,
      ]);

      Log::info('Balance created for user', [
        'user_id' => $user->id,
        'balance_id' => $balance->id,
      ]);
    }

    return $balance;
  }

  /**
   * Get available balance (amount - hold_amount)
   * 
   * @param User $user
   * @return float
   */
  public function getAvailableBalance(User $user)
  {
    $balance = $this->getOrCreateBalance($user);
    return $balance->amount - $balance->hold_amount;
  }

  /**
   * Check if user has sufficient balance
   * 
   * @param User $user
   * @param float $amount
   * @return bool
   */
  public function hasSufficientBalance(User $user, $amount)
  {
    $availableBalance = $this->getAvailableBalance($user);
    return $availableBalance >= $amount;
  }

  /**
   * Add balance (credit)
   * 
   * @param User $user
   * @param float $amount
   * @param string $description
   * @param Transaction|null $transaction
   * @return BalanceMutation
   * @throws \Exception
   */
  public function addBalance(User $user, $amount, $description, $transaction = null)
  {
    if ($amount <= 0) {
      throw new \Exception('Amount must be greater than 0');
    }

    DB::beginTransaction();

    try {
      $balance = $this->getOrCreateBalance($user);

      $balanceBefore = $balance->amount;
      $balanceAfter = $balanceBefore + $amount;

      // Update balance
      $balance->update([
        'amount' => $balanceAfter,
      ]);

      // Create mutation record
      $mutation = BalanceMutation::create([
        'balance_id' => $balance->id,
        'transaction_id' => $transaction ? $transaction->id : null,
        'type' => 'credit',
        'amount' => $amount,
        'balance_before' => $balanceBefore,
        'balance_after' => $balanceAfter,
        'description' => $description,
      ]);

      DB::commit();

      Log::info('Balance added', [
        'user_id' => $user->id,
        'amount' => $amount,
        'balance_before' => $balanceBefore,
        'balance_after' => $balanceAfter,
        'description' => $description,
      ]);

      return $mutation;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to add balance', [
        'user_id' => $user->id,
        'amount' => $amount,
        'error' => $e->getMessage(),
      ]);
      throw $e;
    }
  }

  /**
   * Deduct balance (debit)
   * 
   * @param User $user
   * @param float $amount
   * @param string $description
   * @param Transaction|null $transaction
   * @return BalanceMutation
   * @throws \Exception
   */
  public function deductBalance(User $user, $amount, $description, $transaction = null)
  {
    if ($amount <= 0) {
      throw new \Exception('Amount must be greater than 0');
    }

    if (!$this->hasSufficientBalance($user, $amount)) {
      throw new \Exception('Insufficient balance');
    }

    DB::beginTransaction();

    try {
      $balance = $this->getOrCreateBalance($user);

      $balanceBefore = $balance->amount;
      $balanceAfter = $balanceBefore - $amount;

      // Update balance
      $balance->update([
        'amount' => $balanceAfter,
      ]);

      // Create mutation record
      $mutation = BalanceMutation::create([
        'balance_id' => $balance->id,
        'transaction_id' => $transaction ? $transaction->id : null,
        'type' => 'debit',
        'amount' => $amount,
        'balance_before' => $balanceBefore,
        'balance_after' => $balanceAfter,
        'description' => $description,
      ]);

      DB::commit();

      Log::info('Balance deducted', [
        'user_id' => $user->id,
        'amount' => $amount,
        'balance_before' => $balanceBefore,
        'balance_after' => $balanceAfter,
        'description' => $description,
      ]);

      return $mutation;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to deduct balance', [
        'user_id' => $user->id,
        'amount' => $amount,
        'error' => $e->getMessage(),
      ]);
      throw $e;
    }
  }

  /**
   * Hold balance (reserve for pending transaction)
   * 
   * @param User $user
   * @param float $amount
   * @return void
   * @throws \Exception
   */
  public function holdBalance(User $user, $amount)
  {
    if ($amount <= 0) {
      throw new \Exception('Amount must be greater than 0');
    }

    if (!$this->hasSufficientBalance($user, $amount)) {
      throw new \Exception('Insufficient balance');
    }

    $balance = $this->getOrCreateBalance($user);

    $balance->increment('hold_amount', $amount);

    Log::info('Balance held', [
      'user_id' => $user->id,
      'amount' => $amount,
      'hold_amount' => $balance->fresh()->hold_amount,
    ]);
  }

  /**
   * Release held balance
   * 
   * @param User $user
   * @param float $amount
   * @return void
   */
  public function releaseHoldBalance(User $user, $amount)
  {
    if ($amount <= 0) {
      return;
    }

    $balance = $this->getOrCreateBalance($user);

    $balance->decrement('hold_amount', $amount);

    Log::info('Balance hold released', [
      'user_id' => $user->id,
      'amount' => $amount,
      'hold_amount' => $balance->fresh()->hold_amount,
    ]);
  }

  /**
   * Deduct from held balance
   * 
   * @param User $user
   * @param float $amount
   * @param string $description
   * @param Transaction|null $transaction
   * @return BalanceMutation
   * @throws \Exception
   */
  public function deductFromHold(User $user, $amount, $description, $transaction = null)
  {
    if ($amount <= 0) {
      throw new \Exception('Amount must be greater than 0');
    }

    DB::beginTransaction();

    try {
      $balance = $this->getOrCreateBalance($user);

      if ($balance->hold_amount < $amount) {
        throw new \Exception('Insufficient hold balance');
      }

      $balanceBefore = $balance->amount;
      $balanceAfter = $balanceBefore - $amount;

      // Update balance and hold
      $balance->update([
        'amount' => $balanceAfter,
        'hold_amount' => $balance->hold_amount - $amount,
      ]);

      // Create mutation record
      $mutation = BalanceMutation::create([
        'balance_id' => $balance->id,
        'transaction_id' => $transaction ? $transaction->id : null,
        'type' => 'debit',
        'amount' => $amount,
        'balance_before' => $balanceBefore,
        'balance_after' => $balanceAfter,
        'description' => $description,
      ]);

      DB::commit();

      Log::info('Balance deducted from hold', [
        'user_id' => $user->id,
        'amount' => $amount,
        'balance_before' => $balanceBefore,
        'balance_after' => $balanceAfter,
      ]);

      return $mutation;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to deduct from hold balance', [
        'user_id' => $user->id,
        'amount' => $amount,
        'error' => $e->getMessage(),
      ]);
      throw $e;
    }
  }

  /**
   * Get balance mutations history
   * 
   * @param User $user
   * @param int $limit
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getMutations(User $user, $limit = 50)
  {
    $balance = $this->getOrCreateBalance($user);

    return BalanceMutation::where('balance_id', $balance->id)
      ->with('transaction')
      ->orderBy('created_at', 'desc')
      ->limit($limit)
      ->get();
  }
}
