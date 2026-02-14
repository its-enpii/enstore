/**
 * ============================================================
 * API ENDPOINT CONFIGURATION
 * ============================================================
 * Semua endpoint API terpusat di sini.
 * Jika ada perubahan endpoint di backend, cukup ubah di file ini.
 * ============================================================
 */

// Base URL dari environment variable
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ============================================================
// PUBLIC ENDPOINTS (No Auth Required)
// ============================================================

export const ENDPOINTS = {
  // ----------------------------------------------------------
  // Products (Public Catalog)
  // ----------------------------------------------------------
  products: {
    /** GET - List all products with filters & pagination */
    list: "/products",
    /** GET - Get product detail by ID */
    detail: (id: number | string) => `/products/${id}`,
    /** GET - Get product detail by slug */
    detailBySlug: (slug: string) => `/products/slug/${slug}`,
    /** GET - Get all product categories */
    categories: "/products/categories",
  },

  // ----------------------------------------------------------
  // Transactions (Public / Guest Checkout)
  // ----------------------------------------------------------
  transactions: {
    /** POST - Purchase product (Guest) */
    purchase: "/transactions/purchase",
    /** GET - Check transaction status */
    status: (code: string) => `/transactions/status/${code}`,
    /** POST - Cancel transaction */
    cancel: (code: string) => `/transactions/${code}/cancel`,
    /** GET - Get available payment channels */
    paymentChannels: "/transactions/payment-channels",
  },

  // ----------------------------------------------------------
  // Auth
  // ----------------------------------------------------------
  auth: {
    /** POST - Login */
    login: "/auth/login",
    /** POST - Register */
    register: "/auth/register",
    /** POST - Logout */
    logout: "/auth/logout",
    /** GET - Get current user profile */
    profile: "/auth/profile",
  },

  // ----------------------------------------------------------
  // Customer (Auth Required)
  // ----------------------------------------------------------
  customer: {
    /** GET - Get profile */
    profile: "/customer/profile",
    /** PUT - Update profile */
    updateProfile: "/customer/profile",
    /** POST - Change password */
    changePassword: "/customer/profile/change-password",

    /** POST - Purchase via payment gateway */
    purchase: "/customer/transactions/purchase",
    /** POST - Purchase via balance */
    purchaseBalance: "/customer/transactions/purchase-balance",
    /** GET - Get transaction history */
    transactions: "/customer/transactions",
    /** GET - Get transaction detail */
    transactionDetail: (code: string) => `/customer/transactions/${code}`,

    /** POST - Top up balance */
    topup: "/customer/transactions/topup",
    /** GET - Get payment channels */
    paymentChannels: "/customer/transactions/payment-channels",

    /** GET - Get balance */
    balance: "/customer/balance",
    /** GET - Get balance mutations */
    balanceMutations: "/customer/balance/mutations",

    /** POST - Postpaid inquiry */
    postpaidInquiry: "/customer/postpaid/inquiry",
    /** POST - Postpaid pay */
    postpaidPay: "/customer/postpaid/pay",
  },

  // ----------------------------------------------------------
  // Admin (Auth + Admin Role Required)
  // ----------------------------------------------------------
  admin: {
    /** GET - Dashboard statistics */
    dashboard: "/admin/dashboard",

    products: {
      /** GET - List all products */
      list: "/admin/products",
      /** POST - Create product */
      create: "/admin/products",
      /** GET - Get product detail */
      detail: (id: number | string) => `/admin/products/${id}`,
      /** PUT - Update product */
      update: (id: number | string) => `/admin/products/${id}`,
      /** DELETE - Delete product */
      delete: (id: number | string) => `/admin/products/${id}`,
      /** POST - Sync from Digiflazz */
      syncDigiflazz: "/admin/products/sync-digiflazz",
      /** POST - Bulk update prices */
      bulkUpdatePrices: "/admin/products/bulk-update-prices",
    },

    productItems: {
      /** POST - Create item */
      create: (productId: number | string) =>
        `/admin/products/${productId}/items`,
      /** GET - Get item detail */
      detail: (id: number | string) => `/admin/products/items/${id}`,
      /** PUT - Update item */
      update: (id: number | string) => `/admin/products/items/${id}`,
      /** DELETE - Delete item */
      delete: (id: number | string) => `/admin/products/items/${id}`,
    },

    transactions: {
      /** GET - List all transactions */
      list: "/admin/transactions",
      /** GET - Get transaction statistics */
      statistics: "/admin/transactions/statistics",
      /** GET - Get transaction detail */
      detail: (id: number | string) => `/admin/transactions/${id}`,
      /** PUT - Update transaction status */
      updateStatus: (id: number | string) => `/admin/transactions/${id}/status`,
    },

    users: {
      /** GET - List all users */
      list: "/admin/users",
      /** GET - Get user statistics */
      statistics: "/admin/users/statistics",
      /** GET - Get user detail */
      detail: (id: number | string) => `/admin/users/${id}`,
      /** POST - Create user */
      create: "/admin/users",
      /** PUT - Update user */
      update: (id: number | string) => `/admin/users/${id}`,
      /** DELETE - Delete user */
      delete: (id: number | string) => `/admin/users/${id}`,
      /** POST - Adjust balance */
      adjustBalance: (id: number | string) =>
        `/admin/users/${id}/adjust-balance`,
    },

    settings: {
      /** GET - List all settings */
      list: "/admin/settings",
      /** GET - Get profit margins */
      profitMargins: "/admin/settings/profit-margins",
      /** PUT - Update profit margins */
      updateProfitMargins: "/admin/settings/profit-margins",
      /** GET - Get single setting */
      detail: (key: string) => `/admin/settings/${key}`,
      /** POST - Create/update setting */
      create: "/admin/settings",
      /** POST - Bulk update settings */
      bulkUpdate: "/admin/settings/bulk-update",
      /** DELETE - Delete setting */
      delete: (key: string) => `/admin/settings/${key}`,
    },

    reports: {
      /** GET - Sales report */
      sales: "/admin/reports/sales",
      /** GET - Product report */
      products: "/admin/reports/products",
      /** GET - User report */
      users: "/admin/reports/users",
      /** GET - Balance report */
      balance: "/admin/reports/balance",
      /** GET - Payment method report */
      paymentMethods: "/admin/reports/payment-methods",
      /** GET - Export transactions CSV */
      exportTransactions: "/admin/reports/export/transactions",
    },

    activityLogs: {
      /** GET - List all logs */
      list: "/admin/activity-logs",
      /** GET - Get log statistics */
      statistics: "/admin/activity-logs/statistics",
      /** GET - Get log detail */
      detail: (id: number | string) => `/admin/activity-logs/${id}`,
      /** POST - Clean old logs */
      clean: "/admin/activity-logs/clean",
    },
  },
} as const;
