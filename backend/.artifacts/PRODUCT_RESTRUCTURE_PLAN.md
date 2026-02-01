# Product Structure Refactoring Plan

## 🎯 Objective
Restructure product system from flat structure to hierarchical (Product → Product Items/Variants)

---

## 📊 Current vs New Structure

### Current (Flat)
```
products
├── Free Fire 12 Diamond (SKU: ff12)
├── Free Fire 50 Diamond (SKU: ff50)
├── Free Fire 100 Diamond (SKU: ff100)
├── Mobile Legends 100 Diamond (SKU: ml100)
└── Mobile Legends 500 Diamond (SKU: ml500)
```

### New (Hierarchical)
```
products (Parent/Game)
├── Free Fire
│   └── product_items
│       ├── 12 Diamond (SKU: ff12)
│       ├── 50 Diamond (SKU: ff50)
│       └── 100 Diamond (SKU: ff100)
└── Mobile Legends
    └── product_items
        ├── 100 Diamond (SKU: ml100)
        └── 500 Diamond (SKU: ml500)
```

---

## 📋 Implementation Steps

### Phase 1: Database Schema
1. ✅ Rename `products` → `product_items`
2. ✅ Create new `products` table (parent)
3. ✅ Add `product_id` foreign key to `product_items`
4. ✅ Migrate existing data

### Phase 2: Models
1. ✅ Update `Product` model (parent)
2. ✅ Create `ProductItem` model (variant)
3. ✅ Define relationships
4. ✅ Update scopes and accessors

### Phase 3: Services
1. ✅ Update `ProductService`
2. ✅ Update `DigiflazzService`
3. ✅ Update `TransactionService`
4. ✅ Update sync command

### Phase 4: Controllers
1. ✅ Update `ProductController` (Admin)
2. ✅ Update `ProductController` (Customer)
3. ✅ Update `TransactionController`
4. ✅ Update `PostpaidController`

### Phase 5: API Response
1. ✅ Update API responses
2. ✅ Update serialization
3. ✅ Update documentation

### Phase 6: Testing
1. ✅ Test product sync
2. ✅ Test transactions
3. ✅ Test API endpoints

---

## 🗄️ New Database Schema

### `products` (Parent/Game)
```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    category_id BIGINT,
    name VARCHAR(255),              -- "Free Fire", "Mobile Legends"
    slug VARCHAR(255) UNIQUE,
    brand VARCHAR(255),             -- "FREE FIRE", "MOONTON"
    type VARCHAR(50),               -- "game", "pulsa", "data"
    payment_type ENUM,              -- "prepaid", "postpaid"
    description TEXT,
    image VARCHAR(255),
    is_active BOOLEAN,
    is_featured BOOLEAN,
    sort_order INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### `product_items` (Variants/SKU)
```sql
CREATE TABLE product_items (
    id BIGINT PRIMARY KEY,
    product_id BIGINT,              -- FK to products
    digiflazz_code VARCHAR(255),    -- "ff12", "ml100"
    name VARCHAR(255),              -- "12 Diamond", "100 Diamond"
    description TEXT,
    
    base_price DECIMAL(15,2),
    retail_price DECIMAL(15,2),
    reseller_price DECIMAL(15,2),
    admin_fee DECIMAL(15,2),
    retail_profit DECIMAL(15,2),
    reseller_profit DECIMAL(15,2),
    
    stock_status ENUM,
    is_active BOOLEAN,
    
    server_options JSON,
    input_fields JSON,
    
    total_sold INT,
    rating DECIMAL(3,2),
    sort_order INT,
    
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### `transactions` (Updated)
```sql
-- Change product_id to product_item_id
ALTER TABLE transactions 
    ADD COLUMN product_item_id BIGINT AFTER product_id,
    ADD FOREIGN KEY (product_item_id) REFERENCES product_items(id);
```

---

## 🔧 Model Relationships

### Product Model
```php
class Product extends Model
{
    // Relationships
    public function category() { return $this->belongsTo(ProductCategory::class); }
    public function items() { return $this->hasMany(ProductItem::class); }
    
    // Scopes
    public function scopeActive($query) { return $query->where('is_active', true); }
    public function scopeByType($query, $type) { return $query->where('type', $type); }
    public function scopeGame($query) { return $query->where('type', 'game'); }
}
```

### ProductItem Model
```php
class ProductItem extends Model
{
    // Relationships
    public function product() { return $this->belongsTo(Product::class); }
    public function transactions() { return $this->hasMany(Transaction::class); }
    
    // Scopes
    public function scopeActive($query) { return $query->where('is_active', true); }
    public function scopeAvailable($query) { return $query->where('stock_status', 'available'); }
}
```

---

## 📡 API Response Changes

### Before
```json
{
  "id": 1,
  "name": "Free Fire 12 Diamond",
  "brand": "FREE FIRE",
  "price": 2015
}
```

### After
```json
{
  "id": 1,
  "name": "Free Fire",
  "brand": "FREE FIRE",
  "type": "game",
  "items": [
    {
      "id": 1,
      "name": "12 Diamond",
      "sku": "ff12",
      "price": 2015
    },
    {
      "id": 2,
      "name": "50 Diamond",
      "sku": "ff50",
      "price": 8000
    }
  ]
}
```

---

## 🔄 Migration Strategy

### Step 1: Backup
```bash
docker-compose exec backend php artisan db:backup
```

### Step 2: Create Tables
```bash
php artisan make:migration restructure_products_to_hierarchical
```

### Step 3: Migrate Data
```php
// 1. Create new products table
// 2. Rename products → product_items
// 3. Extract unique products (by brand)
// 4. Create parent products
// 5. Link product_items to products
// 6. Update transactions
```

### Step 4: Update Code
- Models
- Services
- Controllers
- Commands

### Step 5: Test
- Sync products
- Create transaction
- API endpoints

---

## ⚠️ Breaking Changes

1. **API Endpoints**
   - `GET /products` now returns parent products with items nested
   - `GET /products/{id}` returns product with all items
   - Need new endpoint: `GET /product-items/{sku}` for specific item

2. **Transaction Creation**
   - Must use `product_item_id` instead of `product_id`
   - Frontend must select product → then item

3. **Sync Command**
   - Will group by brand/game
   - Create parent products automatically

---

## 📝 Checklist

### Database
- [x] Create migration
- [x] Create `products` table
- [x] Rename `products` to `product_items`
- [x] Add `product_id` to `product_items`
- [x] Migrate existing data
- [x] Update `transactions` table
- [x] Run migration

### Models
- [x] Update `Product` model
- [x] Create `ProductItem` model
- [x] Update relationships
- [x] Update `Transaction` model

### Services
- [x] Update `ProductService`
- [x] Update `DigiflazzService`
- [x] Update `TransactionService`
- [x] Update sync command

### Controllers
- [x] Update Admin `ProductController`
- [x] Update Customer `ProductController`
- [x] Update `TransactionController`
- [x] Update `PostpaidController`

### Testing
- [x] Test product sync
- [x] Test product listing
- [x] Test transaction creation
- [x] Test API endpoints

---

## 🚀 Execution Order

1. Database migration
2. Models
3. Services
4. Controllers
5. Testing
6. Documentation

**Estimated Time:** 2-3 hours
**Risk Level:** High (breaking changes)
**Rollback Plan:** Database backup + git revert

---

Ready to proceed? 🚀
