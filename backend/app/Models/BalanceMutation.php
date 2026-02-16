<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BalanceMutation extends Model
{
    use HasFactory;

    protected $fillable = [
        'balance_id',
        'transaction_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'description',
        'meta_data',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'meta_data' => 'array',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the balance that owns the mutation
     */
    public function balance()
    {
        return $this->belongsTo(Balance::class);
    }

    /**
     * Get the transaction associated with this mutation
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
