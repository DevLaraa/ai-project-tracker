import type { CreateProjectInput, Project } from '../types/projects';
import { api } from './axios';

export const getProjects = async (): Promise<Project[]> => {
  const res = await api.get('/projects');
  return res.data.data;
};

export const createProject = async (data: CreateProjectInput): Promise<Project> => {
  const res = await api.post('/projects', data);
  return res.data.data;
};
