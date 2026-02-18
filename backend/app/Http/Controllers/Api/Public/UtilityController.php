<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Helpers\PhoneHelper;

class UtilityController extends Controller
{
    /**
     * Lookup provider berdasarkan nomor telepon.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function lookupProvider(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string|min:4'
        ]);

        $phone = $request->phone;
        $provider = PhoneHelper::getProvider($phone);

        if (!$provider) {
            $normalized = PhoneHelper::normalize($phone);
            $prefix = substr($normalized, 0, 4);
            
            return response()->json([
                'success' => false,
                'message' => 'Provider tidak ditemukan untuk prefix ' . $prefix,
                'data' => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Provider ditemukan',
            'data' => [
                'phone' => PhoneHelper::normalize($phone),
                'prefix' => substr(PhoneHelper::normalize($phone), 0, 4),
                'provider_name' => $provider['name'],
                'provider_code' => $provider['code'],
            ]
        ]);
    }
}
