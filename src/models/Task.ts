import type { ProjectId } from './Project';
import type { UserId } from './User';

export type TaskId = string;
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type PublicTask = {
  id: TaskId;
  projectId: ProjectId;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedUserId: UserId | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  projectId: ProjectId;
  title: string;
  description?: string;
  status?: TaskStatus;
  assignedUserId?: UserId;
  dueDate?: string;
};

export type UpdateTaskInput = {
  projectId?: ProjectId;
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignedUserId?: UserId | null;
  dueDate?: string | null;
};

export type UpdateTaskRecordInput = {
  projectId: ProjectId;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedUserId: UserId | null;
  dueDate: string | null;
};

