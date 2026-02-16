/**
 * ============================================================
 * CUSTOMER SERVICE - Authenticated Customer API Calls
 * ============================================================
 * Balance, Transactions, TopUp, Profile for logged-in users.
 * ============================================================
 */

import { api, type ApiResponse, type PaginatedData } from "./client";
import { ENDPOINTS } from "./config";

// ----------------------------------------------------------
// Types - Balance
// ----------------------------------------------------------

export interface BalanceData {
  balance: number;
  hold_amount: number;
  available_balance: number;
}

export interface BalanceMutation {
  id: number;
  type: "credit" | "debit";
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
  transaction?: {
    transaction_code: string;
  };
}

// ----------------------------------------------------------
// Types - Customer Transactions
// ----------------------------------------------------------

export interface CustomerTransaction {
  id: number;
  transaction_code: string;
  transaction_type: "purchase" | "topup";
  product_name: string;
  product_code?: string;
  product_price: number;
  admin_fee: number;
  discount_amount: number;
  total_price: number;
  customer_data?: Record<string, string>;
  payment_method: string;
  status: string;
  payment_status: string;
  created_at: string;
  paid_at?: string;
  completed_at?: string;
  sn?: string | null;
  note?: string | null;
  product?: {
    id: number;
    name: string;
    image_url?: string;
  };
  payment?: {
    payment_code?: string;
    payment_method: string;
    payment_channel?: string;
    amount: number;
    status?: string;
    payment_url?: string;
    qr_code_url?: string;
    expired_at?: string;
    instructions?: Array<{ title: string; steps: string[] }>;
  };
  logs?: Array<{
    action: string;
    description: string;
    created_at: string;
  }>;
}

export interface TransactionFilters {
  type?: "purchase" | "topup";
  status?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  per_page?: number;
  page?: number;
}

// ----------------------------------------------------------
// Types - TopUp Request
// ----------------------------------------------------------

export interface TopUpRequest {
  amount: number;
  payment_method: string;
}

export interface TopUpResponse {
  transaction: {
    id: number;
    transaction_code: string;
    transaction_type: "topup";
    product_name: string;
    product_price: number;
    admin_fee: number;
    total_price: number;
    status: string;
    payment_status: string;
    expired_at: string;
  };
  payment: {
    payment_code: string;
    payment_method: string;
    payment_channel: string;
    amount: number;
    payment_url: string;
    qr_code_url?: string;
    expired_at: string;
  };
}

// ----------------------------------------------------------
// Types - Purchase via Balance
// ----------------------------------------------------------

export interface PurchaseBalanceRequest {
  product_item_id: number;
  customer_data: Record<string, string>;
  voucher_code?: string;
}

// ----------------------------------------------------------
// Types - Profile
// ----------------------------------------------------------

export interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  customer_type: "retail" | "reseller";
  status: string;
  avatar?: string;
  created_at: string;
  balance?: {
    amount: number;
    hold_amount: number;
  };
}

// ----------------------------------------------------------
// Types - Postpaid
// ----------------------------------------------------------

export interface PostpaidInquiryRequest {
  sku: string;
  customer_no: string;
}

export interface PostpaidInquiryResponse {
  status: string;
  message: string;
  data: {
    ref_id: string;
    customer_no: string;
    customer_name: string;
    buyer_sku_code: string;
    admin: number;
    selling_price: number;
    price: number;
    desc: {
      tagihan?: string;
      item_name?: string;
      [key: string]: any;
    };
  };
}

export interface PostpaidPayRequest {
  ref_id: string; // From inquiry
}

// ----------------------------------------------------------
// Balance API
// ----------------------------------------------------------

export async function getBalance(): Promise<ApiResponse<BalanceData>> {
  return api.get<BalanceData>(ENDPOINTS.customer.balance, undefined, true);
}

export async function getBalanceMutations(
  limit = 50,
): Promise<ApiResponse<BalanceMutation[]>> {
  return api.get<BalanceMutation[]>(
    ENDPOINTS.customer.balanceMutations,
    { limit },
    true,
  );
}

// ----------------------------------------------------------
// Transaction API (Authenticated)
// ----------------------------------------------------------

export async function getTransactions(
  filters?: TransactionFilters,
): Promise<ApiResponse<PaginatedData<CustomerTransaction>>> {
  return api.get<PaginatedData<CustomerTransaction>>(
    ENDPOINTS.customer.transactions,
    filters as any,
    true,
  );
}

export async function getTransactionDetail(
  code: string,
): Promise<ApiResponse<CustomerTransaction>> {
  return api.get<CustomerTransaction>(
    ENDPOINTS.customer.transactionDetail(code),
    undefined,
    true,
  );
}

export async function customerPurchase(data: {
  product_item_id: number;
  payment_method: string;
  customer_data: Record<string, string>;
  voucher_code?: string;
}): Promise<ApiResponse<any>> {
  return api.post(ENDPOINTS.customer.purchase, data, true);
}

export async function purchaseWithBalance(
  data: PurchaseBalanceRequest,
): Promise<ApiResponse<any>> {
  return api.post(ENDPOINTS.customer.purchaseBalance, data, true);
}

// ----------------------------------------------------------
// TopUp API
// ----------------------------------------------------------

export async function createTopUp(
  data: TopUpRequest,
): Promise<ApiResponse<TopUpResponse>> {
  return api.post<TopUpResponse>(ENDPOINTS.customer.topup, data, true);
}

export async function getCustomerPaymentChannels(): Promise<
  ApiResponse<any[]>
> {
  return api.get<any[]>(ENDPOINTS.customer.paymentChannels, undefined, true);
}

// ----------------------------------------------------------
// Postpaid API
// ----------------------------------------------------------

export async function postpaidInquiry(
  data: PostpaidInquiryRequest,
): Promise<ApiResponse<PostpaidInquiryResponse>> {
  return api.post<PostpaidInquiryResponse>(
    ENDPOINTS.customer.postpaidInquiry,
    data,
    true,
  );
}

export async function postpaidPay(
  data: PostpaidPayRequest,
): Promise<ApiResponse<any>> {
  return api.post<any>(ENDPOINTS.customer.postpaidPay, data, true);
}

// ----------------------------------------------------------
// Profile API
// ----------------------------------------------------------

export async function getProfile(): Promise<ApiResponse<CustomerProfile>> {
  return api.get<CustomerProfile>(ENDPOINTS.customer.profile, undefined, true);
}

export async function updateProfile(
  data: Partial<Pick<CustomerProfile, "name" | "email" | "phone" | "avatar">>,
): Promise<ApiResponse<CustomerProfile>> {
  return api.put<CustomerProfile>(ENDPOINTS.customer.updateProfile, data, true);
}

export async function changePassword(data: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}): Promise<ApiResponse<void>> {
  return api.post<void>(ENDPOINTS.customer.changePassword, data, true);
}
