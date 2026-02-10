<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'brand',
        'provider',
        'type',
        'payment_type',
        'description',
        'image',
        'input_fields',
        'server_options',
        'rating',
        'is_active',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'input_fields' => 'array',
        'server_options' => 'array',
        'rating' => 'float',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    /**
     * Get the category
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    /**
     * Get all product items (variants)
     */
    public function items(): HasMany
    {
        return $this->hasMany(ProductItem::class);
    }

    /**
     * Get active items only
     */
    public function activeItems(): HasMany
    {
        return $this->items()->where('is_active', true);
    }

    /**
     * Get available items only
     */
    public function availableItems(): HasMany
    {
        return $this->items()
            ->where('is_active', true)
            ->where('stock_status', 'available');
    }

    /**
     * Scope: Active products
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Featured products
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope: By type
     */
    public function scopeType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: By payment type
     */
    public function scopePaymentType($query, string $paymentType)
    {
        return $query->where('payment_type', $paymentType);
    }

    /**
     * Scope: Games only
     */
    public function scopeGame($query)
    {
        return $query->where('type', 'game');
    }

    /**
     * Scope: Prepaid only
     */
    public function scopePrepaid($query)
    {
        return $query->where('payment_type', 'prepaid');
    }

    /**
     * Scope: Postpaid only
     */
    public function scopePostpaid($query)
    {
        return $query->where('payment_type', 'postpaid');
    }

    /**
     * Get cheapest item price
     */
    public function getCheapestPrice(string $customerType = 'retail'): ?float
    {
        $priceColumn = $customerType === 'reseller' ? 'reseller_price' : 'retail_price';

        return $this->availableItems()
            ->min($priceColumn);
    }

    /**
     * Get price range
     */
    public function getPriceRange(string $customerType = 'retail'): array
    {
        $priceColumn = $customerType === 'reseller' ? 'reseller_price' : 'retail_price';

        $min = $this->availableItems()->min($priceColumn);
        $max = $this->availableItems()->max($priceColumn);

        return [
            'min' => $min,
            'max' => $max,
        ];
    }

    /**
     * Check if product has available items
     */
    public function hasAvailableItems(): bool
    {
        return $this->availableItems()->exists();
    }

    /**
     * Get total items count
     */
    public function getTotalItemsCount(): int
    {
        return $this->items()->count();
    }

    /**
     * Get active items count
     */
    public function getActiveItemsCount(): int
    {
        return $this->activeItems()->count();
    }
}
