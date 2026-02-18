# Admin API Specification

## 1. Dashboard Statistics

**Endpoint:** `GET /api/admin/dashboard`
**Params:** `period` (today, week, month, year)

- **Returns:** Revenue growth, success rate, user growth, top products chart data.

---

## 2. Product Management

### List Products

**Endpoint:** `GET /api/admin/products`

- **Advanced Search:** Searches name, brand, category, variant, or SKU.
- **Dynamic Filter:** `category.slug=...`, `type=...`, `is_active=...`.

### Bulk Price Update

**Endpoint:** `POST /api/admin/products/bulk-update-prices`
**Body:**

```json
{
  "items": [
    { "id": 101, "retail_price": 25000, "retail_profit": 2000 },
    { "id": 102, "reseller_price": 23000, "reseller_profit": 1000 }
  ]
}
```

---

## 3. User Management

- **Balance Adjustment:** `POST /api/admin/users/{id}/adjust-balance`
- **Body:** `type` (add/deduct), `amount`, `description`.
- **Statistics:** `GET /api/admin/users/statistics`.

---

## 4. Report Generation

- **Sales:** `GET /api/admin/reports/sales?group_by=day`
- **Export:** `GET /api/admin/reports/export/transactions` (Returns CSV).

---

## 5. System Settings

**Endpoint:** `POST /api/admin/settings/bulk-update`
**Body:**

```json
{
  "settings": [
    { "key": "app.name", "value": "New Name" },
    { "key": "retail_margin", "value": "10" }
  ]
}
```
