<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'payment_code',
        'payment_method',
        'payment_channel',
        'amount',
        'fee',
        'total_amount',
        'status',
        'payment_url',
        'qr_code_url',
        'va_number',
        'expired_at',
        'paid_at',
        'meta_data',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'expired_at' => 'datetime',
        'paid_at' => 'datetime',
        'meta_data' => 'array',
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
