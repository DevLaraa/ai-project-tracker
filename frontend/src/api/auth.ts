import { api } from "./axios";

export const login = async (data: {
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/login", data);
  return res.data.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const isAuthenticated = () => Boolean(localStorage.getItem("token"));
