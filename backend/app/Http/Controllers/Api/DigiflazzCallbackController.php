<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\DigiflazzService;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DigiflazzCallbackController extends Controller
{
    protected $digiflazzService;
    protected $transactionService;

    public function __construct(DigiflazzService $digiflazzService, TransactionService $transactionService)
    {
        $this->digiflazzService = $digiflazzService;
        $this->transactionService = $transactionService;
    }

    /**
     * Handle Digiflazz callback/webhook
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handle(Request $request)
    {
        $signature = $request->header('X-Digiflazz-Delivery');
        $content = $request->getContent();

        Log::info('Digiflazz Webhook Received', [
            'signature' => $signature,
            'payload' => $request->all(),
        ]);

        $data = $request->json('data');

        // Validate Signature
        if (! $this->digiflazzService->validateWebhookSignature($data, $signature, $content)) {
            Log::warning('Digiflazz Webhook: Invalid signature', ['ref_id' => $data['ref_id'] ?? 'N/A']);

            return response()->json(['message' => 'Invalid signature'], 403);
        }

        if (!$data || !isset($data['ref_id'])) {
            Log::warning('Digiflazz Webhook: Invalid payload structure');
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        $refId = $data['ref_id'];

        // Find transaction
        $transaction = Transaction::where('transaction_code', $refId)->first();

        if (!$transaction) {
            Log::warning('Digiflazz Webhook: Transaction not found', ['ref_id' => $refId]);
            // Return 200 to acknowledge receipt even if not found to avoid retries
            return response()->json(['message' => 'Transaction not found'], 200);
        }

        // Handle fulfilment
        try {
            $this->transactionService->handleDigiflazzFulfilment($transaction, $data);

            return response()->json(['message' => 'Success'], 200);
        } catch (\Exception $e) {
            Log::error('Digiflazz Webhook Error: ' . $e->getMessage());
            return response()->json(['message' => 'Processing error'], 500);
        }
    }
}
