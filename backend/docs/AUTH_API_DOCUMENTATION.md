# Authentication API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication Endpoints

### 1. Register
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890",
  "password": "password123",
  "password_confirmation": "password123",
  "customer_type": "retail", // optional: "retail" or "reseller", default: "retail"
  "referral_code": "ABC12345" // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "081234567890",
      "role": "customer",
      "customer_type": "retail",
      "referral_code": "XYZ98765"
    },
    "access_token": "1|abcdef123456...",
    "token_type": "Bearer"
  }
}
```

**Error Response (422):**
```json
{
  "message": "The email has already been taken.",
  "errors": {
    "email": ["Email sudah terdaftar."]
  }
}
```

---

### 2. Login
**POST** `/auth/login`

Login with email or phone number.

**Request Body:**
```json
{
  "identifier": "john@example.com", // or phone: "081234567890"
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "081234567890",
      "role": "customer",
      "customer_type": "retail",
      "avatar": null
    },
    "access_token": "2|ghijkl789012...",
    "token_type": "Bearer"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Email/Phone atau password salah"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Akun Anda tidak aktif. Silakan hubungi admin."
}
```

---

### 3. Logout
**POST** `/auth/logout`

Logout and revoke current access token.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

---

### 4. Refresh Token
**POST** `/auth/refresh-token`

Refresh the access token.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token berhasil diperbarui",
  "data": {
    "access_token": "3|mnopqr345678...",
    "token_type": "Bearer"
  }
}
```

---

### 5. Get Profile
**GET** `/auth/profile`

Get authenticated user profile.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890",
    "role": "customer",
    "customer_type": "retail",
    "avatar": null,
    "referral_code": "XYZ98765",
    "status": "active",
    "email_verified_at": null,
    "phone_verified_at": null
  }
}
```

---

### 6. Forgot Password
**POST** `/auth/forgot-password`

Send password reset link to email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Link reset password telah dikirim ke email Anda"
}
```

**Error Response (422):**
```json
{
  "message": "The selected email is invalid.",
  "errors": {
    "email": ["Email tidak terdaftar."]
  }
}
```

---

### 7. Reset Password
**POST** `/auth/reset-password`

Reset password using token from email.

**Request Body:**
```json
{
  "email": "john@example.com",
  "token": "abc123def456...",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password berhasil direset"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Token reset password tidak valid atau sudah kadaluarsa"
}
```

---

## Social Authentication (Google & Facebook)

### 8. Get Social Login Redirect URL
**GET** `/auth/social/{provider}/redirect`

Get the OAuth2 authorization URL to redirect the user to Google or Facebook.

**Parameters:**
- `{provider}` - Social provider: `google` or `facebook`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "redirect_url": "https://accounts.google.com/o/oauth2/auth?client_id=...&redirect_uri=...&scope=..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Provider tidak didukung. Gunakan: google, facebook"
}
```

---

### 9. Social Login Callback
**GET** `/auth/social/{provider}/callback`

Handles the OAuth2 callback from Google/Facebook. This endpoint is called automatically by the provider after user authorization. **Not called directly by frontend.**

**Parameters:**
- `{provider}` - Social provider: `google` or `facebook`

**Behavior:**
- On success: Redirects to `{FRONTEND_URL}/auth/social-callback?token={access_token}&role={role}&customer_type={type}`
- On error: Redirects to `{FRONTEND_URL}/auth/social-callback?error={error_message}`

**User Matching Logic:**
1. If user with matching `google_id`/`facebook_id` exists → Login that user
2. If user with matching `email` exists → Link social account to existing user, then login
3. If no matching user → Create new user account, then login

---

### 10. Social Token Exchange
**POST** `/auth/social/{provider}/token`

Alternative flow: Exchange a social provider access token (obtained by frontend directly) for an EnStore auth token.

**Parameters:**
- `{provider}` - Social provider: `google` or `facebook`

**Request Body:**
```json
{
  "access_token": "ya29.a0AfH6SMC..." 
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 5,
      "name": "John Doe",
      "email": "john@gmail.com",
      "phone": null,
      "role": "customer",
      "customer_type": "retail",
      "avatar": "https://lh3.googleusercontent.com/..."
    },
    "access_token": "5|stuvwx901234...",
    "token_type": "Bearer"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Provider tidak didukung"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Akun Anda tidak aktif. Silakan hubungi admin."
}
```

---

## Middleware Usage

### Role-Based Access Control

To protect routes with role checking, use the `role` middleware:

```php
// Admin only
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Admin routes
});

// Customer only
Route::middleware(['auth:sanctum', 'role:customer'])->group(function () {
    // Customer routes
});

// Multiple roles
Route::middleware(['auth:sanctum', 'role:admin,customer'])->group(function () {
    // Routes accessible by both admin and customer
});
```

---

## Error Responses

### Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "Error message 1",
      "Error message 2"
    ]
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Unauthorized. Please login first."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Forbidden. You do not have permission to access this resource."
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message (only in development)"
}
```

---

## User Roles

- **admin**: Administrator with full access
- **customer**: Regular customer (can be retail or reseller)

## Customer Types

- **retail**: Regular retail customer
- **reseller**: Reseller customer with special pricing

## User Status

- **active**: User can login and use the system
- **inactive**: User account is temporarily disabled
- **suspended**: User account is suspended (requires admin action)

---

## Testing with Postman/Insomnia

1. **Register a new user**
   - POST to `/api/auth/register`
   - Save the `access_token` from response

2. **Login**
   - POST to `/api/auth/login`
   - Save the `access_token` from response

3. **Access protected routes**
   - Add header: `Authorization: Bearer {access_token}`
   - Make requests to protected endpoints

4. **Refresh token**
   - POST to `/api/auth/refresh-token` with current token
   - Update your saved token with the new one

5. **Logout**
   - POST to `/api/auth/logout`
   - Token will be revoked
