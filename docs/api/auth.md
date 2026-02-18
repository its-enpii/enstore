# Auth API Specification

## 1. Register

**Endpoint:** `POST /api/auth/register`

### Request Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890",
  "password": "password123",
  "password_confirmation": "password123",
  "customer_type": "retail", // or "reseller"
  "referral_code": "ABC12345" // optional
}
```

### Success Response (201):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "...",
      "customer_type": "...",
      "referral_code": "..."
    },
    "access_token": "...",
    "token_type": "Bearer"
  }
}
```

---

## 2. Login

**Endpoint:** `POST /api/auth/login`

### Request Body:

```json
{
  "identifier": "john@example.com", // email or phone
  "password": "password123"
}
```

### Success Response (200):

```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "role": "customer", "customer_type": "retail" },
    "access_token": "...",
    "token_type": "Bearer"
  }
}
```

---

## 3. Social Login (OAuth2)

**Endpoint:** `GET /api/auth/social/{provider}/redirect`

- **Providers:** `google`, `facebook`
- **Callback Handling:** Auth creates user by email if not exists and links social ID. Redirects back to frontend with token.

---

## 4. Reset Password Flow

1. **Forgot:** `POST /api/auth/forgot-password` (Body: `email`)
2. **Reset:** `POST /api/auth/reset-password` (Body: `email`, `token`, `password`, `password_confirmation`)
