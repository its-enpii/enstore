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
        'product_id',
        'customer_type',
        'payment_type',
        'transaction_type',
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
    ];

    protected $casts = [
        'product_price' => 'decimal:2',
        'admin_fee' => 'decimal:2',
        'total_price' => 'decimal:2',
        'customer_data' => 'array',
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
     * Get the product associated with the transaction
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
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
     * Check if payment is paid
     */
    public function isPaid()
    {
        return $this->payment_status === 'paid';
    }
}
