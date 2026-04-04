import { api } from "../api/axios";

export const getProjects = async () => {
  const res = await api.get("/projects");
  return res.data.data;
};

export const createProject = async (data: {
  name: string;
  description?: string;
}) => {
  const res = await api.post("/projects", data);
  return res.data.data;
};