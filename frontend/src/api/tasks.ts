import type {
  CreateTaskInput,
  GenerateAndCreateTasksInput,
  Task,
  UpdateTaskInput
} from '../types/tasks';
import { api } from './axios';

export const getTasks = async (projectId: string): Promise<Task[]> => {
  const res = await api.get(`/tasks?projectId=${projectId}`);
  return res.data.data;
};

export const createTask = async (data: CreateTaskInput): Promise<Task> => {
  const res = await api.post('/tasks', data);
  return res.data.data;
};

export const updateTask = async (taskId: string, data: UpdateTaskInput): Promise<Task> => {
  const res = await api.patch(`/tasks/${taskId}`, data);
  return res.data.data;
};

export const deleteTask = async (taskId: string) => {
  await api.delete(`/tasks/${taskId}`);
};

export const generateAndCreateTasksWithAI = async (data: GenerateAndCreateTasksInput) => {
  const res = await api.post('/ai/generate-and-create-tasks', data);
  return res.data.data;
};
