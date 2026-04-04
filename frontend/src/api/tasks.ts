import { api } from "../api/axios";

export const getTasks = async (projectId: string) => {
  const res = await api.get(`/tasks?projectId=${projectId}`);
  return res.data.data;
};

export const createTask = async (data: {
  projectId: string;
  title: string;
  description?: string;
  status?: "todo" | "in_progress" | "done";
}) => {
  const res = await api.post("/tasks", data);
  return res.data.data;
};

export const updateTask = async (
  taskId: string,
  data: {
    projectId?: string;
    title?: string;
    description?: string | null;
    status?: "todo" | "in_progress" | "done";
    assignedUserId?: string | null;
    dueDate?: string | null;
  }
) => {
  const res = await api.patch(`/tasks/${taskId}`, data);
  return res.data.data;
};

export const deleteTask = async (taskId: string) => {
  await api.delete(`/tasks/${taskId}`);
};

export const generateTasksWithAI = async (data: {
  projectName: string;
  projectDescription?: string;
  taskCount?: number;
}) => {
  const res = await api.post("/ai/generate-tasks", data);
  return res.data.data;
};

export const generateAndCreateTasksWithAI = async (data: {
  projectId: string;
  projectName: string;
  projectDescription?: string;
  taskCount?: number;
}) => {
  const res = await api.post("/ai/generate-and-create-tasks", data);
  return res.data.data;
};
