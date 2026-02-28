<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductItem extends Model
{
    protected $fillable = [
        'product_id',
        'digiflazz_code',
        'name',
        'group',
        'description',
        'base_price',
        'retail_price',
        'reseller_price',
        'admin_fee',
        'retail_profit',
        'reseller_profit',
        'stock_status',
        'is_active',
        'total_sold',
        'sort_order',
        'last_synced_at',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['price'];

    protected $casts = [
        'base_price' => 'decimal:2',
        'retail_price' => 'decimal:2',
        'reseller_price' => 'decimal:2',
        'admin_fee' => 'decimal:2',
        'retail_profit' => 'decimal:2',
        'reseller_profit' => 'decimal:2',
        'is_active' => 'boolean',
        'total_sold' => 'integer',
        'sort_order' => 'integer',
        'last_synced_at' => 'datetime',
    ];

    /**
     * Get the parent product
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get transactions for this product item
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Scope: Active items only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Available stock
     */
    public function scopeAvailable($query)
    {
        return $query->where('stock_status', 'available');
    }

    /**
     * Scope: By Digiflazz code
     */
    public function scopeByCode($query, string $code)
    {
        return $query->where('digiflazz_code', $code);
    }

    /**
     * Get price based on customer type
     */
    public function getPriceForCustomer(string $customerType): float
    {
        return floatval($customerType === 'reseller'
            ? $this->reseller_price
            : $this->retail_price);
    }

    /**
     * Accessor to get dynamic price based on logged in user's role.
     * This ensures JSON API responses automatically include 'price' field.
     */
    public function getPriceAttribute()
    {
        $customerType = auth()->check() ? auth()->user()->customer_type : 'retail';
        return $this->getPriceForCustomer($customerType);
    }

    /**
     * Check if item is available for purchase
     */
    public function isAvailable(): bool
    {
        return $this->is_active && $this->stock_status === 'available';
    }

    /**
     * Increment total sold
     */
    public function incrementSold(): void
    {
        $this->increment('total_sold');
    }
}
