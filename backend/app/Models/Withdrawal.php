<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Withdrawal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'payment_method',
        'account_number',
        'account_name',
        'status',
        'reference_id',
        'admin_note',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user that owns the withdrawal.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Boot function logic for generating reference_id
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($withdrawal) {
            if (!$withdrawal->reference_id) {
                $withdrawal->reference_id = 'WD-' . strtoupper(\Illuminate\Support\Str::random(8));
            }
        });
    }
}
