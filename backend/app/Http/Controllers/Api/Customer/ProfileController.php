<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Get user profile
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show()
    {
        try {
            $user = auth()->user()->load('balance');

            return response()->json([
                'success' => true,
                'data' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get profile: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update user profile
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20|unique:users,phone,' . $user->id,
            // Allow string (url or base64) or actual file (image)
            'avatar' => 'sometimes',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $request->only(['name', 'phone']);

            $supabaseStorage = app(\App\Services\SupabaseStorageService::class);

            // Handle Avatar Upload
            if ($request->hasFile('avatar')) {
                if ($user->avatar) {
                    $supabaseStorage->delete($user->avatar);
                }
                $data['avatar'] = $supabaseStorage->upload('avatars', $request->file('avatar'));
            }

            // Only update allowed fields
            $user->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $user->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Change password
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = auth()->user();

            // Verify current password
            if (! Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect',
                ], 400);
            }

            // Update password
            $user->update([
                'password' => Hash::make($request->new_password),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to change password: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete account
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteAccount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = auth()->user();

            // Verify password
            if (! Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password is incorrect',
                ], 400);
            }

            // Check if user has pending transactions
            $hasPendingTransactions = $user->transactions()
                ->whereIn('status', ['pending', 'processing'])
                ->exists();

            if ($hasPendingTransactions) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete account with pending transactions',
                ], 400);
            }

            // Delete account
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete account: ' . $e->getMessage(),
            ], 500);
        }
    }
}
