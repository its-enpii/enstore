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
        'balance' => 0,
        'hold_balance' => 0,
      ]);
    }

    return $balance;
  }

  /**
   * Get available balance (balance - hold_balance)
   * 
   * @param User $user
   * @return float
   */
  public function getAvailableBalance(User $user)
  {
    $balance = $this->getOrCreateBalance($user);
    return $balance->balance - $balance->hold_balance;
  }

  /**
   * Check if user has sufficient balance
   * 
   * @param User $user
   * @param float $balance
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
   * @param float $balance
   * @param string $description
   * @param Transaction|null $transaction
   * @return BalanceMutation
   * @throws \Exception
   */
  public function addBalance(User $user, $amount, $description, $transaction = null)
  {
    if ($amount <= 0) {
      throw new \Exception('balance must be greater than 0');
    }

    DB::beginTransaction();

    try {
      $balance = $this->getOrCreateBalance($user);

      $balanceBefore = $balance->balance;
      $balanceAfter = $balanceBefore + $amount;

      // Update balance
      Balance::where('id',$balance->id)->update([
        'balance' => $balanceAfter,
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

      return $mutation;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to add balance', [
        'user_id' => $user->id,
        'balance' => $balance,
        'error' => $e->getMessage(),
      ]);
      throw $e;
    }
  }

  /**
   * Deduct balance (debit)
   * 
   * @param User $user
   * @param float $balance
   * @param string $description
   * @param Transaction|null $transaction
   * @return BalanceMutation
   * @throws \Exception
   */
  public function deductBalance(User $user, $amount, $description, $transaction = null)
  {
    if ($amount <= 0) {
      throw new \Exception('balance must be greater than 0');
    }

    if (!$this->hasSufficientBalance($user, $amount)) {
      throw new \Exception('Insufficient balance');
    }

    DB::beginTransaction();

    try {
      $balance = $this->getOrCreateBalance($user);

      $balanceBefore = $balance->balance;
      $balanceAfter = $balanceBefore - $amount;

      // Update balance
      Balance::where('id',$balance->id)->update([
        'balance' => $balanceAfter,
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



      return $mutation;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to deduct balance', [
        'user_id' => $user->id,
        'balance' => $balance,
        'error' => $e->getMessage(),
      ]);
      throw $e;
    }
  }

  /**
   * Hold balance (reserve for pending transaction)
   * 
   * @param User $user
   * @param float $balance
   * @return void
   * @throws \Exception
   */
  public function holdBalance(User $user, $amount)
  {
    if ($amount <= 0) {
      throw new \Exception('balance must be greater than 0');
    }

    if (!$this->hasSufficientBalance($user, $amount)) {
      throw new \Exception('Insufficient balance');
    }

    $balance = $this->getOrCreateBalance($user);

    $balance->increment('hold_balance', $amount);
  }

  /**
   * Release held balance
   * 
   * @param User $user
   * @param float $balance
   * @return void
   */
  public function releaseHoldBalance(User $user, $amount)
  {
    if ($amount <= 0) {
      return;
    }

    $balance = $this->getOrCreateBalance($user);

    $balance->decrement('hold_balance', $amount);
  }

  /**
   * Deduct from held balance
   * 
   * @param User $user
   * @param float $balance
   * @param string $description
   * @param Transaction|null $transaction
   * @return BalanceMutation
   * @throws \Exception
   */
  public function deductFromHold(User $user, $amount, $description, $transaction = null)
  {
    if ($amount <= 0) {
      throw new \Exception('balance must be greater than 0');
    }

    DB::beginTransaction();

    try {
      $balance = $this->getOrCreateBalance($user);

      if ($balance->hold_balance < $amount) {
        throw new \Exception('Insufficient hold balance');
      }

      $balanceBefore = $balance->balance;
      $balanceAfter = $balanceBefore - $amount;

      // Update balance and hold
      Balance::where('id',$balance->id)->update([
        'balance' => $balanceAfter,
        'hold_balance' => $balance->hold_balance - $amount,
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



      return $mutation;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to deduct from hold balance', [
        'user_id' => $user->id,
        'balance' => $balance,
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
