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

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
        Route::get('/profile', [AuthController::class, 'profile']);
    });

    // Example: Admin only routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Add admin routes here
    });

    // Example: Customer routes (both retail and reseller)
    Route::middleware('role:customer')->prefix('customer')->group(function () {
        // Add customer routes here
    });
});
