# API Reference

## 🔐 Authentication

**Base Path:** `/api/auth`  
[**→ Request/Response Payloads**](api/auth.md)

| Method | Endpoint           | Description                   |
| ------ | ------------------ | ----------------------------- |
| POST   | `/register`        | Register new user             |
| POST   | `/login`           | Login (returns Sanctum token) |
| POST   | `/logout`          | Revoke current token          |
| GET    | `/profile`         | Get auth user data            |
| POST   | `/forgot-password` | Request reset link            |

---

## 🛍️ Public & Product API

**Base Path:** `/api/products`  
[**→ Request/Response Payloads**](api/customer.md)

| Method | Endpoint                      | Description                         |
| ------ | ----------------------------- | ----------------------------------- |
| GET    | `/`                           | List products (with search/filters) |
| GET    | `/{id}`                       | Product detail (inc. variants)      |
| GET    | `/categories`                 | List all categories                 |
| POST   | `/transactions/purchase`      | Guest checkout                      |
| GET    | `/transactions/status/{code}` | Check order status                  |

---

## 👤 Customer API (Authenticated)

**Base Path:** `/api/customer`  
[**→ Request/Response Payloads**](api/customer.md)

| Method | Endpoint                         | Description                 |
| ------ | -------------------------------- | --------------------------- |
| GET    | `/transactions`                  | Order history               |
| POST   | `/transactions/purchase-balance` | Pay using wallet balance    |
| POST   | `/transactions/topup`            | Top up wallet balance       |
| GET    | `/balance`                       | Current balance & mutations |
| GET    | `/notifications`                 | Unread notifications        |

---

## 🛡️ Admin API (Restricted)

**Base Path:** `/api/admin`  
[**→ Request/Response Payloads**](api/admin.md)

| Method   | Endpoint         | Description                         |
| -------- | ---------------- | ----------------------------------- |
| GET      | `/dashboard`     | Sales & User statistics             |
| GET/POST | `/products`      | Manage products & Digiflazz sync    |
| GET/PUT  | `/transactions`  | Manage orders & update status       |
| GET/POST | `/users`         | Manage users & balance adjustments  |
| GET/PUT  | `/settings`      | System configuration                |
| GET      | `/reports/sales` | Generate financial reports          |
| GET/PUT  | `/vouchers`      | Manage discount vouchers            |
| GET/PUT  | `/withdrawals`   | Manage reseller balance withdrawals |

---

## 📱 Mobile/Flutter Integration

The mobile app uses `dio` to connect to these endpoints.

- **Emulator Base URL:** `http://10.0.2.2:8000/api`
- **Web/Physical Base URL:** `http://your-ip:8000/api`

Refer to the internal Flutter service code for detailed `Dio` implementation.
