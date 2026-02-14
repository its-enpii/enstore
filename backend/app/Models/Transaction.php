<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_code',
        'user_id',
        'product_item_id',
        'customer_type',
        'payment_method_type',
        'transaction_type',
        'prepaid_postpaid_type',
        'inquiry_ref',
        'bill_data',
        'product_name',
        'product_code',
        'product_price',
        'admin_fee',
        'total_price',
        'customer_data',
        'customer_note',
        'payment_method',
        'payment_status',
        'status',
        'digiflazz_trx_id',
        'digiflazz_serial_number',
        'digiflazz_message',
        'digiflazz_status',
        'digiflazz_rc',
        'paid_at',
        'processed_at',
        'completed_at',
        'failed_at',
        'refunded_at',
        'expired_at',
        'failed_reason',
    ];

    protected $casts = [
        'product_price' => 'decimal:2',
        'admin_fee' => 'decimal:2',
        'total_price' => 'decimal:2',
        'customer_data' => 'array',
        'bill_data' => 'array',
        'paid_at' => 'datetime',
        'processed_at' => 'datetime',
        'completed_at' => 'datetime',
        'failed_at' => 'datetime',
        'refunded_at' => 'datetime',
        'expired_at' => 'datetime',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user that owns the transaction
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product item associated with the transaction
     */
    public function productItem()
    {
        return $this->belongsTo(ProductItem::class);
    }

    /**
     * Get the parent product (via product item)
     */
    public function product()
    {
        return $this->hasOneThrough(
            Product::class,
            ProductItem::class,
            'id', // Foreign key on product_items table
            'id', // Foreign key on products table
            'product_item_id', // Local key on transactions table
            'product_id' // Local key on product_items table
        );
    }

    /**
     * Get the payment for this transaction
     */
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Get all transaction logs
     */
    public function logs()
    {
        return $this->hasMany(TransactionLog::class);
    }

    /**
     * Get all balance mutations related to this transaction
     */
    public function balanceMutations()
    {
        return $this->hasMany(BalanceMutation::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include successful transactions
     */
    public function scopeSuccess($query)
    {
        return $query->where('status', 'success');
    }

    /**
     * Scope a query to only include pending transactions
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include failed transactions
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope a query to only include purchase transactions
     */
    public function scopePurchase($query)
    {
        return $query->where('transaction_type', 'purchase');
    }

    /**
     * Scope a query to only include topup transactions
     */
    public function scopeTopup($query)
    {
        return $query->where('transaction_type', 'topup');
    }

    /**
     * Scope a query to only include prepaid transactions
     */
    public function scopePrepaid($query)
    {
        return $query->where('prepaid_postpaid_type', 'prepaid');
    }

    /**
     * Scope a query to only include postpaid transactions
     */
    public function scopePostpaid($query)
    {
        return $query->where('prepaid_postpaid_type', 'postpaid');
    }

    // ==================== ACCESSORS ====================

    /**
     * Check if transaction is successful
     */
    public function isSuccess()
    {
        return $this->status === 'success';
    }

    /**
     * Check if transaction is pending
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if transaction is failed
     */
    public function isFailed()
    {
        return $this->status === 'failed';
    }

    /**
     * Check if transaction is refunded
     */
    public function isRefunded()
    {
        return $this->status === 'refunded' || $this->refunded_at !== null;
    }

    /**
     * Check if payment is paid
     */
    public function isPaid()
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Scope a query to only include refunded transactions
     */
    public function scopeRefunded($query)
    {
        return $query->where('status', 'refunded');
    }
}
