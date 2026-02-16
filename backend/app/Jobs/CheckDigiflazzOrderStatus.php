<?php

namespace App\Jobs;

use App\Models\Transaction;
use App\Models\TransactionLog;
use App\Services\TransactionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckDigiflazzOrderStatus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $transaction;

    public $tries = 5; // Check up to 5 times

    public $timeout = 60;

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
            // Skip if transaction is already completed or failed
            if (in_array($this->transaction->status, ['success', 'failed', 'cancelled'])) {
                return;
            }

            $digiflazzService = app(\App\Services\DigiflazzService::class);

            // Format customer number
            $customerData = $this->transaction->customer_data;
            $productType = $this->transaction->product->type ?? 'other';
            $customerNo = $digiflazzService->formatCustomerNumber($customerData, $productType);

            // Check transaction status
            $result = $digiflazzService->checkTransactionStatus(
                $this->transaction->product_code,
                $customerNo,
                $this->transaction->transaction_code
            );

            $data = $result['data'];

            // Parse response
            $parsedResponse = $digiflazzService->parseResponseCode($data['rc'] ?? '999');

            $rc = (string) ($data['rc'] ?? '');
            $status = strtolower(trim($data['status'] ?? ''));

            if ($rc === '00' || $status === 'sukses' || $status === 'success') {
                // ✅ SUCCESS
                $this->handleSuccess($data);
            } elseif ($rc === '01' || $status === 'pending') {
                // ⏳ STILL PENDING
                $this->handleStillPending($data);
            } else {
                // ❌ FAILED
                $this->handleFailed($data, $parsedResponse['message']);
            }
        } catch (\Exception $e) {
            Log::error('Check Digiflazz Order Status Error', [
                'transaction_code' => $this->transaction->transaction_code,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            // If max retries exceeded, mark as failed
            if ($this->attempts() >= $this->tries) {
                $this->handleFailed([
                    'message' => 'Status check timeout after '.$this->tries.' attempts',
                    'rc' => '999',
                ], 'Transaction timeout - unable to verify status');
            } else {
                // Retry in 3 minutes
                $this->release(180);

                TransactionLog::create([
                    'transaction_id' => $this->transaction->id,
                    'status_from' => 'processing',
                    'status_to' => 'processing',
                    'message' => "Status check attempt {$this->attempts()} failed, will retry in 3 minutes",
                ]);
            }
        }
    }

    /**
     * Handle success response
     */
    private function handleSuccess($data)
    {
        $this->transaction->update([
            'status' => 'success',
            'digiflazz_trx_id' => $data['trx_id'] ?? null,
            'digiflazz_serial_number' => $data['sn'] ?? null,
            'digiflazz_message' => $data['message'] ?? 'Success',
            'digiflazz_status' => $data['status'] ?? 'Sukses',
            'digiflazz_rc' => $data['rc'] ?? '00',
            'completed_at' => now(),
        ]);

        TransactionLog::create([
            'transaction_id' => $this->transaction->id,
            'status_from' => 'processing',
            'status_to' => 'success',
            'message' => 'Order completed successfully (verified by status check)',
            'meta_data' => $data,
        ]);

        // Create notification
        if (class_exists('App\Models\Notification') && $this->transaction->user_id) {
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
    }

    /**
     * Handle still pending response
     */
    private function handleStillPending($data)
    {
        $this->transaction->update([
            'digiflazz_message' => $data['message'] ?? 'Still Pending',
            'digiflazz_status' => $data['status'] ?? 'Pending',
            'digiflazz_rc' => $data['rc'] ?? '01',
        ]);

        TransactionLog::create([
            'transaction_id' => $this->transaction->id,
            'status_from' => 'processing',
            'status_to' => 'processing',
            'message' => "Order still pending at Digiflazz (check attempt {$this->attempts()})",
            'meta_data' => $data,
        ]);

        // If not max retries, schedule another check in 3 minutes
        if ($this->attempts() < $this->tries) {
            $this->release(180);
        } else {
            // Max retries reached, mark as failed
            $this->handleFailed([
                'message' => 'Transaction timeout after '.$this->tries.' status checks',
                'rc' => '999',
            ], 'Transaction timeout');
        }
    }

    /**
     * Handle failed response
     */
    private function handleFailed($data, $errorMessage = null)
    {
        $this->transaction->update([
            'status' => 'failed',
            'digiflazz_message' => $data['message'] ?? 'Failed',
            'digiflazz_status' => $data['status'] ?? 'Gagal',
            'digiflazz_rc' => $data['rc'] ?? '999',
            'failed_at' => now(),
        ]);

        $message = $errorMessage ?? ($data['message'] ?? 'Unknown error');

        TransactionLog::create([
            'transaction_id' => $this->transaction->id,
            'status_from' => 'processing',
            'status_to' => 'failed',
            'message' => 'Order failed: '.$message,
            'meta_data' => $data,
        ]);

        // Refund to user balance (both balance and gateway payments)
        if ($this->transaction->user_id) {
            try {
                $transactionService = app(TransactionService::class);
                $transactionService->refundTransaction(
                    $this->transaction,
                    'Order status check failed: '.$message
                );
            } catch (\Exception $refundError) {
                Log::error('Auto-refund failed during CheckDigiflazzOrderStatus', [
                    'transaction_code' => $this->transaction->transaction_code,
                    'error' => $refundError->getMessage(),
                ]);
            }
        }

        Log::warning('Digiflazz Order Status: Failed', [
            'transaction_code' => $this->transaction->transaction_code,
            'error' => $message,
        ]);
    }

    /**
     * Handle job failure
     */
    public function failed(\Throwable $exception)
    {
        Log::error('CheckDigiflazzOrderStatus Job Failed Permanently', [
            'transaction_code' => $this->transaction->transaction_code,
            'error' => $exception->getMessage(),
        ]);

        $this->handleFailed([
            'message' => 'Status check job failed permanently: '.$exception->getMessage(),
            'rc' => '999',
        ], 'System error - status check failed');
    }
}
