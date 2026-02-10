/**
 * ============================================================
 * PRODUCT API TYPES
 * ============================================================
 * Type definitions for Product-related API responses.
 * ============================================================
 */

// ----------------------------------------------------------
// Product Category
// ----------------------------------------------------------

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

// ----------------------------------------------------------
// Product Item (Variant / SKU)
// ----------------------------------------------------------

export interface ProductItem {
  id: number;
  product_id: number;
  digiflazz_code: string;
  name: string;
  description: string | null;
  price: number; // Customer-facing price (based on customer type)
  stock_status: "available" | "empty" | "maintenance";
  is_active: boolean;
  total_sold: number;
  sort_order: number;
}

// ----------------------------------------------------------
// Product (Parent - Game/Brand)
// ----------------------------------------------------------

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  brand: string;
  provider: string | null;
  type: string;
  payment_type: "prepaid" | "postpaid";
  description: string | null;
  image: string | null;
  input_fields: InputField[] | null;
  server_options: string[] | null;
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

export interface InputField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
}

// ----------------------------------------------------------
// Product List Response (Customer API)
// ----------------------------------------------------------

export interface ProductListResponse {
  products: Product[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// ----------------------------------------------------------
// Product Filters
// ----------------------------------------------------------

export interface ProductFilters {
  search?: string;
  type?: string;
  is_active?: boolean;
  is_featured?: boolean;
  "category.slug"?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
