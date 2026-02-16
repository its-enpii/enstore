/**
 * ============================================================
 * GENERIC API TYPES
 * ============================================================
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface LaravelPagination<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

/**
 * ============================================================
 * PRODUCT API TYPES
 * ============================================================
 */

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  type: string;
  is_active: boolean;
  sort_order: number;
  products_count?: number;
}

export interface ProductItem {
  id: number;
  product_id: number;
  digiflazz_code: string;
  name: string;
  group: string | null;
  description: string | null;
  price: number; // Customer price
  base_price?: number; // Admin price
  retail_price?: number; // Admin price
  reseller_price?: number; // Admin price
  stock_status: "available" | "empty" | "maintenance" | string;
  is_active: boolean;
  total_sold: number;
  sort_order: number;
}

export interface InputField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string;
}

export interface Product {
  id: number;
  category_id: number | string;
  name: string;
  slug: string;
  brand: string;
  provider: string | null;
  type: string;
  payment_type: "prepaid" | "postpaid" | string;
  description: string | null;
  image: string | null;
  icon: string | null;
  input_fields: InputField[] | null | string;
  server_options: string[] | null | string;
  rating: number;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  category?: ProductCategory;
  items?: ProductItem[];
  price_range?: {
    min: number | null;
    max: number | null;
  };
}

export interface ProductFilters {
  search?: string;
  type?: string;
  payment_type?: "prepaid" | "postpaid";
  is_active?: boolean;
  is_featured?: boolean;
  "category.slug"?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/**
 * ============================================================
 * USER API TYPES
 * ============================================================
 */

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  phone_number?: string;
  role: string;
  customer_type?: string;
  status?: string;
  balance: number | { balance: number };
  is_active?: boolean | number;
  created_at: string;
  email_verified_at?: string;
}

/**
 * ============================================================
 * TRANSACTION API TYPES
 * ============================================================
 */

export interface Transaction {
  id: number;
  reference: string;
  transaction_code?: string;
  merchant_ref?: string;
  user_id: number;
  product_id?: number;
  product_item_id?: number;
  product_name: string;
  product_price?: number;
  total_price?: number;
  admin_fee: number;
  total_amount: number;
  status: "pending" | "processing" | "success" | "failed" | "expired" | string;
  payment_method: string;
  payment_status: "unpaid" | "paid" | "expired" | string;
  customer_data?: any;
  sn?: string;
  note?: string;
  data?: any;
  created_at: string;
  user?: User;
  product_item?: {
    is_active: boolean;
  };
}

/**
 * ============================================================
 * REPORT API TYPES
 * ============================================================
 */

export interface BalanceSummary {
  total_credit: number;
  total_debit: number;
  credit_count: number;
  debit_count: number;
  net_balance: number;
}

export interface BalanceMutationGroup {
  type: string;
  total_count: number;
  total_amount: number;
}

export interface BalanceReportData {
  summary: BalanceSummary;
  details: BalanceMutationGroup[];
}

export interface PaymentMethodStats {
  payment_method: string;
  total_transactions: number;
  total_revenue: number;
  total_fees: number;
  average_transaction: number;
}
