<?php

namespace App\Jobs;

use App\Models\Transaction;
use App\Models\TransactionLog;
use App\Services\DigiflazzService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessPostpaidPayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $transaction;

    public $tries = 3;

    public $timeout = 120;

    public $backoff = [60, 180, 300]; // 1 min, 3 min, 5 min

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

            $this->createLog('pending', 'processing', 'Postpaid payment is being processed');

            // Get Digiflazz service
            $digiflazzService = app(DigiflazzService::class);

            // Pay postpaid via Digiflazz
            $result = $digiflazzService->payPostpaid(
                $this->transaction->product_code,
                $this->transaction->customer_data['customer_no'],
                $this->transaction->transaction_code
            );

            $data = $result['data'];

            // Parse response code
            $parsedResponse = $digiflazzService->parseResponseCode($data['rc'] ?? '999');

            // Handle based on response code
            if ($data['rc'] === '00') {
                // ✅ SUCCESS
                $this->handleSuccess($data);
            } elseif ($data['rc'] === '01') {
                // ⏳ PENDING - Will check again later
                $this->handlePending($data);
            } else {
                // ❌ FAILED
                $this->handleFailed($data, $parsedResponse['message']);
            }
        } catch (\Exception $e) {
            Log::error('Process Postpaid Payment Error', [
                'transaction_code' => $this->transaction->transaction_code,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'attempt' => $this->attempts(),
            ]);

            // If max retries exceeded, mark as failed
            if ($this->attempts() >= $this->tries) {
                $this->handleFailed([
                    'message' => 'Maximum retry exceeded: '.$e->getMessage(),
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
        $this->transaction->update([
            'status' => 'success',
            'digiflazz_trx_id' => $data['trx_id'] ?? null,
            'digiflazz_serial_number' => $data['sn'] ?? null,
            'digiflazz_message' => $data['message'] ?? 'Success',
            'digiflazz_status' => $data['status'] ?? 'Sukses',
            'digiflazz_rc' => $data['rc'] ?? '00',
            'completed_at' => now(),
        ]);

        $this->createLog('processing', 'success', 'Postpaid payment completed successfully', $data);

        // Create notification (if Notification model exists)
        if (class_exists('App\\Models\\Notification')) {
            \App\Models\Notification::create([
                'user_id' => $this->transaction->user_id,
                'title' => 'Pembayaran Berhasil!',
                'message' => "Pembayaran {$this->transaction->product_name} berhasil diproses.",
                'type' => 'success',
                'data' => [
                    'transaction_code' => $this->transaction->transaction_code,
                    'token' => $data['sn'] ?? null,
                ],
            ]);
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

        $this->createLog('processing', 'processing', 'Payment is pending at Digiflazz', $data);

        // Dispatch job to check status in 2 minutes
        \App\Jobs\CheckDigiflazzOrderStatus::dispatch($this->transaction)
            ->delay(now()->addMinutes(2));
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

        $this->createLog('processing', 'failed', 'Payment failed: '.$message, $data);

        // Create notification
        if (class_exists('App\\Models\\Notification')) {
            \App\Models\Notification::create([
                'user_id' => $this->transaction->user_id,
                'title' => 'Pembayaran Gagal',
                'message' => "Pembayaran {$this->transaction->product_name} gagal. {$message}",
                'type' => 'error',
                'data' => [
                    'transaction_code' => $this->transaction->transaction_code,
                    'error' => $message,
                ],
            ]);
        }
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
        Log::error('ProcessPostpaidPayment Job Failed Permanently', [
            'transaction_code' => $this->transaction->transaction_code,
            'error' => $exception->getMessage(),
        ]);

        $this->handleFailed([
            'message' => 'Job failed permanently: '.$exception->getMessage(),
            'rc' => '999',
        ], 'System error - job failed permanently');
    }
}
