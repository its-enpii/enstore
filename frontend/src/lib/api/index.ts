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
export type { ApiResponse, ApiError, PaginatedData, QueryParams } from "./client";

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
} from "./transactions";

export type {
  PaymentChannel,
  PurchaseRequest,
  PurchaseResponse,
  TransactionStatus,
} from "./transactions";
