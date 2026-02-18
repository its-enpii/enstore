# Third-Party Integrations

## 💳 Tripay (Payment Gateway)

Tripay handles all digital payments (QRIS, VA, E-Wallets).

### Logic Flow

1. User creates transaction → App calls `TripayService::createPayment()`.
2. Tripay returns `checkout_url` and payment instructions.
3. Callback received at `POST /api/webhooks/tripay`.
4. App validates signature and updates order status.

### 🔐 Technical: Callback Validation

Tripay callbacks are secured with an HMAC SHA256 signature.

- **Header:** `X-Callback-Signature`
- **Logic:** `hash_hmac('sha256', $payload, $private_key)`
- **Validation:** Always verify the signature matches before updating any database record.

### Status Mapping

| Tripay Status | App Status | Action                    |
| ------------- | ---------- | ------------------------- |
| `PAID`        | `paid`     | Process order (Digiflazz) |
| `EXPIRED`     | `expired`  | Cancel transaction        |
| `FAILED`      | `failed`   | Mark as error             |

---

## ⚡ Digiflazz (Product Provider)

Digiflazz provides the actual digital products (Diamonds, Pulsa, UC).

### Integration Details

- **Syncing**: Products are synced via `php artisan digiflazz:sync-products`.
- **Ordering**: Triggered immediately after payment is confirmed.
- **Callback**: Digiflazz notifies of status changes (e.g., Success with SN).

### Core Service

`App\Services\DigiflazzService` handles all API communication using the configured credentials.

---

## 📧 Social Login (OAuth2)

Integration with Google and Facebook using Laravel Socialite.

### Flow

1. Redirect to `/api/auth/social/{provider}/redirect`.
2. Callback handled at `/api/auth/social/{provider}/callback`.
3. Account auto-linked by email or new account created.
