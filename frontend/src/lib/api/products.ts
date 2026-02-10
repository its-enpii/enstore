/**
 * ============================================================
 * PRODUCT SERVICE
 * ============================================================
 * API functions for Product endpoints.
 * Uses centralized endpoint config and API client.
 * ============================================================
 */

import { api, type ApiResponse, type QueryParams } from "./client";
import { ENDPOINTS } from "./config";
import type {
  Product,
  ProductCategory,
  ProductFilters,
  ProductListResponse,
} from "./types";

// ----------------------------------------------------------
// Public Product API (No Auth)
// ----------------------------------------------------------

/**
 * Get list of products with filters and pagination
 */
export async function getProducts(
  filters?: ProductFilters,
): Promise<ApiResponse<ProductListResponse>> {
  return api.get<ProductListResponse>(
    ENDPOINTS.products.list,
    filters as QueryParams,
  );
}

/**
 * Get product detail by ID
 */
export async function getProductById(
  id: number | string,
): Promise<ApiResponse<Product>> {
  return api.get<Product>(ENDPOINTS.products.detail(id));
}

/**
 * Get product detail by slug
 */
export async function getProductBySlug(
  slug: string,
): Promise<ApiResponse<Product>> {
  return api.get<Product>(ENDPOINTS.products.detailBySlug(slug));
}

/**
 * Get all product categories
 */
export async function getCategories(): Promise<
  ApiResponse<ProductCategory[]>
> {
  return api.get<ProductCategory[]>(ENDPOINTS.products.categories);
}
