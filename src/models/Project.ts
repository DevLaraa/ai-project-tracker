import type { UserId } from './User';

export type ProjectId = string;

export type PublicProject = {
  id: ProjectId;
  name: string;
  description: string | null;
  ownerUserId: UserId;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  ownerUserId: UserId;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string;
};

