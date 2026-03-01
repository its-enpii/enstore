<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Services\BalanceService;
use Illuminate\Http\Request;

class BalanceController extends Controller
{
    protected $balanceService;

    public function __construct(BalanceService $balanceService)
    {
        $this->balanceService = $balanceService;
    }

    /**
     * Get current balance
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $user = auth()->user();
            $balance = $this->balanceService->getOrCreateBalance($user);
            $availableBalance = $this->balanceService->getAvailableBalance($user);

            return response()->json([
                'success' => true,
                'data' => [
                    'balance' => $balance->balance,
                    'bonus_balance' => $balance->bonus_balance,
                    'available_balance' => $availableBalance,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get balance: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get balance mutations (history)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function mutations(Request $request)
    {
        try {
            $user = auth()->user();
            $limit = $request->get('limit', 50);

            $mutations = $this->balanceService->getMutations($user, $limit);

            return response()->json([
                'success' => true,
                'data' => $mutations,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get balance mutations: ' . $e->getMessage(),
            ], 500);
        }
    }
}
