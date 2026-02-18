# Spesifikasi API Autentikasi

## 1. Registrasi

**Endpoint:** `POST /api/auth/register`

### Body Permintaan:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890",
  "password": "password123",
  "password_confirmation": "password123",
  "customer_type": "retail", // atau "reseller"
  "referral_code": "ABC12345" // opsional
}
```

### Respon Sukses (201):

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

### Body Permintaan:

```json
{
  "identifier": "john@example.com", // email atau telepon
  "password": "password123"
}
```

### Respon Sukses (200):

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

## 3. Login Sosial (OAuth2)

**Endpoint:** `GET /api/auth/social/{provider}/redirect`

- **Penyedia:** `google`, `facebook`
- **Penanganan Callback:** Autentikasi membuat user berdasarkan email jika belum ada dan menautkan ID sosial. Redirect kembali ke frontend dengan token.

---

## 4. Alur Reset Password

1. **Lupa:** `POST /api/auth/forgot-password` (Body: `email`)
2. **Reset:** `POST /api/auth/reset-password` (Body: `email`, `token`, `password`, `password_confirmation`)
