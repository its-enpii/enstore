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

            // Handle fulfilment via centralized service
            $transactionService = app(TransactionService::class);
            $transactionService->handleDigiflazzFulfilment($this->transaction, $data);

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
     * Handle success (Legacy - kept for compatibility)
     */
    private function handleSuccess($data)
    {
        app(TransactionService::class)->handleDigiflazzFulfilment($this->transaction, $data);
    }

    /**
     * Handle still pending (Legacy - kept for compatibility)
     */
    private function handleStillPending($data)
    {
        app(TransactionService::class)->handleDigiflazzFulfilment($this->transaction, $data);
    }

    /**
     * Handle failed (Legacy - kept for compatibility)
     */
    private function handleFailed($data, $errorMessage = null)
    {
        app(TransactionService::class)->handleDigiflazzFulfilment($this->transaction, $data);
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
