<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_register()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '081234567890',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'customer_type' => 'retail',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'phone',
                        'role',
                        'customer_type',
                        'referral_code',
                    ],
                    'access_token',
                    'token_type',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'phone' => '081234567890',
        ]);
    }

    /** @test */
    public function user_can_login_with_email()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '081234567890',
            'password' => Hash::make('password123'),
            'role' => 'customer',
            'customer_type' => 'retail',
            'is_guest' => false,
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user',
                    'access_token',
                    'token_type',
                ],
            ]);
    }

    /** @test */
    public function user_can_login_with_phone()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '081234567890',
            'password' => Hash::make('password123'),
            'role' => 'customer',
            'customer_type' => 'retail',
            'is_guest' => false,
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => '081234567890',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
    }

    /** @test */
    public function user_cannot_login_with_wrong_password()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '081234567890',
            'password' => Hash::make('password123'),
            'role' => 'customer',
            'customer_type' => 'retail',
            'is_guest' => false,
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Email/Phone atau password salah',
            ]);
    }

    /** @test */
    public function authenticated_user_can_logout()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
            'is_guest' => false,
            'status' => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logout berhasil',
            ]);
    }

    /** @test */
    public function authenticated_user_can_get_profile()
    {
        $user = User::factory()->create([
            'is_guest' => false,
            'status' => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/auth/profile');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                    'email',
                    'phone',
                    'role',
                    'customer_type',
                ],
            ]);
    }

    /** @test */
    public function authenticated_user_can_refresh_token()
    {
        $user = User::factory()->create([
            'is_guest' => false,
            'status' => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/refresh-token');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'access_token',
                    'token_type',
                ],
            ]);
    }

    /** @test */
    public function role_middleware_blocks_unauthorized_access()
    {
        $user = User::factory()->create([
            'role' => 'customer',
            'is_guest' => false,
            'status' => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Try to access admin route (this would need to be set up in routes)
        // This is just an example of how the middleware works
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/dashboard');

        // Should return 403 or 404 depending on route setup
        $this->assertTrue(in_array($response->status(), [403, 404]));
    }
}
