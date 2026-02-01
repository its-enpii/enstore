<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\BalanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
  protected $balanceService;

  public function __construct(BalanceService $balanceService)
  {
    $this->balanceService = $balanceService;
  }

  /**
   * Get all users with filters
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function index(Request $request)
  {
    try {
      $query = User::with('balance');

      // Filter by role
      if ($request->has('role')) {
        $query->where('role', $request->role);
      }

      // Filter by customer type
      if ($request->has('customer_type')) {
        $query->where('customer_type', $request->customer_type);
      }

      // Filter by status
      if ($request->has('status')) {
        $query->where('status', $request->status);
      }

      // Filter by guest
      if ($request->has('is_guest')) {
        $query->where('is_guest', $request->is_guest);
      }

      // Search
      if ($request->has('search')) {
        $query->where(function ($q) use ($request) {
          $q->where('name', 'like', '%' . $request->search . '%')
            ->orWhere('email', 'like', '%' . $request->search . '%')
            ->orWhere('phone', 'like', '%' . $request->search . '%');
        });
      }

      // Sort
      $sortBy = $request->get('sort_by', 'created_at');
      $sortOrder = $request->get('sort_order', 'desc');
      $query->orderBy($sortBy, $sortOrder);

      // Paginate
      $perPage = $request->get('per_page', 20);
      $users = $query->paginate($perPage);

      return response()->json([
        'success' => true,
        'data' => $users,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to get users: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get single user
   * 
   * @param int $id
   * @return \Illuminate\Http\JsonResponse
   */
  public function show($id)
  {
    try {
      $user = User::with(['balance', 'transactions' => function ($query) {
        $query->latest()->limit(10);
      }])->findOrFail($id);

      return response()->json([
        'success' => true,
        'data' => $user,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'User not found',
      ], 404);
    }
  }

  /**
   * Create new user
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function store(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'name' => 'required|string|max:255',
      'email' => 'required|email|unique:users,email',
      'phone' => 'required|string|unique:users,phone',
      'password' => 'required|string|min:8',
      'role' => 'required|in:admin,customer',
      'customer_type' => 'required_if:role,customer|in:retail,reseller',
      'status' => 'in:active,inactive,suspended',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $validator->errors(),
      ], 422);
    }

    try {
      $data = $validator->validated();
      $data['password'] = Hash::make($data['password']);
      $data['is_guest'] = false;

      $user = User::create($data);

      // Create balance
      $this->balanceService->getOrCreateBalance($user);

      return response()->json([
        'success' => true,
        'message' => 'User created successfully',
        'data' => $user,
      ], 201);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to create user: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update user
   * 
   * @param Request $request
   * @param int $id
   * @return \Illuminate\Http\JsonResponse
   */
  public function update(Request $request, $id)
  {
    $validator = Validator::make($request->all(), [
      'name' => 'sometimes|string|max:255',
      'email' => 'sometimes|email|unique:users,email,' . $id,
      'phone' => 'sometimes|string|unique:users,phone,' . $id,
      'password' => 'sometimes|string|min:8',
      'role' => 'sometimes|in:admin,customer',
      'customer_type' => 'sometimes|in:retail,reseller',
      'status' => 'sometimes|in:active,inactive,suspended',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $validator->errors(),
      ], 422);
    }

    try {
      $user = User::findOrFail($id);

      $data = $validator->validated();
      if (isset($data['password'])) {
        $data['password'] = Hash::make($data['password']);
      }

      $user->update($data);

      return response()->json([
        'success' => true,
        'message' => 'User updated successfully',
        'data' => $user->fresh(),
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to update user: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Delete user
   * 
   * @param int $id
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroy($id)
  {
    try {
      $user = User::findOrFail($id);

      // Prevent deleting admin user
      if ($user->role === 'admin') {
        return response()->json([
          'success' => false,
          'message' => 'Cannot delete admin user',
        ], 403);
      }

      $user->delete();

      return response()->json([
        'success' => true,
        'message' => 'User deleted successfully',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to delete user: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Adjust user balance
   * 
   * @param Request $request
   * @param int $id
   * @return \Illuminate\Http\JsonResponse
   */
  public function adjustBalance(Request $request, $id)
  {
    $request->validate([
      'type' => 'required|in:add,deduct',
      'amount' => 'required|numeric|min:0',
      'description' => 'required|string',
    ]);

    try {
      $user = User::findOrFail($id);

      if ($request->type === 'add') {
        $this->balanceService->addBalance(
          $user,
          $request->amount,
          $request->description,
          null
        );
      } else {
        $this->balanceService->deductBalance(
          $user,
          $request->amount,
          $request->description,
          null
        );
      }

      return response()->json([
        'success' => true,
        'message' => 'Balance adjusted successfully',
        'data' => [
          'balance' => $user->balance->fresh(),
        ],
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to adjust balance: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get user statistics
   * 
   * @return \Illuminate\Http\JsonResponse
   */
  public function statistics()
  {
    try {
      $stats = [
        'total_users' => User::count(),
        'active_users' => User::where('status', 'active')->count(),
        'guest_users' => User::where('is_guest', true)->count(),
        'by_role' => [
          'admin' => User::where('role', 'admin')->count(),
          'customer' => User::where('role', 'customer')->count(),
        ],
        'by_customer_type' => [
          'retail' => User::where('customer_type', 'retail')->count(),
          'reseller' => User::where('customer_type', 'reseller')->count(),
        ],
        'new_users_this_month' => User::whereMonth('created_at', now()->month)->count(),
      ];

      return response()->json([
        'success' => true,
        'data' => $stats,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to get statistics: ' . $e->getMessage(),
      ], 500);
    }
  }
}
