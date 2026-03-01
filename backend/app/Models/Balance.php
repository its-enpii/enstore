<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Balance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
        'bonus_balance',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'bonus_balance' => 'decimal:2',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user that owns the balance
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all balance mutations
     */
    public function mutations()
    {
        return $this->hasMany(BalanceMutation::class);
    }
}
