import type { CreateProjectInput, ProjectId, PublicProject, UpdateProjectInput } from '../models/Project';
import type { UserId } from '../models/User';
import type { ProjectRepository } from '../repositories/ProjectRepository';
import { HttpError } from '../utils/httpError';

export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async listProjects(ownerUserId: UserId): Promise<PublicProject[]> {
    return this.projectRepository.listByOwner(ownerUserId);
  }

  async getProjectById(ownerUserId: UserId, projectId: ProjectId): Promise<PublicProject> {
    const project = await this.projectRepository.getByIdForOwner(projectId, ownerUserId);
    if (!project) throw new HttpError(404, 'Project not found');
    return project;
  }

  async createProject(input: CreateProjectInput): Promise<PublicProject> {
    return this.projectRepository.create(input);
  }

  async updateProject(
    ownerUserId: UserId,
    projectId: ProjectId,
    input: UpdateProjectInput
  ): Promise<PublicProject> {
    const project = await this.projectRepository.updateForOwner(projectId, ownerUserId, input);
    if (!project) throw new HttpError(404, 'Project not found');
    return project;
  }

  async deleteProject(ownerUserId: UserId, projectId: ProjectId): Promise<void> {
    const deleted = await this.projectRepository.deleteForOwner(projectId, ownerUserId);
    if (!deleted) throw new HttpError(404, 'Project not found');
  }
}

