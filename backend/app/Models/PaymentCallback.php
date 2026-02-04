<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaymentCallback extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'callback_data',
        'signature',
        'ip_address',
        'is_valid',
        'processed',
    ];

    protected $casts = [
        'callback_data' => 'array',
        'processed_at' => 'datetime',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the payment that owns the callback
     */
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
