<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class AppConfigController extends Controller
{
    /**
     * Get public application configuration for mobile
     */
    public function index(): JsonResponse
    {
        // We Use Cache to avoid DB overhead for very frequent calls
        $config = Cache::remember('app_mobile_config', 3600, function () {
            return [
                'app_name' => config('app.name', 'Enstore'),
                'version' => [
                    'latest' => '1.0.0',
                    'min_required' => '1.0.0',
                ],
                'features' => [
                    'topup_balance' => true,
                    'reseller_registration' => false, // Forced retail for now
                    'guest_checkout' => true,
                    'social_login' => true,
                ],
                'maintenance' => [
                    'active' => false,
                    'message' => 'Kami sedang melakukan pemeliharaan rutin.',
                ],
                'links' => [
                    'privacy_policy' => url('/privacy-policy'),
                    'terms_service' => url('/terms-service'),
                    'whatsapp_support' => 'https://wa.me/6281234567890',
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $config
        ]);
    }
}
