/**
 * ============================================================
 * TRANSACTION SERVICE
 * ============================================================
 * API functions for Transaction endpoints (Guest & Customer).
 * ============================================================
 */

import { api, type ApiResponse } from "./client";
import { ENDPOINTS } from "./config";

// ----------------------------------------------------------
// Types
// ----------------------------------------------------------

export interface PaymentChannel {
  code: string;
  name: string;
  group: string;
  fee_merchant: { flat: number; percent: number };
  fee_customer: { flat: number; percent: number };
  total_fee: { flat: number; percent: number };
  icon_url: string;
  active: boolean;
}

export interface PurchaseRequest {
  product_item_id: number;
  payment_method: string;
  customer_data: Record<string, string>;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  voucher_code?: string;
}

export interface PurchaseResponse {
  transaction: {
    transaction_code: string;
    total_price: number;
    status: string;
    payment_status: string;
  };
  payment: {
    payment_method: string;
    payment_url: string;
    qr_code_url?: string;
  };
}

export interface TransactionStatus {
  transaction_code: string;
  status: string;
  payment_status: string;
  product_name: string;
  total_price: number;
  created_at: string;
  product: {
    name: string;
    item: string;
    image: string;
    slug: string;
    brand: string;
    customer_data: Record<string, string>;
  };
  pricing: {
    product: number;
    admin: number;
    discount: number;
    total: number;
  };
  payment: {
    payment_method: string;
    checkout_url?: string;
    qr_url?: string;
    payment_code?: string;
    expired_at?: string;
    instructions?: Array<{ title: string; steps: string[] }>;
  };
  refund?: {
    is_refunded: boolean;
    refunded_at: string | null;
    refund_amount: number | null;
    refund_method: string | null;
  };
  sn?: string | null;
  note?: string | null;
}

// ----------------------------------------------------------
// Public Transaction API (Guest / No Auth)
// ----------------------------------------------------------

/**
 * Purchase product (guest checkout)
 */
export async function guestPurchase(
  data: PurchaseRequest,
): Promise<ApiResponse<PurchaseResponse>> {
  return api.post<PurchaseResponse>(ENDPOINTS.transactions.purchase, data);
}

/**
 * Check transaction status by code
 */
export async function getTransactionStatus(
  code: string,
): Promise<ApiResponse<TransactionStatus>> {
  return api.get<TransactionStatus>(ENDPOINTS.transactions.status(code));
}

/**
 * Get available payment channels
 */
export async function getPaymentChannels(): Promise<
  ApiResponse<PaymentChannel[]>
> {
  return api.get<PaymentChannel[]>(ENDPOINTS.transactions.paymentChannels);
}

/**
 * Cancel transaction
 */
export async function cancelTransaction(
  code: string,
): Promise<ApiResponse<void>> {
  return api.post<void>(ENDPOINTS.transactions.cancel(code), {});
}
