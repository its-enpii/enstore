import { api } from "./client";
import { ENDPOINTS } from "./config";

export const login = async (data: any) => {
  return api.post(ENDPOINTS.auth.login, data);
};

export const register = async (data: any) => {
  return api.post(ENDPOINTS.auth.register, data);
};

export const logout = async () => {
  return api.post(ENDPOINTS.auth.logout, {}, true);
};

export const getMe = async () => {
  return api.get((ENDPOINTS.auth as any).profile, undefined, true);
};

export const forgotPassword = async (email: string) => {
  return api.post((ENDPOINTS.auth as any).forgotPassword, { email });
};

export const resetPassword = async (data: any) => {
  return api.post((ENDPOINTS.auth as any).resetPassword, data);
};

/**
 * Initiate social login by fetching the OAuth redirect URL from backend
 * and redirecting the browser to the provider's authorization page
 */
export const socialLogin = async (provider: 'google' | 'facebook') => {
  const endpoint = (ENDPOINTS.auth as any).socialRedirect(provider);
  const res = await api.get(endpoint);
  if (res.success && (res.data as any).redirect_url) {
    window.location.href = (res.data as any).redirect_url;
  } else {
    throw new Error('Gagal mendapatkan URL login ' + provider);
  }
};

/**
 * Exchange a social provider access token for an auth token (alternative flow)
 */
export const socialTokenExchange = async (provider: 'google' | 'facebook', accessToken: string) => {
  const endpoint = (ENDPOINTS.auth as any).socialToken(provider);
  return api.post(endpoint, { access_token: accessToken });
};
