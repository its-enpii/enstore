<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Supported social providers
     */
    private array $supportedProviders = ['google', 'facebook'];

    /**
     * Get the social login redirect URL
     * Returns the OAuth provider URL for the frontend to redirect to
     */
    public function redirect(string $provider): JsonResponse
    {
        if (! in_array($provider, $this->supportedProviders)) {
            return response()->json([
                'success' => false,
                'message' => 'Provider tidak didukung. Gunakan: '.implode(', ', $this->supportedProviders),
            ], 400);
        }

        try {
            $redirectUrl = Socialite::driver($provider)
                ->stateless()
                ->redirect()
                ->getTargetUrl();

            return response()->json([
                'success' => true,
                'data' => [
                    'redirect_url' => $redirectUrl,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat URL redirect untuk '.$provider,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle the callback from the social provider
     * This is called when the user is redirected back from Google/Facebook
     */
    public function callback(string $provider): mixed
    {
        if (! in_array($provider, $this->supportedProviders)) {
            return $this->redirectToFrontendWithError('Provider tidak didukung');
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();

            $user = $this->findOrCreateUser($socialUser, $provider);

            if (! $user) {
                return $this->redirectToFrontendWithError('Gagal membuat akun');
            }

            // Check if user is active
            if ($user->status !== 'active') {
                return $this->redirectToFrontendWithError('Akun Anda tidak aktif. Silakan hubungi admin.');
            }

            // Update last login
            $user->update([
                'last_login_at' => now(),
            ]);

            // Revoke previous tokens and create new one
            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect to frontend with token
            return $this->redirectToFrontendWithToken($token, $user);
        } catch (\Exception $e) {
            \Log::error("Social auth callback error ({$provider}): ".$e->getMessage());
            \Log::error($e->getTraceAsString());

            return $this->redirectToFrontendWithError('Login dengan '.ucfirst($provider).' gagal. Silakan coba lagi.');
        }
    }

    /**
     * Handle the callback from frontend (token-based flow)
     * The frontend sends the authorization code/token directly
     */
    public function handleToken(Request $request, string $provider): JsonResponse
    {
        if (! in_array($provider, $this->supportedProviders)) {
            return response()->json([
                'success' => false,
                'message' => 'Provider tidak didukung',
            ], 400);
        }

        $request->validate([
            'access_token' => 'required|string',
        ]);

        try {
            $socialUser = Socialite::driver($provider)
                ->stateless()
                ->userFromToken($request->access_token);

            $user = $this->findOrCreateUser($socialUser, $provider);

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal membuat akun',
                ], 500);
            }

            // Check if user is active
            if ($user->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akun Anda tidak aktif. Silakan hubungi admin.',
                ], 403);
            }

            // Update last login
            $user->update([
                'last_login_at' => now(),
                'last_login_ip' => $request->ip(),
            ]);

            // Revoke previous tokens and create new one
            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'role' => $user->role,
                        'customer_type' => $user->customer_type,
                        'avatar' => $user->avatar ?? $user->social_avatar,
                    ],
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error("Social auth token error ({$provider}): ".$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Login dengan '.ucfirst($provider).' gagal',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Find existing user or create a new one from social provider data
     */
    private function findOrCreateUser($socialUser, string $provider): ?User
    {
        $socialIdField = $provider.'_id';

        // 1. Check if user already linked with this social provider
        $user = User::where($socialIdField, $socialUser->getId())->first();
        if ($user) {
            // Update social avatar if changed
            $user->update([
                'social_avatar' => $socialUser->getAvatar(),
            ]);

            return $user;
        }

        // 2. Check if user exists with same email
        if ($socialUser->getEmail()) {
            $user = User::where('email', $socialUser->getEmail())
                ->where('is_guest', false)
                ->first();

            if ($user) {
                // Link social account to existing user
                $user->update([
                    $socialIdField => $socialUser->getId(),
                    'social_avatar' => $socialUser->getAvatar(),
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ]);

                return $user;
            }
        }

        // 3. Create new user
        try {
            DB::beginTransaction();

            // Generate unique referral code
            $referralCode = $this->generateUniqueReferralCode();

            $user = User::create([
                'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                'email' => $socialUser->getEmail(),
                'phone' => null,
                'password' => null,
                $socialIdField => $socialUser->getId(),
                'social_avatar' => $socialUser->getAvatar(),
                'customer_type' => 'retail',
                'role' => 'customer',
                'is_guest' => false,
                'status' => 'active',
                'referral_code' => $referralCode,
                'email_verified_at' => now(), // Email is verified through social provider
            ]);

            DB::commit();

            return $user;
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to create social user: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Generate unique referral code
     */
    private function generateUniqueReferralCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Redirect to frontend with auth token
     */
    private function redirectToFrontendWithToken(string $token, User $user)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $params = http_build_query([
            'token' => $token,
            'role' => $user->role,
            'customer_type' => $user->customer_type ?? '',
        ]);

        return redirect("{$frontendUrl}/auth/social-callback?{$params}");
    }

    /**
     * Redirect to frontend with error message
     */
    private function redirectToFrontendWithError(string $message)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $params = http_build_query([
            'error' => $message,
        ]);

        return redirect("{$frontendUrl}/auth/social-callback?{$params}");
    }
}
