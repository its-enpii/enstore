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
