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
  payment: {
    payment_method: string;
    paid_at: string | null;
  };
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
