import type { AuthSession, LoginInput } from '../types/auth';
import { clearAccessToken, hasAccessToken } from '../utils/authStorage';
import { api } from './axios';

export const login = async (data: LoginInput): Promise<AuthSession> => {
  const res = await api.post('/auth/login', data);
  return res.data.data;
};

export const logout = () => {
  clearAccessToken();
};

export const isAuthenticated = () => hasAccessToken();
