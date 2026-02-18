# Features & Specialized Flows

## 🛒 Guest Checkout

Allows users to buy without registering a full account.

- **Workflow**: Input details → Choice of payment → Pay → Status page.
- **Auto-Account**: Technical provision for future registration using the same email.

---

## 💰 Refund System

Implemented for failed provider (Digiflazz) orders.

- **Trigger**: Order failed AND payment was already Success.
- **Mechanism**: Amount is added to User's `balance`.
- **Audit**: Logged in `balance_mutations` and `activity_logs`.

---

## 🔔 Notification System

Real-time feedback for users.

- **Types**: `payment_success`, `order_completed`, `refund_processed`.
- **Delivery**: Database notifications, visible in web/mobile header.

---

## 💎 Pricing Tiers

- **Retail**: Standard profit margin applied to base Digiflazz price.
- **Reseller**: Reduced profit margin for high-volume users.
- **Override**: Admin can manually set specific items' prices regardless of formula.

---

## 🛡️ Brute-force Protection (Rate Limiting)

- **Auth Limit**: 5 attempts per minute.
- **API Limit**: 300 requests per minute.
- **Polling Limit**: 600 requests per minute (for status checks).
