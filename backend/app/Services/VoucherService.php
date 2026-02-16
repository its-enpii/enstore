<?php

namespace App\Services;

use App\Models\Voucher;
use App\Models\VoucherUsage;
use App\Models\User;
use App\Models\ProductItem;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class VoucherService
{
    /**
     * Validate voucher eligibility for a transaction.
     * 
     * @param string $code
     * @param User|null $user
     * @param ProductItem $productItem
     * @param float $transactionAmount
     * @return Voucher
     * @throws \Exception
     */
    public function validateVoucher(string $code, ?User $user, ProductItem $productItem, float $transactionAmount)
    {
        $voucher = Voucher::where('code', $code)->first();

        if (!$voucher) {
            throw new \Exception('Voucher code not found');
        }

        if (!$voucher->isValid()) {
            throw new \Exception('Voucher is expired or has reached its usage limit');
        }

        // Check Minimum Transaction
        if ($transactionAmount < $voucher->min_transaction) {
            throw new \Exception('Minimum transaction for this voucher is Rp ' . number_format($voucher->min_transaction, 0, ',', '.'));
        }

        // Check Product Restriction
        if ($voucher->product_id && $voucher->product_id !== $productItem->product_id) {
            throw new \Exception('This voucher is not valid for this product');
        }

        // Check Customer Type Restriction
        if ($voucher->customer_type !== 'all') {
            $customerType = $user ? $user->customer_type : 'retail';
            if ($voucher->customer_type !== $customerType) {
                throw new \Exception('This voucher is only valid for ' . $voucher->customer_type . ' customers');
            }
        }

        // Check User specific limit if user is logged in
        if ($user) {
            $userUsageCount = VoucherUsage::where('voucher_id', $voucher->id)
                                         ->where('user_id', $user->id)
                                         ->count();
            
            if ($userUsageCount >= $voucher->user_limit) {
                throw new \Exception('You have reached the usage limit for this voucher');
            }
        }

        return $voucher;
    }

    /**
     * Record voucher usage for a transaction.
     * 
     * @param Voucher $voucher
     * @param Transaction $transaction
     * @param float $discountAmount
     * @return VoucherUsage
     */
    public function recordUsage(Voucher $voucher, Transaction $transaction, float $discountAmount)
    {
        return DB::transaction(function () use ($voucher, $transaction, $discountAmount) {
            // Increment usage count in voucher table
            $voucher->incrementUsage();

            // Create usage record
            return VoucherUsage::create([
                'voucher_id' => $voucher->id,
                'user_id' => $transaction->user_id,
                'transaction_id' => $transaction->id,
                'discount_amount' => $discountAmount,
            ]);
        });
    }

    /**
     * Calculate discount amount for a voucher.
     * 
     * @param Voucher $voucher
     * @param float $transactionAmount
     * @return float
     */
    public function calculateDiscount(Voucher $voucher, float $transactionAmount)
    {
        return $voucher->calculateDiscount($transactionAmount);
    }
}
