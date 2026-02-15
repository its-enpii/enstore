/**
 * ============================================================
 * API MODULE - Barrel Export
 * ============================================================
 * Import everything from '@/lib/api'
 * ============================================================
 */

// Config
export { API_BASE_URL, ENDPOINTS } from "./config";

// Client
export { api } from "./client";
export type {
  ApiResponse,
  ApiError,
  PaginatedData,
  QueryParams,
} from "./client";

// Types
export type {
  Product,
  ProductItem,
  ProductCategory,
  ProductFilters,
  ProductListResponse,
  InputField,
} from "./types";

// Services
export {
  getProducts,
  getProductById,
  getProductBySlug,
  getCategories,
} from "./products";

export {
  guestPurchase,
  getTransactionStatus,
  getPaymentChannels,
  cancelTransaction,
} from "./transactions";

export {
  login,
  register,
  logout,
  getMe,
  socialLogin,
} from "./auth";

export type {
  PaymentChannel,
  PurchaseRequest,
  PurchaseResponse,
  TransactionStatus,
} from "./transactions";

// Customer API (Authenticated)
export {
  getBalance,
  getBalanceMutations,
  getTransactions,
  getTransactionDetail,
  customerPurchase,
  purchaseWithBalance,
  createTopUp,
  getCustomerPaymentChannels,
  getProfile,
  updateProfile,
  changePassword,
} from "./customer";

export type {
  BalanceData,
  BalanceMutation,
  CustomerTransaction,
  TransactionFilters,
  TopUpRequest,
  TopUpResponse,
  PurchaseBalanceRequest,
  CustomerProfile,
} from "./customer";

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
