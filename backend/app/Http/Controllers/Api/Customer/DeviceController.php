<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\UserDevice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeviceController extends Controller
{
    /**
     * Register or update a user device for FCM
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'required|string',
            'fcm_token' => 'required|string',
            'device_name' => 'nullable|string',
            'platform' => 'required|in:android,ios,web,other',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $device = UserDevice::updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'device_id' => $request->device_id,
                ],
                [
                    'fcm_token' => $request->fcm_token,
                    'device_name' => $request->device_name,
                    'platform' => $request->platform,
                    'last_active_at' => now(),
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Device berhasil didaftarkan',
                'data' => $device
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendaftarkan device',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a device (e.g. on logout or token expiry)
     */
    public function destroy(Request $request, $deviceId): JsonResponse
    {
        try {
            UserDevice::where('user_id', $request->user()->id)
                ->where('device_id', $deviceId)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Device berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus device'
            ], 500);
        }
    }
}
