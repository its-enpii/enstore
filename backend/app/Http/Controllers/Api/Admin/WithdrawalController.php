<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Services\BalanceService;
use App\Models\Notification;
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
     * List all withdrawals
     */
    public function index(Request $request)
    {
        $query = Withdrawal::with('user')
            ->orderBy('created_at', 'desc');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('reference_id', 'like', "%{$search}%");
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate($request->per_page ?? 20)
        ]);
    }

    /**
     * Show withdrawal detail
     */
    public function show($id)
    {
        $withdrawal = Withdrawal::with('user')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $withdrawal
        ]);
    }

    /**
     * Update withdrawal status (Approve/Reject)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,completed',
            'admin_note' => 'nullable|string|max:255'
        ]);

        $withdrawal = Withdrawal::with('user')->findOrFail($id);

        if (in_array($withdrawal->status, ['completed', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot change status of a finished withdrawal'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $oldStatus = $withdrawal->status;
            $newStatus = $request->status;

            $withdrawal->update([
                'status' => $newStatus,
                'admin_note' => $request->admin_note,
                'completed_at' => ($newStatus === 'completed' || $newStatus === 'approved') ? now() : null
            ]);

            // Handling Rejection: Refund the balance
            if ($newStatus === 'rejected') {
                $this->balanceService->addBalance(
                    $withdrawal->user,
                    $withdrawal->amount,
                    "Refund Penarikan Ditolak: {$withdrawal->reference_id}. Alasan: " . ($request->admin_note ?? 'N/A'),
                    null
                );

                Notification::create([
                    'user_id' => $withdrawal->user_id,
                    'title' => 'Penarikan Saldo Ditolak',
                    'message' => "Mohon maaf, penarikan saldo sebesar Rp " . number_format((float)$withdrawal->amount, 0, ',', '.') . " ditolak. Alasan: " . ($request->admin_note ?? 'Tidak disertakan'),
                    'type' => 'error',
                    'data' => [
                        'reference_id' => $withdrawal->reference_id,
                        'reason' => $request->admin_note
                    ]
                ]);
            }

            if ($newStatus === 'completed' || $newStatus === 'approved') {
                Notification::create([
                    'user_id' => $withdrawal->user_id,
                    'title' => 'Penarikan Saldo Berhasil',
                    'message' => "Penarikan saldo sebesar Rp " . number_format((float)$withdrawal->amount, 0, ',', '.') . " telah diproses/disetujui.",
                    'type' => 'success',
                    'data' => [
                        'reference_id' => $withdrawal->reference_id,
                        'status' => $newStatus
                    ]
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Withdrawal status updated to {$newStatus}",
                'data' => $withdrawal
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admin Withdrawal Update Status Error', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update status: ' . $e->getMessage()
            ], 500);
        }
    }
}
