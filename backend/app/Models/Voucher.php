<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'type',
        'value',
        'min_transaction',
        'max_discount',
        'usage_limit',
        'usage_count',
        'user_limit',
        'product_id',
        'customer_type',
        'is_active',
        'start_date',
        'end_date',
        'description',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_transaction' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'usage_limit' => 'integer',
        'usage_count' => 'integer',
        'user_limit' => 'integer',
        'product_id' => 'integer',
        'is_active' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get all voucher usages
     */
    public function usages()
    {
        return $this->hasMany(VoucherUsage::class);
    }

    /**
     * Get the associated product (if any)
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include active vouchers
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')
                    ->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereRaw('usage_count < usage_limit');
            });
    }

    // ==================== METHODS ====================

    /**
     * Check if voucher is valid
     */
    public function isValid()
    {
        return $this->is_active
            && (is_null($this->start_date) || $this->start_date <= now())
            && (is_null($this->end_date) || $this->end_date >= now())
            && (is_null($this->usage_limit) || $this->usage_count < $this->usage_limit);
    }

    /**
     * Calculate discount amount
     */
    public function calculateDiscount($transactionAmount)
    {
        if ($transactionAmount < $this->min_transaction) {
            return 0;
        }

        if ($this->type === 'percentage') {
            $discount = ($transactionAmount * $this->value) / 100;

            return $this->max_discount ? min($discount, $this->max_discount) : $discount;
        }

        // Fixed amount
        return $this->value;
    }

    /**
     * Increment usage count
     */
    public function incrementUsage()
    {
        $this->increment('usage_count');
    }
}
