<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'payment_reference',
        'payment_code',
        'payment_method',
        'payment_channel',
        'amount',
        'fee',
        'total_amount',
        'status',
        'checkout_url',
        'qr_url',
        'expired_at',
        'paid_at',
        'payment_instructions',
        'tripay_merchant_ref',
        'tripay_customer_name',
        'tripay_customer_email',
        'tripay_customer_phone',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'expired_at' => 'datetime',
        'paid_at' => 'datetime',
        'payment_instructions' => 'array',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the transaction that owns the payment
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Get all payment callbacks
     */
    public function callbacks()
    {
        return $this->hasMany(PaymentCallback::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include paid payments
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope a query to only include pending payments
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // ==================== ACCESSORS ====================

    /**
     * Check if payment is paid
     */
    public function isPaid()
    {
        return $this->status === 'paid';
    }

    /**
     * Check if payment is expired
     */
    public function isExpired()
    {
        return $this->expired_at && $this->expired_at->isPast();
    }
}
