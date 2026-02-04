<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Transaction;
use App\Models\TransactionLog;
use App\Models\BalanceMutation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProcessDigiflazzOrder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $transaction;
    public $tries = 3; // Retry 3x if failed
    public $timeout = 120; // Timeout 2 minutes
    public $backoff = [60, 120, 300]; // Retry delays: 1min, 2min, 5min

    /**
     * Create a new job instance.
     */
    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        try {
            // Update status to processing
            $this->transaction->update(['status' => 'processing']);

            $this->createLog('pending', 'processing', 'Order is being processed to Digiflazz');

            // Get Digiflazz service
            $digiflazzService = app(\App\Services\DigiflazzService::class);

            // Format customer number based on product type
            $customerNo = $this->formatCustomerNumber();

            // Create transaction to Digiflazz
            $result = $digiflazzService->createTransaction(
                $this->transaction->product_code, // buyer_sku_code (digiflazz_code)
                $customerNo,
                $this->transaction->transaction_code // ref_id
            );

            $data = $result['data'];
            
            Log::info('Digiflazz Raw Response:', $data);

            // Parse response code
            $parsedResponse = $digiflazzService->parseResponseCode($data['rc'] ?? '999');

            $rc = (string) ($data['rc'] ?? '');
            $status = strtolower(trim($data['status'] ?? ''));

            Log::info('Digiflazz Decision Debug:', [
                'rc_raw' => $data['rc'] ?? null,
                'rc_processed' => $rc,
                'status_raw' => $data['status'] ?? null,
                'status_processed' => $status,
                'is_pending_check' => ($rc === '01' || $status === 'pending')
            ]);

            // Handle based on response code OR status string
            if ($rc === '00' || $status === 'sukses' || $status === 'success') {
                // ✅ SUCCESS
                $this->handleSuccess($data);
            } elseif ($rc === '01' || $status === 'pending') {
                // ⏳ PENDING - Will check again later
                $this->handlePending($data);
            } else {
                Log::warning('Digiflazz Decision: FELL TO ELSE BLOCK');
                // ❌ FAILED
                $this->handleFailed($data, $parsedResponse['message']);
            }
        } catch (\Exception $e) {
            Log::error('Process Digiflazz Order Error', [
                'transaction_code' => $this->transaction->transaction_code,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'attempt' => $this->attempts(),
            ]);

            // If max retries exceeded, mark as failed
            if ($this->attempts() >= $this->tries) {
                $this->handleFailed([
                    'message' => 'Maximum retry exceeded: ' . $e->getMessage(),
                    'rc' => '999',
                ], 'System error after maximum retries');
            } else {
                // Retry with backoff
                $delay = $this->backoff[$this->attempts() - 1] ?? 300;
                $this->release($delay);

                $this->createLog(
                    'processing',
                    'processing',
                    "Retry attempt {$this->attempts()} failed, will retry in {$delay} seconds"
                );
            }
        }
    }

    /**
     * Handle success response
     */
    private function handleSuccess($data)
    {
        DB::beginTransaction();

        try {
            $this->transaction->update([
                'status' => 'success',
                'digiflazz_trx_id' => $data['trx_id'] ?? null,
                'digiflazz_serial_number' => $data['sn'] ?? null,
                'digiflazz_message' => $data['message'] ?? 'Success',
                'digiflazz_status' => $data['status'] ?? 'Sukses',
                'digiflazz_rc' => $data['rc'] ?? '00',
                'completed_at' => now(),
            ]);

            $this->createLog('processing', 'success', 'Order completed successfully', $data);

            // Create notification for user (if Notification model exists and user exists)
            if ($this->transaction->user_id) {
                \App\Models\Notification::create([
                    'user_id' => $this->transaction->user_id,
                    'title' => 'Transaksi Berhasil!',
                    'message' => "Pesanan {$this->transaction->product_name} berhasil diproses.",
                    'type' => 'success',
                    'data' => [
                        'transaction_code' => $this->transaction->transaction_code,
                        'serial_number' => $data['sn'] ?? null,
                    ],
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Handle Success Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle pending response
     */
    private function handlePending($data)
    {
        $this->transaction->update([
            'status' => 'processing',
            'digiflazz_message' => $data['message'] ?? 'Pending',
            'digiflazz_status' => $data['status'] ?? 'Pending',
            'digiflazz_rc' => $data['rc'] ?? '01',
        ]);

        $this->createLog('processing', 'processing', 'Order is pending at Digiflazz', $data);

        // Dispatch job to check status in 2 minutes
        CheckDigiflazzOrderStatus::dispatch($this->transaction)
            ->delay(now()->addMinutes(2));
    }

    /**
     * Handle failed response
     */
    private function handleFailed($data, $errorMessage = null)
    {
        DB::beginTransaction();

        try {
            $this->transaction->update([
                'status' => 'failed',
                'digiflazz_message' => $data['message'] ?? 'Failed',
                'digiflazz_status' => $data['status'] ?? 'Gagal',
                'digiflazz_rc' => $data['rc'] ?? '999',
                'failed_at' => now(),
            ]);

            $message = $errorMessage ?? ($data['message'] ?? 'Unknown error');
            $this->createLog('processing', 'failed', 'Order failed: ' . $message, $data);

            // Refund if payment via balance
            if ($this->transaction->payment_method_type === 'balance') {
                $this->refundBalance();
            }

            // Create notification (only if user exists)
            if ($this->transaction->user_id) {
                \App\Models\Notification::create([
                    'user_id' => $this->transaction->user_id,
                    'title' => 'Transaksi Gagal',
                    'message' => "Pesanan {$this->transaction->product_name} gagal diproses. {$message}",
                    'type' => 'error',
                    'data' => [
                        'transaction_code' => $this->transaction->transaction_code,
                        'error' => $message,
                    ],
                ]);
            }

            DB::commit();

            Log::warning('Digiflazz Order Failed', [
                'transaction_code' => $this->transaction->transaction_code,
                'error' => $message,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Handle Failed Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Refund balance to user
     */
    private function refundBalance()
    {
        try {
            $user = $this->transaction->user;

            if (!$user) {
                return;
            }

            $balance = $user->balance;

            if (!$balance) {
                Log::warning('No balance found for user', ['user_id' => $user->id]);
                return;
            }

            // Add back the amount
            $balance->increment('amount', $this->transaction->total_amount);

            // Create balance mutation record
            BalanceMutation::create([
                'balance_id' => $balance->id,
                'transaction_id' => $this->transaction->id,
                'type' => 'credit',
                'amount' => $this->transaction->total_amount,
                'balance_before' => $balance->amount - $this->transaction->total_amount,
                'balance_after' => $balance->amount,
                'description' => 'Refund for failed transaction: ' . $this->transaction->transaction_code,
            ]);

            Log::info('Balance refunded', [
                'user_id' => $user->id,
                'amount' => $this->transaction->total_amount,
            ]);
        } catch (\Exception $e) {
            Log::error('Refund Balance Error: ' . $e->getMessage());
        }
    }

    /**
     * Format customer number based on product type
     */
    private function formatCustomerNumber()
    {
        $customerData = $this->transaction->customer_data;
        $productType = $this->transaction->product->type ?? 'other';

        $digiflazzService = app(\App\Services\DigiflazzService::class);
        return $digiflazzService->formatCustomerNumber($customerData, $productType);
    }

    /**
     * Create transaction log
     */
    private function createLog($statusFrom, $statusTo, $message, $metaData = null)
    {
        TransactionLog::create([
            'transaction_id' => $this->transaction->id,
            'status_from' => $statusFrom,
            'status_to' => $statusTo,
            'message' => $message,
            'meta_data' => $metaData,
        ]);
    }

    /**
     * Handle job failure
     */
    public function failed(\Throwable $exception)
    {
        Log::error('ProcessDigiflazzOrder Job Failed Permanently', [
            'transaction_code' => $this->transaction->transaction_code,
            'error' => $exception->getMessage(),
        ]);

        $this->handleFailed([
            'message' => 'Job failed permanently: ' . $exception->getMessage(),
            'rc' => '999',
        ], 'System error - job failed permanently');
    }
}
