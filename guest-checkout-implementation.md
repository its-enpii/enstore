# 👤 GUEST CHECKOUT IMPLEMENTATION

## 🎯 Konsep: Auto-Create Guest User

Setiap customer yang checkout **tanpa login**, otomatis dibuatkan akun guest berdasarkan email mereka.

### Benefits:
✅ Customer tidak perlu registrasi manual  
✅ Data transaksi tetap terorganisir  
✅ Bisa kirim notifikasi ke email/phone customer  
✅ Guest bisa upgrade ke member kapan saja  
✅ Tracking repeat customer lebih mudah  

---

## 🗄️ DATABASE SCHEMA

### 1. Modifikasi Tabel `users`

```sql
ALTER TABLE users 
ADD COLUMN is_guest BOOLEAN DEFAULT FALSE AFTER customer_type,
ADD COLUMN email_verified_at TIMESTAMP NULL AFTER is_guest,
ADD INDEX idx_is_guest (is_guest),
ADD INDEX idx_email_guest (email, is_guest);

-- Password boleh null untuk guest (jika tidak set password)
ALTER TABLE users 
MODIFY password VARCHAR(255) NULL;
```

### Field Explanation:
- `is_guest`: TRUE = guest user, FALSE = registered user
- `email_verified_at`: NULL untuk guest (belum verify)
- `password`: NULL untuk guest yang belum set password

---

## 🔄 GUEST CHECKOUT FLOW

### Step-by-Step Process

```
1. Customer Landing di Website
   └─ Belum login, lihat produk

2. Customer Pilih Produk
   ├─ Klik "Beli Sekarang"
   └─ Redirect ke checkout page

3. Checkout Form (Guest)
   ┌────────────────────────────────────┐
   │ Email *: customer@email.com        │
   │ WhatsApp *: 081234567890           │
   │ Name: John Doe (optional)          │
   ├────────────────────────────────────┤
   │ User ID Game *: 12345678           │
   │ Zone ID *: 1234                    │
   ├────────────────────────────────────┤
   │ [ ] Simpan data saya (opsional)    │
   │     → Jika dicentang, set password │
   └────────────────────────────────────┘

4. Submit Checkout
   ├─ Validasi email & phone
   │
   ├─ Check: Apakah email sudah ada?
   │   ├─ YES → Use existing user
   │   └─ NO → Create new guest user
   │
   └─ Create transaction

5. Process Payment
   └─ (sama seperti flow sebelumnya)

6. Send Result
   ├─ Email ke customer
   ├─ WhatsApp notification
   └─ Show result page

7. (Optional) Invite to Register
   └─ "Transaksi berhasil! Daftar member untuk harga lebih murah?"
```

---

## 💻 CODE IMPLEMENTATION

### 1. Guest User Service

```php
<?php

namespace App\Services;

use App\Models\User;
use App\Models\Balance;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class GuestUserService
{
    /**
     * Get or create guest user by email
     */
    public function getOrCreateGuestUser(array $data)
    {
        // Check if user with this email already exists
        $user = User::where('email', $data['email'])->first();
        
        if ($user) {
            // Update phone if different (in case customer changed phone)
            if ($user->phone !== $data['phone']) {
                $user->update(['phone' => $data['phone']]);
            }
            
            // Update name if provided and current is default
            if (!empty($data['name']) && $user->name === 'Guest User') {
                $user->update(['name' => $data['name']]);
            }
            
            return $user;
        }
        
        // Create new guest user
        $user = User::create([
            'name' => $data['name'] ?? 'Guest User',
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => isset($data['password']) 
                ? Hash::make($data['password']) 
                : null,
            'role' => 'customer',
            'customer_type' => 'retail',
            'is_guest' => empty($data['password']), // FALSE if password set
            'status' => 'active',
        ]);
        
        // Create balance record (always 0 for retail)
        Balance::create([
            'user_id' => $user->id,
            'balance' => 0,
            'bonus_balance' => 0,
        ]);
        
        return $user;
    }
    
    /**
     * Upgrade guest to registered user
     */
    public function upgradeToMember(User $user, string $password)
    {
        if (!$user->is_guest) {
            throw new \Exception('User is already a member');
        }
        
        $user->update([
            'password' => Hash::make($password),
            'is_guest' => false,
        ]);
        
        return $user;
    }
    
    /**
     * Upgrade retail to reseller
     */
    public function upgradeToReseller(User $user)
    {
        if ($user->customer_type !== 'retail') {
            throw new \Exception('User is already a reseller');
        }
        
        $user->update([
            'customer_type' => 'reseller',
        ]);
        
        return $user;
    }
}
```

### 2. Guest Checkout Controller

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GuestUserService;
use App\Services\TripayService;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\Payment;
use App\Models\TransactionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GuestCheckoutController extends Controller
{
    protected $guestUserService;
    protected $tripayService;
    
    public function __construct(
        GuestUserService $guestUserService,
        TripayService $tripayService
    ) {
        $this->guestUserService = $guestUserService;
        $this->tripayService = $tripayService;
    }
    
    /**
     * Guest checkout
     */
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            // Guest data
            'email' => 'required|email',
            'phone' => 'required|string|min:10|max:15',
            'name' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:8', // Optional
            
            // Product
            'product_id' => 'required|exists:products,id',
            'customer_data' => 'required|array', // {user_id, zone_id, etc}
            
            // Payment
            'payment_method' => 'required|string',
        ]);
        
        $product = Product::findOrFail($validated['product_id']);
        
        // Check product availability
        if (!$product->is_active || $product->stock_status !== 'available') {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak tersedia',
            ], 400);
        }
        
        DB::beginTransaction();
        try {
            // 1. Get or create guest user
            $user = $this->guestUserService->getOrCreateGuestUser([
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'name' => $validated['name'] ?? null,
                'password' => $validated['password'] ?? null,
            ]);
            
            // 2. Determine price (retail for guest)
            $price = $product->retail_price;
            $adminFee = 1500; // or get from settings
            $totalPrice = $price + $adminFee;
            
            // 3. Generate transaction code
            $transactionCode = $this->generateTransactionCode();
            
            // 4. Create transaction
            $transaction = Transaction::create([
                'transaction_code' => $transactionCode,
                'user_id' => $user->id,
                'product_id' => $product->id,
                'customer_type' => 'retail',
                'payment_type' => 'gateway',
                'product_name' => $product->name,
                'product_code' => $product->digiflazz_code,
                'product_price' => $price,
                'admin_fee' => $adminFee,
                'total_price' => $totalPrice,
                'customer_data' => $validated['customer_data'],
                'status' => 'pending',
                'payment_status' => 'pending',
                'expired_at' => now()->addHours(2),
            ]);
            
            // 5. Create payment via Tripay
            $tripayPayment = $this->tripayService->createPayment([
                'method' => $validated['payment_method'],
                'merchant_ref' => $transactionCode,
                'amount' => $totalPrice,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => $user->phone,
                'order_items' => [[
                    'name' => $product->name,
                    'price' => $price,
                    'quantity' => 1,
                ]],
                'expired_time' => now()->addHours(2)->timestamp,
                'return_url' => route('transaction.result', $transactionCode),
            ]);
            
            // 6. Save payment data
            $payment = Payment::create([
                'transaction_id' => $transaction->id,
                'payment_reference' => $tripayPayment['reference'],
                'payment_method' => $tripayPayment['payment_method'],
                'payment_channel' => $tripayPayment['payment_name'],
                'payment_code' => $tripayPayment['pay_code'] ?? null,
                'amount' => $totalPrice,
                'fee' => $tripayPayment['total_fee']['customer'] ?? 0,
                'total_amount' => $tripayPayment['amount_received'],
                'qr_url' => $tripayPayment['qr_url'] ?? null,
                'checkout_url' => $tripayPayment['checkout_url'] ?? null,
                'payment_instructions' => $tripayPayment['instructions'] ?? null,
                'expired_at' => $tripayPayment['expired_time'],
            ]);
            
            // 7. Log
            TransactionLog::create([
                'transaction_id' => $transaction->id,
                'status_from' => null,
                'status_to' => 'pending',
                'message' => $user->is_guest 
                    ? 'Guest checkout - Transaction created' 
                    : 'Member checkout - Transaction created',
            ]);
            
            DB::commit();
            
            // 8. Return response
            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil dibuat',
                'data' => [
                    'transaction_code' => $transactionCode,
                    'payment' => [
                        'method' => $payment->payment_channel,
                        'code' => $payment->payment_code,
                        'amount' => $payment->total_amount,
                        'qr_url' => $payment->qr_url,
                        'checkout_url' => $payment->checkout_url,
                        'instructions' => $payment->payment_instructions,
                        'expired_at' => $payment->expired_at,
                    ],
                    'is_new_user' => $user->wasRecentlyCreated,
                    'upgrade_prompt' => $user->is_guest, // Prompt to register
                ],
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Generate unique transaction code
     */
    private function generateTransactionCode()
    {
        do {
            $code = 'TRX-' . date('Ymd') . '-' . strtoupper(Str::random(6));
        } while (Transaction::where('transaction_code', $code)->exists());
        
        return $code;
    }
    
    /**
     * Get transaction status (for guest)
     */
    public function getTransactionStatus(Request $request)
    {
        $validated = $request->validate([
            'transaction_code' => 'required|string',
            'email' => 'required|email', // Verify ownership
        ]);
        
        $transaction = Transaction::with(['user', 'payment', 'product'])
            ->where('transaction_code', $validated['transaction_code'])
            ->whereHas('user', function($query) use ($validated) {
                $query->where('email', $validated['email']);
            })
            ->first();
        
        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan',
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'transaction_code' => $transaction->transaction_code,
                'product_name' => $transaction->product_name,
                'total_price' => $transaction->total_price,
                'status' => $transaction->status,
                'payment_status' => $transaction->payment_status,
                'customer_data' => $transaction->customer_data,
                'serial_number' => $transaction->digiflazz_serial_number,
                'created_at' => $transaction->created_at,
                'payment' => $transaction->payment ? [
                    'method' => $transaction->payment->payment_channel,
                    'code' => $transaction->payment->payment_code,
                    'status' => $transaction->payment->status,
                    'expired_at' => $transaction->payment->expired_at,
                ] : null,
            ],
        ]);
    }
}
```

### 3. Upgrade Guest to Member

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GuestUserService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UpgradeAccountController extends Controller
{
    protected $guestUserService;
    
    public function __construct(GuestUserService $guestUserService)
    {
        $this->guestUserService = $guestUserService;
    }
    
    /**
     * Upgrade guest to registered member
     */
    public function upgradeToMember(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);
        
        $user = User::where('email', $validated['email'])->first();
        
        if (!$user->is_guest) {
            return response()->json([
                'success' => false,
                'message' => 'Akun sudah terdaftar sebagai member',
            ], 400);
        }
        
        try {
            $this->guestUserService->upgradeToMember($user, $validated['password']);
            
            return response()->json([
                'success' => true,
                'message' => 'Akun berhasil di-upgrade ke member!',
                'data' => [
                    'email' => $user->email,
                    'is_guest' => false,
                ],
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Upgrade retail to reseller
     */
    public function upgradeToReseller(Request $request)
    {
        $user = auth()->user();
        
        if ($user->customer_type !== 'retail') {
            return response()->json([
                'success' => false,
                'message' => 'Akun sudah reseller',
            ], 400);
        }
        
        try {
            $this->guestUserService->upgradeToReseller($user);
            
            return response()->json([
                'success' => true,
                'message' => 'Akun berhasil di-upgrade ke reseller!',
                'data' => [
                    'customer_type' => 'reseller',
                    'benefits' => [
                        'Harga lebih murah',
                        'Sistem deposit',
                        'Dashboard reseller',
                    ],
                ],
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
```

---

## 🎨 FRONTEND FLOW

### Guest Checkout Form (React/Next.js Example)

```jsx
// components/GuestCheckoutForm.jsx
import { useState } from 'react';
import axios from 'axios';

export default function GuestCheckoutForm({ product }) {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    password: '',
    createAccount: false,
    customer_data: {
      user_id: '',
      zone_id: '',
    },
    payment_method: '',
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        email: formData.email,
        phone: formData.phone,
        name: formData.name || undefined,
        password: formData.createAccount ? formData.password : undefined,
        product_id: product.id,
        customer_data: formData.customer_data,
        payment_method: formData.payment_method,
      };
      
      const response = await axios.post('/api/guest/checkout', payload);
      
      if (response.data.success) {
        // Redirect to payment page
        window.location.href = response.data.data.payment.checkout_url;
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Contact Info */}
      <div>
        <label>Email *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="email@example.com"
        />
      </div>
      
      <div>
        <label>WhatsApp *</label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          placeholder="08123456789"
        />
      </div>
      
      <div>
        <label>Nama (opsional)</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="John Doe"
        />
      </div>
      
      {/* Game Data */}
      <div>
        <label>User ID Game *</label>
        <input
          type="text"
          required
          value={formData.customer_data.user_id}
          onChange={(e) => setFormData({
            ...formData,
            customer_data: {...formData.customer_data, user_id: e.target.value}
          })}
        />
      </div>
      
      <div>
        <label>Zone ID *</label>
        <input
          type="text"
          required
          value={formData.customer_data.zone_id}
          onChange={(e) => setFormData({
            ...formData,
            customer_data: {...formData.customer_data, zone_id: e.target.value}
          })}
        />
      </div>
      
      {/* Create Account Option */}
      <div className="border-t pt-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.createAccount}
            onChange={(e) => setFormData({...formData, createAccount: e.target.checked})}
          />
          <span>Simpan data saya untuk pembelian selanjutnya</span>
        </label>
        
        {formData.createAccount && (
          <div className="mt-2">
            <label>Password *</label>
            <input
              type="password"
              required={formData.createAccount}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Minimal 8 karakter"
            />
          </div>
        )}
      </div>
      
      {/* Payment Method */}
      <div>
        <label>Metode Pembayaran *</label>
        <select
          required
          value={formData.payment_method}
          onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
        >
          <option value="">Pilih metode</option>
          <option value="QRIS">QRIS</option>
          <option value="BRIVA">BRI Virtual Account</option>
          <option value="BCAVA">BCA Virtual Account</option>
        </select>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        {loading ? 'Processing...' : `Bayar Rp ${product.retail_price.toLocaleString()}`}
      </button>
    </form>
  );
}
```

---

## 📧 EMAIL NOTIFICATION

### After Successful Transaction

```php
// app/Mail/GuestTransactionSuccess.php
namespace App\Mail;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GuestTransactionSuccess extends Mailable
{
    use Queueable, SerializesModels;
    
    public $transaction;
    
    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }
    
    public function build()
    {
        $isGuest = $this->transaction->user->is_guest;
        
        return $this->subject('Transaksi Berhasil - ' . $this->transaction->transaction_code)
            ->view('emails.transaction-success')
            ->with([
                'transaction' => $this->transaction,
                'show_upgrade_prompt' => $isGuest, // Show register prompt
            ]);
    }
}
```

### Email Template (Blade)

```html
<!-- resources/views/emails/transaction-success.blade.php -->
<h1>Transaksi Berhasil!</h1>

<p>Terima kasih telah berbelanja di {{ config('app.name') }}</p>

<h2>Detail Transaksi</h2>
<ul>
    <li><strong>Kode:</strong> {{ $transaction->transaction_code }}</li>
    <li><strong>Produk:</strong> {{ $transaction->product_name }}</li>
    <li><strong>Total:</strong> Rp {{ number_format($transaction->total_price) }}</li>
    <li><strong>Status:</strong> {{ $transaction->status }}</li>
</ul>

@if($transaction->digiflazz_serial_number)
<h2>Kode Voucher</h2>
<div style="background: #f0f0f0; padding: 15px; font-size: 20px; font-weight: bold;">
    {{ $transaction->digiflazz_serial_number }}
</div>
@endif

@if($show_upgrade_prompt)
<hr>
<h3>💡 Ingin Harga Lebih Murah?</h3>
<p>Daftar sebagai member dan dapatkan:</p>
<ul>
    <li>Harga lebih murah 10-20%</li>
    <li>Transaksi lebih cepat (tanpa isi data berulang)</li>
    <li>History transaksi</li>
    <li>Upgrade ke reseller untuk harga grosir</li>
</ul>
<a href="{{ route('register', ['email' => $transaction->user->email]) }}" 
   style="display: inline-block; background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none;">
    Daftar Sekarang
</a>
@endif
```

---

## 🔒 SECURITY CONSIDERATIONS

### 1. Prevent Spam
```php
// Add rate limiting
Route::post('/guest/checkout', [GuestCheckoutController::class, 'checkout'])
    ->middleware('throttle:5,1'); // Max 5 requests per minute
```

### 2. Email Verification (Optional)
```php
// Add email verification for guest upgrade
if ($user->is_guest && !$user->email_verified_at) {
    // Send verification email
    event(new Registered($user));
}
```

### 3. Phone Verification (Optional)
Send OTP via WhatsApp before checkout

---

## 📊 ANALYTICS & TRACKING

### Guest Conversion Rate

```sql
-- How many guest converted to member?
SELECT 
    COUNT(*) as total_guests,
    SUM(CASE WHEN is_guest = 0 THEN 1 ELSE 0 END) as converted,
    ROUND(SUM(CASE WHEN is_guest = 0 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as conversion_rate
FROM users
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### Repeat Guest Customers

```sql
-- Guests who made multiple purchases
SELECT 
    u.email,
    u.name,
    COUNT(t.id) as total_transactions,
    SUM(t.total_price) as total_spent
FROM users u
JOIN transactions t ON u.id = t.user_id
WHERE u.is_guest = 1
GROUP BY u.id
HAVING total_transactions > 1
ORDER BY total_spent DESC;
```

---

## ✅ SUMMARY

**Flow untuk Pelanggan Biasa (Retail/Guest):**

1. ❌ **TIDAK** ada user ID 1 untuk semua guest
2. ✅ Setiap guest **auto-create user** berdasarkan email
3. ✅ Email yang sama = user yang sama (tracking repeat customer)
4. ✅ Guest bisa **upgrade ke member** kapan saja
5. ✅ Data tetap terorganisir untuk notifikasi & komplain
6. ✅ Mudah untuk marketing retargeting

**Keuntungan Approach Ini:**
- Clean data structure
- Easy to track & analyze
- Smooth upgrade path
- Better customer experience
- Email marketing ready

---

**Siap diimplementasikan! 🚀**
