# Customer API Specification

## 1. Purchase Product

**Endpoint:** `POST /api/customer/transactions/purchase` (Gateway)
**Endpoint:** `POST /api/customer/transactions/purchase-balance` (Wallet Balance)

### Request Body (Gateway):

```json
{
  "product_item_id": 123,
  "payment_method": "QRIS", // choices from payment-channels API
  "customer_data": {
    "user_id": "123456789",
    "zone_id": "1234"
  }
}
```

### Response (with Tripay Data):

```json
{
    "success": true,
    "data": {
        "transaction": { "transaction_code": "TRX-...", "total_price": 25000 },
        "payment": {
            "payment_url": "...",
            "qr_code_url": "...",
            "va_number": "...",
            "instructions": [ { "title": "...", "steps": [...] } ]
        }
    }
}
```

---

## 2. Wallet & Mutations

- **Get Balance:** `GET /api/customer/balance` → Returns `balance`, `hold_amount`.
- **Topup:** `POST /api/customer/transactions/topup` (Body: `amount`, `payment_method`).
- **History:** `GET /api/customer/balance/mutations` → List of `credit`/`debit` movements.

---

## 3. Transaction History

**Endpoint:** `GET /api/customer/transactions`

### Filters:

- `type`: purchase, topup
- `status`: pending, success, failed
- `start_date` / `end_date`: YYYY-MM-DD
- `per_page` (default 20)

---

## 4. Postpaid Inquiry (PPOB)

**Endpoint:** `POST /api/customer/postpaid/inquiry`

- **Body:** `product_item_id`, `customer_no`.
- **Response:** Returns `billing_name`, `amount`, `admin_fee`, `total`.
