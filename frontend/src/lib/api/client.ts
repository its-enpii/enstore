/**
 * ============================================================
 * API CLIENT - Fetch Wrapper
 * ============================================================
 * Reusable HTTP client with error handling, auth headers,
 * and consistent response format.
 * ============================================================
 */

import { API_BASE_URL } from "./config";

// ----------------------------------------------------------
// Types
// ----------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedData<T> {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

// ----------------------------------------------------------
// Helper: Build URL with query parameters
// ----------------------------------------------------------

function buildUrl(endpoint: string, params?: QueryParams): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

// ----------------------------------------------------------
// Helper: Get auth token from localStorage
// ----------------------------------------------------------

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

// ----------------------------------------------------------
// Helper: Build headers
// ----------------------------------------------------------

function buildHeaders(
  customHeaders?: HeadersInit,
  includeAuth = false,
): Headers {
  const headers = new Headers({
    Accept: "application/json",
    ...customHeaders,
  });

  // Don't set Content-Type for FormData (browser auto-sets boundary)
  if (!headers.has("Content-Type") && !(customHeaders as any)?._isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return headers;
}

// ----------------------------------------------------------
// Core: API Request Function
// ----------------------------------------------------------

async function apiRequest<T = unknown>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: unknown;
    params?: QueryParams;
    headers?: HeadersInit;
    auth?: boolean;
  } = {},
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    params,
    headers: customHeaders,
    auth = false,
  } = options;

  const url = buildUrl(endpoint, params);
  const isFormData = body instanceof FormData;

  const headers = buildHeaders(
    isFormData ? ({ _isFormData: true } as any) : customHeaders,
    auth,
  );

  // Remove Content-Type for FormData
  if (isFormData) {
    headers.delete("Content-Type");
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body) {
    fetchOptions.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        success: false,
        message: data.message || `Request failed with status ${response.status}`,
        errors: data.errors,
        status: response.status,
      };
      throw error;
    }

    return data as ApiResponse<T>;
  } catch (error) {
    // Re-throw ApiError as-is
    if ((error as ApiError).status) {
      throw error;
    }

    // Network/unexpected errors
    throw {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      status: 0,
    } as ApiError;
  }
}

// ----------------------------------------------------------
// Public API Methods
// ----------------------------------------------------------

export const api = {
  get<T = unknown>(
    endpoint: string,
    params?: QueryParams,
    auth = false,
  ): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: "GET", params, auth });
  },

  post<T = unknown>(
    endpoint: string,
    body?: unknown,
    auth = false,
  ): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: "POST", body, auth });
  },

  put<T = unknown>(
    endpoint: string,
    body?: unknown,
    auth = false,
  ): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: "PUT", body, auth });
  },

  delete<T = unknown>(
    endpoint: string,
    auth = false,
  ): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: "DELETE", auth });
  },

  /**
   * Upload with FormData (for image uploads etc)
   */
  upload<T = unknown>(
    endpoint: string,
    formData: FormData,
    method: "POST" | "PUT" = "POST",
    auth = true,
  ): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method, body: formData, auth });
  },
};
