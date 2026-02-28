<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\ProductItem;
use App\Services\DigiflazzService;
use App\Services\TransactionService;
use App\Services\TripayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PostpaidController extends Controller
{
    private $digiflazzService;

    private $transactionService;

    private $tripayService;

    public function __construct(
        DigiflazzService $digiflazzService,
        TransactionService $transactionService,
        TripayService $tripayService
    ) {
        $this->digiflazzService = $digiflazzService;
        $this->transactionService = $transactionService;
        $this->tripayService = $tripayService;
    }

    /**
     * Step 1: Cek tagihan pascabayar (PLN, PDAM, dll.)
     *
     * Memanggil Digiflazz untuk inquiry dan menyimpan hasilnya
     * ke cache selama 30 menit menggunakan inquiry_ref sebagai kunci.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function inquiry(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_item_id' => 'required|exists:product_items,id',
            'customer_no'     => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $productItem = ProductItem::with('product')->findOrFail($request->product_item_id);

            if ($productItem->product->payment_type !== 'postpaid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Produk ini bukan produk pascabayar',
                ], 400);
            }

            // Generate unique inquiry reference
            $inquiryRef = 'INQ-' . date('YmdHis') . '-' . rand(1000, 9999);

            // Panggil Digiflazz inquiry
            $result = $this->digiflazzService->inquiryPostpaid(
                $productItem->digiflazz_code,
                $request->customer_no,
                $inquiryRef
            );

            if (! $result['success'] || ($result['data']['rc'] ?? '') !== '00') {
                return response()->json([
                    'success' => false,
                    'message' => $result['data']['message'] ?? 'Gagal cek tagihan. Periksa nomor pelanggan.',
                ], 400);
            }

            $data = $result['data'];

            // Hitung harga jual berdasarkan tipe customer
            $user         = auth()->user();
            $customerType = $user->customer_type ?? 'retail';
            $profit       = $customerType === 'reseller'
                ? floatval($productItem->reseller_profit ?? 0)
                : floatval($productItem->retail_profit ?? 0);

            $realAdmin = $data['admin'] ?? 0;

            // Harga supplier: pakai total_bayar jika ada, jika tidak hitung dari nominal + admin
            $supplierPrice = isset($data['total_bayar']) && $data['total_bayar'] > 0
                ? $data['total_bayar']
                : (($data['nominal'] ?? 0) + $realAdmin);

            // Harga jual ke customer = harga supplier + profit kita
            $sellingPrice  = $supplierPrice + $profit;

            // Admin yang ditampilkan ke customer = real admin Digiflazz + profit kita
            $displayAdmin  = $realAdmin + $profit;

            // Simpan data inquiry ke cache selama 30 menit
            $inquiryData = [
                'product_item_id' => $productItem->id,
                'product_code'    => $productItem->digiflazz_code,
                'product_name'    => $productItem->product->name . ' - ' . $productItem->name,
                'customer_no'     => $request->customer_no,
                'customer_name'   => $data['customer_name'] ?? '',
                'period'          => $data['period'] ?? '',
                'nominal'         => $data['nominal'] ?? 0,
                'real_admin'      => $realAdmin,
                'profit'          => $profit,
                'display_admin'   => $displayAdmin,
                'total'           => $sellingPrice,
                'customer_type'   => $customerType,
                'user_id'         => $user->id,
            ];

            Cache::put($inquiryRef, $inquiryData, now()->addMinutes(30));

            Log::info('Postpaid inquiry success', [
                'inquiry_ref'  => $inquiryRef,
                'customer_no'  => $request->customer_no,
                'product_code' => $productItem->digiflazz_code,
                'total'        => $sellingPrice,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Berhasil cek tagihan',
                'data'    => [
                    'inquiry_ref'  => $inquiryRef,
                    'product_name' => $productItem->product->name . ' - ' . $productItem->name,
                    'customer_no'  => $request->customer_no,
                    'customer_name' => $data['customer_name'] ?? '',
                    'period'       => $data['period'] ?? '',
                    'tagihan'      => $data['nominal'] ?? 0,
                    'admin'        => $displayAdmin,
                    'total'        => $sellingPrice,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Postpaid inquiry failed', [
                'user_id'     => auth()->id(),
                'customer_no' => $request->customer_no,
                'error'       => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal cek tagihan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Step 2: Bayar tagihan pascabayar
     *
     * Mengambil data inquiry dari cache menggunakan inquiry_ref,
     * membuat transaksi, dan membuat tagihan pembayaran via Tripay.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function pay(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'inquiry_ref'    => 'required|string',
            'payment_method' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Ambil data inquiry dari cache
        $inquiryData = Cache::get($request->inquiry_ref);

        if (! $inquiryData) {
            return response()->json([
                'success' => false,
                'message' => 'Data tagihan sudah kadaluarsa atau tidak ditemukan. Silakan cek tagihan ulang.',
            ], 400);
        }

        if ($inquiryData['total'] <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tagihan sudah lunas atau tidak ada tagihan yang perlu dibayar.',
            ], 400);
        }

        // Validasi bahwa inquiry ini memang milik user yang sedang login
        if ($inquiryData['user_id'] !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan menggunakan inquiry ini.',
            ], 403);
        }

        try {
            $user = auth()->user();

            // Buat transaksi pascabayar (TransactionService mengelola DB transaction-nya sendiri)
            $transaction = $this->transactionService->createPostpaidTransaction([
                'user_id'         => $user->id,
                'product_item_id' => $inquiryData['product_item_id'],
                'customer_type'   => $inquiryData['customer_type'],
                'customer_data'   => [
                    'customer_no' => $inquiryData['customer_no'],
                ],
                'inquiry_ref'  => $request->inquiry_ref,
                'bill_data'    => [
                    'customer_name' => $inquiryData['customer_name'],
                    'period'        => $inquiryData['period'],
                    'nominal'       => $inquiryData['nominal'],
                    'real_admin'    => $inquiryData['real_admin'],
                    'profit'        => $inquiryData['profit'],
                    'display_admin' => $inquiryData['display_admin'],
                ],
                'total_price' => $inquiryData['total'],
            ]);

            // Buat tagihan pembayaran via Tripay
            $tripayData = [
                'method'         => $request->payment_method,
                'merchant_ref'   => $transaction->transaction_code,
                'amount'         => (int) $transaction->total_price,
                'customer_name'  => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => $user->phone ?? '08123456789',
                'order_items'    => [
                    [
                        'sku'      => $inquiryData['product_code'],
                        'name'     => $inquiryData['product_name'],
                        'price'    => (int) $transaction->total_price,
                        'quantity' => 1,
                    ],
                ],
                'return_url'   => config('app.frontend_url') . '/transaction/' . $transaction->transaction_code,
                'expired_time' => now()->addHours(2)->timestamp,
            ];

            $tripayResponse = $this->tripayService->createPayment($tripayData);

            // Simpan record pembayaran ke tabel payments
            $payment = Payment::create([
                'transaction_id'       => $transaction->id,
                'payment_reference'    => $tripayResponse['reference'],
                'payment_code'         => $tripayResponse['pay_code'] ?? null,
                'payment_method'       => $tripayResponse['payment_method'],
                'payment_channel'      => $tripayResponse['payment_name'],
                'amount'               => $tripayResponse['amount'],
                'fee'                  => $tripayResponse['total_fee'] ?? 0,
                'total_amount'         => $tripayResponse['amount_received'],
                'checkout_url'         => $tripayResponse['checkout_url'] ?? null,
                'qr_url'               => $tripayResponse['qr_url'] ?? null,
                'status'               => 'pending',
                'expired_at'           => date('Y-m-d H:i:s', $tripayResponse['expired_time']),
                'payment_instructions' => $tripayResponse['instructions'] ?? [],
                'tripay_merchant_ref'  => $tripayResponse['merchant_ref'],
                'tripay_customer_name' => $user->name,
                'tripay_customer_email'=> $user->email,
                'tripay_customer_phone'=> $user->phone ?? '',
            ]);

            // Update total_price di transaksi dengan biaya Tripay yang aktual
            $actualFee  = $tripayResponse['total_fee'] ?? 0;
            $totalPrice = $transaction->total_price + $actualFee;

            DB::table('transactions')
                ->where('id', $transaction->id)
                ->update([
                    'admin_fee'   => $actualFee,
                    'total_price' => $totalPrice,
                    'updated_at'  => now(),
                ]);

            $transaction->admin_fee  = $actualFee;
            $transaction->total_price = $totalPrice;

            // Hapus cache inquiry setelah berhasil dibayar
            Cache::forget($request->inquiry_ref);

            Log::info('Postpaid payment created', [
                'transaction_code' => $transaction->transaction_code,
                'user_id'          => $user->id,
                'total'            => $totalPrice,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil dibuat',
                'data'    => [
                    'transaction' => $transaction,
                    'payment'     => $payment,
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('Postpaid payment failed', [
                'user_id'      => auth()->id(),
                'inquiry_ref'  => $request->inquiry_ref,
                'error'        => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage(),
            ], 500);
        }
    }
}
