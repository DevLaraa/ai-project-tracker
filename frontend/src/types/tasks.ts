export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedUserId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
};

export type UpdateTaskInput = {
  projectId?: string;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  assignedUserId?: string | null;
  dueDate?: string | null;
};

export type GenerateAndCreateTasksInput = {
  projectId: string;
  taskCount?: number;
};
