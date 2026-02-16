<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\WithdrawalRequest;
use App\Models\Withdrawal;
use App\Services\BalanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WithdrawalController extends Controller
{
    protected $balanceService;

    public function __construct(BalanceService $balanceService)
    {
        $this->balanceService = $balanceService;
    }

    /**
     * Get user's withdrawal history
     */
    public function index()
    {
        $user = auth()->user();
        $withdrawals = Withdrawal::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $withdrawals
        ]);
    }

    /**
     * Submit a new withdrawal request
     */
    public function store(WithdrawalRequest $request)
    {
        $user = auth()->user();
        $amount = $request->amount;

        // 1. Check if user has sufficient balance
        if (!$this->balanceService->hasSufficientBalance($user, $amount)) {
            return response()->json([
                'success' => false,
                'message' => 'Saldo tidak mencukupi'
            ], 400);
        }

        DB::beginTransaction();

        try {
            // 2. Create Withdrawal Record
            $withdrawal = Withdrawal::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'payment_method' => $request->payment_method,
                'account_number' => $request->account_number,
                'account_name' => $request->account_name,
                'status' => 'pending',
            ]);

            // 3. Deduct balance immediately (Escrow-style)
            $this->balanceService->deductBalance(
                $user,
                $amount,
                "Penarikan Saldo: {$withdrawal->reference_id} - {$request->payment_method}",
                null // No purchase/topup transaction ID, but we could add reference in description
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Permintaan penarikan berhasil diajukan',
                'data' => $withdrawal
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Withdrawal Store Error', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses penarikan: ' . $e->getMessage()
            ], 500);
        }
    }
}
