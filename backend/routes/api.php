<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TripayCallbackController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Webhook routes (no authentication required)
Route::prefix('webhooks')->group(function () {
    Route::post('/tripay', [TripayCallbackController::class, 'handle']);
});

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Public Transaction Routes (Guest Checkout)
Route::post('/transactions/purchase', [App\Http\Controllers\Api\Public\PublicTransactionController::class, 'createPurchase']);
Route::get('/transactions/status/{transactionCode}', [App\Http\Controllers\Api\Public\PublicTransactionController::class, 'checkStatus']);
Route::get('/transactions/payment-channels', [App\Http\Controllers\Api\Public\PublicTransactionController::class, 'paymentChannels']);

// Public Product Routes (Catalog)
Route::prefix('products')->group(function () {
    Route::get('/', [App\Http\Controllers\Api\Customer\ProductController::class, 'index']);
    Route::get('/categories', [App\Http\Controllers\Api\Customer\ProductController::class, 'categories']);
    Route::get('/{id}', [App\Http\Controllers\Api\Customer\ProductController::class, 'show'])->whereNumber('id');
    Route::get('/slug/{slug}', [App\Http\Controllers\Api\Customer\ProductController::class, 'showBySlug']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
        Route::get('/profile', [AuthController::class, 'profile']);
    });

    // Admin only routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);

        // Products Management
        // Products Management
        Route::prefix('products')->group(function () {
            Route::post('/sync-digiflazz', [App\Http\Controllers\Api\Admin\ProductController::class, 'syncFromDigiflazz']);

            // Product Items (Separated Controller)
            Route::post('/bulk-update-prices', [App\Http\Controllers\Api\Admin\ProductItemController::class, 'bulkUpdate']);
            Route::post('/{id}/items', [App\Http\Controllers\Api\Admin\ProductItemController::class, 'store']);
            Route::get('/items/{id}', [App\Http\Controllers\Api\Admin\ProductItemController::class, 'show']);
            Route::put('/items/{id}', [App\Http\Controllers\Api\Admin\ProductItemController::class, 'update']);
            Route::delete('/items/{id}', [App\Http\Controllers\Api\Admin\ProductItemController::class, 'destroy']);

            // Parent Product
            Route::get('/', [App\Http\Controllers\Api\Admin\ProductController::class, 'index']);
            Route::post('/', [App\Http\Controllers\Api\Admin\ProductController::class, 'store']);
            Route::get('/{id}', [App\Http\Controllers\Api\Admin\ProductController::class, 'show']);
            Route::put('/{id}', [App\Http\Controllers\Api\Admin\ProductController::class, 'update']);
            Route::delete('/{id}', [App\Http\Controllers\Api\Admin\ProductController::class, 'destroy']);
        });

        // Transactions Management
        Route::prefix('transactions')->group(function () {
            Route::get('/', [App\Http\Controllers\Api\Admin\TransactionController::class, 'index']);
            Route::get('/statistics', [App\Http\Controllers\Api\Admin\TransactionController::class, 'statistics']);
            Route::get('/{id}', [App\Http\Controllers\Api\Admin\TransactionController::class, 'show']);
            Route::put('/{id}/status', [App\Http\Controllers\Api\Admin\TransactionController::class, 'updateStatus']);
        });

        // Users Management
        Route::prefix('users')->group(function () {
            Route::get('/', [App\Http\Controllers\Api\Admin\UserController::class, 'index']);
            Route::get('/statistics', [App\Http\Controllers\Api\Admin\UserController::class, 'statistics']);
            Route::get('/{id}', [App\Http\Controllers\Api\Admin\UserController::class, 'show']);
            Route::post('/', [App\Http\Controllers\Api\Admin\UserController::class, 'store']);
            Route::put('/{id}', [App\Http\Controllers\Api\Admin\UserController::class, 'update']);
            Route::delete('/{id}', [App\Http\Controllers\Api\Admin\UserController::class, 'destroy']);
            Route::post('/{id}/adjust-balance', [App\Http\Controllers\Api\Admin\UserController::class, 'adjustBalance']);
        });

        // Settings Management
        Route::prefix('settings')->group(function () {
            Route::get('/', [App\Http\Controllers\Api\Admin\SettingController::class, 'index']);
            Route::get('/profit-margins', [App\Http\Controllers\Api\Admin\SettingController::class, 'getProfitMargins']);
            Route::put('/profit-margins', [App\Http\Controllers\Api\Admin\SettingController::class, 'updateProfitMargins']);
            Route::get('/{key}', [App\Http\Controllers\Api\Admin\SettingController::class, 'show']);
            Route::post('/', [App\Http\Controllers\Api\Admin\SettingController::class, 'store']);
            Route::post('/bulk-update', [App\Http\Controllers\Api\Admin\SettingController::class, 'bulkUpdate']);
            Route::delete('/{key}', [App\Http\Controllers\Api\Admin\SettingController::class, 'destroy']);
        });

        // Reports
        Route::prefix('reports')->group(function () {
            Route::get('/sales', [App\Http\Controllers\Api\Admin\ReportController::class, 'salesReport']);
            Route::get('/products', [App\Http\Controllers\Api\Admin\ReportController::class, 'productReport']);
            Route::get('/users', [App\Http\Controllers\Api\Admin\ReportController::class, 'userReport']);
            Route::get('/balance', [App\Http\Controllers\Api\Admin\ReportController::class, 'balanceReport']);
            Route::get('/payment-methods', [App\Http\Controllers\Api\Admin\ReportController::class, 'paymentMethodReport']);
            Route::get('/export/transactions', [App\Http\Controllers\Api\Admin\ReportController::class, 'exportTransactions']);
        });

        // Activity Logs
        Route::prefix('activity-logs')->group(function () {
            Route::get('/', [App\Http\Controllers\Api\Admin\ActivityLogController::class, 'index']);
            Route::get('/statistics', [App\Http\Controllers\Api\Admin\ActivityLogController::class, 'statistics']);
            Route::get('/{id}', [App\Http\Controllers\Api\Admin\ActivityLogController::class, 'show']);
            Route::post('/clean', [App\Http\Controllers\Api\Admin\ActivityLogController::class, 'clean']);
        });
    });

    // Customer routes (both retail and reseller)
    Route::middleware('role:customer')->prefix('customer')->group(function () {


        // Transactions
        Route::prefix('transactions')->group(function () {
            Route::get('/', [App\Http\Controllers\Api\Customer\TransactionController::class, 'history']);
            Route::get('/payment-channels', [App\Http\Controllers\Api\Customer\TransactionController::class, 'paymentChannels']);
            Route::get('/{transactionCode}', [App\Http\Controllers\Api\Customer\TransactionController::class, 'show']);
            Route::post('/purchase', [App\Http\Controllers\Api\Customer\TransactionController::class, 'createPurchase']);
            Route::post('/purchase-balance', [App\Http\Controllers\Api\Customer\TransactionController::class, 'createBalancePurchase']);
            Route::post('/topup', [App\Http\Controllers\Api\Customer\TransactionController::class, 'createTopup']);
        });

        // Balance
        Route::prefix('balance')->group(function () {
            Route::get('/', [App\Http\Controllers\Api\Customer\BalanceController::class, 'index']);
            Route::get('/mutations', [App\Http\Controllers\Api\Customer\BalanceController::class, 'mutations']);
        });

        // Postpaid (PPOB)
        Route::prefix('postpaid')->group(function () {
            Route::post('/inquiry', [App\Http\Controllers\Api\Customer\PostpaidController::class, 'inquiry']);
            Route::post('/pay', [App\Http\Controllers\Api\Customer\PostpaidController::class, 'pay']);
        });

        // Profile
        Route::prefix('profile')->group(function () {
            Route::get('/', [App\Http\Controllers\Api\Customer\ProfileController::class, 'show']);
            Route::put('/', [App\Http\Controllers\Api\Customer\ProfileController::class, 'update']);
            Route::post('/change-password', [App\Http\Controllers\Api\Customer\ProfileController::class, 'changePassword']);
            Route::delete('/', [App\Http\Controllers\Api\Customer\ProfileController::class, 'deleteAccount']);
        });
    });
});
