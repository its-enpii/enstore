# Social Login Setup Guide (Google & Facebook)

Panduan lengkap untuk mengonfigurasi Social Login menggunakan Google dan Facebook di EnStore.

---

## 📋 Daftar Isi

1. [Overview](#-overview)
2. [Architecture & Flow](#-architecture--flow)
3. [Backend Setup](#-backend-setup)
4. [Google OAuth2 Setup](#-google-oauth2-setup)
5. [Facebook OAuth2 Setup](#-facebook-oauth2-setup)
6. [Frontend Integration](#-frontend-integration)
7. [Database Changes](#-database-changes)
8. [Testing](#-testing)
9. [Production Deployment](#-production-deployment)
10. [Troubleshooting](#-troubleshooting)

---

## 🔍 Overview

Social Login memungkinkan user login/register menggunakan akun Google atau Facebook mereka tanpa perlu mengisi form registrasi manual.

### Fitur:
- ✅ Login via Google
- ✅ Login via Facebook  
- ✅ Auto-register jika user baru
- ✅ Auto-link jika email sudah terdaftar
- ✅ Tombol social login di halaman Login & Register
- ✅ Loading state & error handling
- ✅ Redirect otomatis berdasarkan role

### Technology Stack:
- **Backend**: Laravel Socialite (v5.24+)
- **Frontend**: Next.js (App Router)
- **Auth**: Laravel Sanctum (Token-based)

---

## 🔄 Architecture & Flow

### Flow Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │     │   Backend    │     │   Google/    │     │   Frontend   │
│  Login Page  │     │    API       │     │  Facebook    │     │  Callback    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │                    │
       │ 1. Click Google    │                    │                    │
       │ ──────────────────>│                    │                    │
       │                    │                    │                    │
       │ 2. Return URL      │                    │                    │
       │ <──────────────────│                    │                    │
       │                    │                    │                    │
       │ 3. Redirect user   │                    │                    │
       │ ───────────────────────────────────────>│                    │
       │                    │                    │                    │
       │                    │ 4. User authorizes │                    │
       │                    │ <──────────────────│                    │
       │                    │                    │                    │
       │                    │ 5. Get user data   │                    │
       │                    │ ──────────────────>│                    │
       │                    │                    │                    │
       │                    │ 6. User data       │                    │
       │                    │ <──────────────────│                    │
       │                    │                    │                    │
       │                    │ 7. Create/Find user│                    │
       │                    │    Generate token  │                    │
       │                    │                    │                    │
       │                    │ 8. Redirect with token                  │
       │                    │ ───────────────────────────────────────>│
       │                    │                    │                    │
       │                    │                    │   9. Store token   │
       │                    │                    │   Redirect to      │
       │ <────────────────────────────────────────── dashboard       │
```

### Step-by-Step:

1. **User klik tombol Google/Facebook** di halaman Login atau Register
2. **Frontend memanggil** `GET /api/auth/social/{provider}/redirect`
3. **Backend mengembalikan** URL OAuth2 dari provider
4. **Browser redirect** ke halaman otorisasi Google/Facebook
5. **User login & approve** di halaman Google/Facebook
6. **Provider redirect** ke `GET /api/auth/social/{provider}/callback`
7. **Backend memproses**:
   - Cari user berdasarkan `google_id`/`facebook_id`
   - Jika tidak ada, cari berdasarkan email
   - Jika tidak ada, buat user baru
   - Generate Sanctum token
8. **Backend redirect** ke `{FRONTEND_URL}/auth/social-callback?token={token}`
9. **Frontend callback page**:
   - Simpan token di `localStorage`
   - Refresh auth context
   - Redirect ke dashboard sesuai role

### User Matching Logic:

```
Social Login Request
       │
       ▼
┌─────────────────────────────┐
│ Ada user dengan google_id/  │──── Ya ──── Login (return token)
│ facebook_id yang sama?      │
└──────────────┬──────────────┘
               │ Tidak
               ▼
┌─────────────────────────────┐
│ Ada user dengan email       │──── Ya ──── Link social account
│ yang sama?                  │            + Login (return token)
└──────────────┬──────────────┘
               │ Tidak
               ▼
┌─────────────────────────────┐
│ Buat user baru              │──── Register + Login (return token)
│ (role: customer, type: retail)
└─────────────────────────────┘
```

---

## ⚙️ Backend Setup

### 1. Package yang Diperlukan

Laravel Socialite sudah terinstall:

```bash
composer require laravel/socialite
```

### 2. File yang Dibuat/Dimodifikasi

| File | Keterangan |
|------|-----------|
| `app/Http/Controllers/Api/SocialAuthController.php` | Controller utama social auth |
| `database/migrations/2026_02_15_090000_add_social_login_fields_to_users_table.php` | Migration untuk kolom social |
| `config/services.php` | Konfigurasi Google & Facebook credentials |
| `routes/api.php` | Route untuk social auth endpoints |
| `app/Models/User.php` | Menambah fillable fields |
| `.env` / `.env.example` | Environment variables |

### 3. API Endpoints

| Method | Endpoint | Keterangan |
|--------|----------|-----------|
| `GET` | `/api/auth/social/{provider}/redirect` | Dapatkan URL redirect OAuth |
| `GET` | `/api/auth/social/{provider}/callback` | Callback dari Google/Facebook |
| `POST` | `/api/auth/social/{provider}/token` | Token exchange (alternatif flow) |

> **`{provider}`** bisa diisi: `google` atau `facebook`

### 4. Environment Variables

Tambahkan ke file `.env`:

```env
# Frontend URL (untuk redirect setelah social login)
FRONTEND_URL=http://localhost:3000

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=http://localhost:8000/api/auth/social/google/callback

# Facebook OAuth2
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URL=http://localhost:8000/api/auth/social/facebook/callback
```

---

## 🔵 Google OAuth2 Setup

### Step 1: Buka Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang ada
3. Nama project: `EnStore` (atau nama lain)

### Step 2: Enable Google+ API

1. Buka **APIs & Services** → **Library**
2. Cari "**Google+ API**" atau "**Google People API**"
3. Klik **Enable**

### Step 3: Buat OAuth2 Credentials

1. Buka **APIs & Services** → **Credentials**
2. Klik **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Jika belum, buat **OAuth consent screen**:
   - User Type: **External**
   - App Name: `EnStore`
   - User support email: email Anda
   - Developer contact: email Anda
   - Klik **Save and Continue**
   - Scopes: tambah `email` dan `profile` → Save
   - Test users: tambah email Anda → Save

4. Kembali ke **Credentials** → **+ CREATE CREDENTIALS** → **OAuth client ID**:
   - Application type: **Web application**
   - Name: `EnStore Web`
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     http://localhost:8000
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:8000/api/auth/social/google/callback
     ```
   - Klik **Create**

5. Copy **Client ID** dan **Client Secret**

### Step 4: Update .env

```env
GOOGLE_CLIENT_ID=123456789012-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_REDIRECT_URL=http://localhost:8000/api/auth/social/google/callback
```

---

## 🔷 Facebook OAuth2 Setup

### Step 1: Buka Facebook Developers

1. Buka [Facebook for Developers](https://developers.facebook.com/)
2. Login dengan akun Facebook Anda

### Step 2: Buat App

1. Klik **My Apps** → **Create App**
2. Pilih tipe: **Consumer** atau **None**
3. App Name: `EnStore`
4. Contact Email: email Anda
5. Klik **Create App**

### Step 3: Tambah Facebook Login

1. Di dashboard app, cari **Facebook Login** → **Set Up**
2. Pilih **Web**
3. Site URL: `http://localhost:3000` → **Save**
4. Buka **Facebook Login** → **Settings**:
   - Valid OAuth Redirect URIs:
     ```
     http://localhost:8000/api/auth/social/facebook/callback
     ```
   - Klik **Save Changes**

### Step 4: Ambil Credentials

1. Buka **Settings** → **Basic**
2. Copy **App ID** dan **App Secret** (klik Show)

### Step 5: Update .env

```env
FACEBOOK_CLIENT_ID=123456789012345
FACEBOOK_CLIENT_SECRET=abcdef1234567890abcdef12345678
FACEBOOK_REDIRECT_URL=http://localhost:8000/api/auth/social/facebook/callback
```

### Catatan Facebook:
- Selama app masih dalam **Development mode**, hanya **admin/developer/tester** app yang bisa login
- Untuk membuat app bisa digunakan semua orang, lakukan **App Review** di Facebook Developers

---

## 🖥️ Frontend Integration

### File yang Dibuat/Dimodifikasi

| File | Keterangan |
|------|-----------|
| `src/lib/api/auth.ts` | Fungsi `socialLogin()` dan `socialTokenExchange()` |
| `src/lib/api/config.ts` | Endpoint `socialRedirect` dan `socialToken` |
| `src/lib/api/index.ts` | Export `socialLogin` |
| `src/app/(public)/login/page.tsx` | Tombol Google & Facebook terhubung |
| `src/app/(public)/register/page.tsx` | Tombol Google & Facebook terhubung |
| `src/app/auth/social-callback/page.tsx` | Halaman callback untuk menerima token |

### Cara Kerja di Frontend

#### 1. API Functions (`src/lib/api/auth.ts`)

```typescript
// Memulai social login - redirect ke Google/Facebook
export const socialLogin = async (provider: 'google' | 'facebook') => {
  const endpoint = ENDPOINTS.auth.socialRedirect(provider);
  const res = await api.get(endpoint);
  if (res.success && res.data.redirect_url) {
    window.location.href = res.data.redirect_url;  // Redirect browser
  }
};

// Alternatif: exchange token langsung
export const socialTokenExchange = async (provider, accessToken) => {
  const endpoint = ENDPOINTS.auth.socialToken(provider);
  return api.post(endpoint, { access_token: accessToken });
};
```

#### 2. Login/Register Page Button Handler

```tsx
const [socialLoading, setSocialLoading] = useState<string | null>(null);

const handleSocialLogin = async (provider: 'google' | 'facebook') => {
  setSocialLoading(provider);
  try {
    await socialLogin(provider);
  } catch (err) {
    toast.error(`Gagal login dengan ${provider}`);
    setSocialLoading(null);
  }
};

// Di JSX:
<Button
  onClick={() => handleSocialLogin('google')}
  isLoading={socialLoading === 'google'}
  disabled={!!socialLoading}
>
  Google
</Button>
```

#### 3. Callback Page (`/auth/social-callback`)

Halaman ini otomatis:
- Membaca `token`, `role`, `customer_type`, dan `error` dari URL query params
- Menyimpan token ke `localStorage`
- Merefresh auth context (`refreshUser()`)
- Redirect ke dashboard sesuai role:
  - Admin → `/admin/dashboard`
  - Reseller → `/reseller/dashboard`
  - Customer → `/dashboard`
- Menampilkan loading spinner selama proses
- Menampilkan error message jika gagal

---

## 🗄️ Database Changes

### Migration: `add_social_login_fields_to_users_table`

Kolom yang ditambahkan ke tabel `users`:

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `google_id` | `VARCHAR`, nullable, unique | Google OAuth2 user ID |
| `facebook_id` | `VARCHAR`, nullable, unique | Facebook OAuth2 user ID |
| `social_avatar` | `VARCHAR`, nullable | URL avatar dari social provider |

Perubahan kolom:
- `phone` menjadi **nullable** (user social login mungkin tidak punya phone)

### User Model Fillable

```php
protected $fillable = [
    // ... existing fields ...
    'google_id',
    'facebook_id',
    'social_avatar',
];
```

---

## 🧪 Testing

### 1. Testing Manual (Browser)

```bash
# Pastikan backend berjalan
docker compose up -d

# Pastikan frontend berjalan
cd frontend && npm run dev
```

1. Buka `http://localhost:3000/login`
2. Klik tombol **Google** atau **Facebook**
3. Login dengan akun Google/Facebook
4. Pastikan redirect kembali ke dashboard

### 2. Testing API (cURL/Postman)

#### Get Redirect URL:
```bash
curl http://localhost:8000/api/auth/social/google/redirect
```

Response:
```json
{
  "success": true,
  "data": {
    "redirect_url": "https://accounts.google.com/o/oauth2/auth?..."
  }
}
```

#### Token Exchange (jika punya access token dari provider):
```bash
curl -X POST http://localhost:8000/api/auth/social/google/token \
  -H "Content-Type: application/json" \
  -d '{"access_token": "ya29.a0AfH6SMC..."}'
```

### 3. Verifikasi Database

Setelah social login berhasil, cek di database:

```sql
SELECT id, name, email, google_id, facebook_id, social_avatar 
FROM users 
WHERE google_id IS NOT NULL OR facebook_id IS NOT NULL;
```

---

## 🚀 Production Deployment

### 1. Update Redirect URIs

Ganti localhost dengan domain production di:

**`.env` Backend:**
```env
FRONTEND_URL=https://yourdomain.com

GOOGLE_REDIRECT_URL=https://api.yourdomain.com/api/auth/social/google/callback
FACEBOOK_REDIRECT_URL=https://api.yourdomain.com/api/auth/social/facebook/callback
```

### 2. Update Google Cloud Console

Di **Credentials** → Edit OAuth client:
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://api.yourdomain.com/api/auth/social/google/callback`

### 3. Update Facebook Developers

Di **Settings** → **Basic**:
- App Domains: `yourdomain.com`
- Site URL: `https://yourdomain.com`

Di **Facebook Login** → **Settings**:
- Valid OAuth Redirect URIs: `https://api.yourdomain.com/api/auth/social/facebook/callback`

### 4. Facebook App Review

Untuk versi production, submit app untuk review:
1. Buka **App Review** → **Permissions and Features**
2. Request: `email`, `public_profile`
3. Tunggu approval (biasanya 1-3 hari kerja)
4. Setelah diapprove, switch ke **Live** mode

---

## ❓ Troubleshooting

### Error: "redirect_uri_mismatch" (Google)

**Penyebab:** URL callback di Google Console tidak sesuai dengan `.env`

**Solusi:**
- Pastikan `GOOGLE_REDIRECT_URL` di `.env` sama persis dengan yang di Google Console
- Perhatikan `http` vs `https`
- Perhatikan trailing slash

### Error: "URL Blocked" (Facebook)

**Penyebab:** URL callback belum didaftarkan di Facebook App

**Solusi:**
- Tambah URL di **Facebook Login** → **Settings** → **Valid OAuth Redirect URIs**

### Error: "This app is still in development mode" (Facebook)

**Penyebab:** Facebook App masih dalam development mode

**Solusi untuk testing:**
- Tambah user di **Roles** → **Test Users** atau **Testers**

**Solusi untuk production:**
- Submit app untuk **App Review**

### Error: "Gagal membuat URL redirect"

**Penyebab:** Credentials belum diisi di `.env`

**Solusi:**
- Isi `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, dll di `.env`
- Restart backend: `docker compose restart backend`

### User social login tidak bisa set password

**Ini normal.** User yang login via social provider memiliki `password = null`. Jika ingin user juga bisa login dengan email+password:
1. Arahkan user ke fitur **Forgot Password**
2. User akan menerima email reset password
3. Setelah set password, user bisa login via email+password **dan** via social

### Login berhasil tapi redirect ke halaman kosong

**Penyebab:** `FRONTEND_URL` belum diset di `.env` backend

**Solusi:**
```env
FRONTEND_URL=http://localhost:3000
```

### Lint errors "Undefined method stateless"

**Ini adalah false positive** dari Intelephense (PHP IDE). Method `stateless()` ada di class `AbstractProvider` dari Socialite dan berjalan normal saat runtime. Bisa diabaikan.

---

## 📝 Ringkasan Perubahan

### Backend
```
backend/
├── app/
│   ├── Http/Controllers/Api/
│   │   └── SocialAuthController.php          ← BARU
│   └── Models/
│       └── User.php                          ← DIMODIFIKASI (fillable)
├── config/
│   └── services.php                          ← DIMODIFIKASI (Google & FB config)
├── database/migrations/
│   └── 2026_02_15_090000_add_social_...php   ← BARU
├── routes/
│   └── api.php                               ← DIMODIFIKASI (3 routes baru)
├── .env                                      ← DIMODIFIKASI (credentials)
└── .env.example                              ← DIMODIFIKASI (template)
```

### Frontend
```
frontend/src/
├── lib/api/
│   ├── auth.ts                               ← DIMODIFIKASI (socialLogin fn)
│   ├── config.ts                             ← DIMODIFIKASI (endpoints)
│   └── index.ts                              ← DIMODIFIKASI (exports)
├── app/
│   ├── (public)/
│   │   ├── login/page.tsx                    ← DIMODIFIKASI (button handlers)
│   │   └── register/page.tsx                 ← DIMODIFIKASI (button handlers)
│   └── auth/
│       └── social-callback/page.tsx          ← BARU
```
