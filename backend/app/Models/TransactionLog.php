<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TransactionLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'status_from',
        'status_to',
        'message',
        'meta_data',
    ];

    protected $casts = [
        'meta_data' => 'array',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the transaction that owns the log
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
