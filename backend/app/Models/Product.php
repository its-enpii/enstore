<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'digiflazz_code',
        'name',
        'description',
        'image',
        'brand',
        'type',
        'base_price',
        'retail_price',
        'reseller_price',
        'admin_fee',
        'retail_profit',
        'reseller_profit',
        'stock_status',
        'is_active',
        'is_featured',
        'server_options',
        'input_fields',
        'total_sold',
        'rating',
        'sort_order',
        'last_synced_at',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'retail_price' => 'decimal:2',
        'reseller_price' => 'decimal:2',
        'admin_fee' => 'decimal:2',
        'retail_profit' => 'decimal:2',
        'reseller_profit' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'server_options' => 'array',
        'input_fields' => 'array',
        'total_sold' => 'integer',
        'rating' => 'decimal:2',
        'sort_order' => 'integer',
        'last_synced_at' => 'datetime',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the category that owns the product
     */
    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    /**
     * Get all transactions for this product
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include active products
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include featured products
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to only include available products
     */
    public function scopeAvailable($query)
    {
        return $query->where('stock_status', 'available');
    }

    // ==================== ACCESSORS ====================

    /**
     * Get the price for a specific customer type
     */
    public function getPriceForCustomerType($customerType)
    {
        return $customerType === 'reseller' ? $this->reseller_price : $this->retail_price;
    }

    /**
     * Get the profit for a specific customer type
     */
    public function getProfitForCustomerType($customerType)
    {
        return $customerType === 'reseller' ? $this->reseller_profit : $this->retail_profit;
    }
}
