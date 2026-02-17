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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

            // Handle fulfilment via centralized service
            $transactionService = app(TransactionService::class);
            $transactionService->handleDigiflazzFulfilment($this->transaction, $data);

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
     * Handle success (Legacy - kept for compatibility if needed elsewhere)
     */
    private function handleSuccess($data)
    {
        app(TransactionService::class)->handleDigiflazzFulfilment($this->transaction, $data);
    }

    /**
     * Handle pending (Legacy - kept for compatibility if needed elsewhere)
     */
    private function handlePending($data)
    {
        app(TransactionService::class)->handleDigiflazzFulfilment($this->transaction, $data);
    }

    /**
     * Handle failed (Legacy - kept for compatibility if needed elsewhere)
     */
    private function handleFailed($data, $errorMessage = null)
    {
        app(TransactionService::class)->handleDigiflazzFulfilment($this->transaction, $data);
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
     * Handle job failure
     */
    public function failed(\Throwable $exception)
    {
        Log::error('ProcessDigiflazzOrder Job Failed Permanently', [
            'transaction_code' => $this->transaction->transaction_code,
            'error' => $exception->getMessage(),
        ]);

        $this->handleFailed([
            'message' => 'Job failed permanently: '.$exception->getMessage(),
            'rc' => '999',
        ], 'System error - job failed permanently');
    }
}
