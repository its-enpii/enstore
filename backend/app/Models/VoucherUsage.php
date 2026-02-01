<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VoucherUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'voucher_id',
        'user_id',
        'transaction_id',
        'discount_amount',
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the voucher that was used
     */
    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    /**
     * Get the user who used the voucher
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transaction where voucher was used
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
