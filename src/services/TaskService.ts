import type { ProjectId } from '../models/Project';
import type { CreateTaskInput, PublicTask, TaskId, UpdateTaskInput } from '../models/Task';
import type { UserId } from '../models/User';
import type { ProjectRepository } from '../repositories/ProjectRepository';
import type { TaskRepository } from '../repositories/TaskRepository';
import type { UserRepository } from '../repositories/UserRepository';
import { HttpError } from '../utils/httpError';

export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository
  ) {}

  async listTasks(ownerUserId: UserId, projectId?: ProjectId): Promise<PublicTask[]> {
    if (projectId) {
      const projectExists = await this.projectRepository.existsForOwner(projectId, ownerUserId);
      if (!projectExists) throw new HttpError(404, 'Project not found');
    }
    return this.taskRepository.listForOwner(ownerUserId, projectId);
  }

  async getTaskById(ownerUserId: UserId, taskId: TaskId): Promise<PublicTask> {
    const task = await this.taskRepository.getByIdForOwner(taskId, ownerUserId);
    if (!task) throw new HttpError(404, 'Task not found');
    return task;
  }

  async createTask(ownerUserId: UserId, input: CreateTaskInput): Promise<PublicTask> {
    const projectExists = await this.projectRepository.existsForOwner(input.projectId, ownerUserId);
    if (!projectExists) throw new HttpError(404, 'Project not found');

    if (input.assignedUserId) {
      const assignedUserExists = await this.userRepository.existsById(input.assignedUserId);
      if (!assignedUserExists) throw new HttpError(404, 'Assigned user not found');
    }

    return this.taskRepository.create(input);
  }

  async updateTask(ownerUserId: UserId, taskId: TaskId, input: UpdateTaskInput): Promise<PublicTask> {
    const existingTask = await this.taskRepository.getByIdForOwner(taskId, ownerUserId);
    if (!existingTask) throw new HttpError(404, 'Task not found');

    const nextProjectId = input.projectId ?? existingTask.projectId;
    const projectExists = await this.projectRepository.existsForOwner(nextProjectId, ownerUserId);
    if (!projectExists) throw new HttpError(404, 'Project not found');

    const nextAssignedUserId =
      input.assignedUserId === undefined ? existingTask.assignedUserId : input.assignedUserId;
    if (nextAssignedUserId) {
      const assignedUserExists = await this.userRepository.existsById(nextAssignedUserId);
      if (!assignedUserExists) throw new HttpError(404, 'Assigned user not found');
    }

    const updated = await this.taskRepository.updateForOwner(taskId, ownerUserId, {
      projectId: nextProjectId,
      title: input.title ?? existingTask.title,
      description: input.description ?? existingTask.description,
      status: input.status ?? existingTask.status,
      assignedUserId: nextAssignedUserId ?? null,
      dueDate: input.dueDate ?? existingTask.dueDate
    });

    if (!updated) throw new HttpError(404, 'Task not found');
    return updated;
  }

  async deleteTask(ownerUserId: UserId, taskId: TaskId): Promise<void> {
    const deleted = await this.taskRepository.deleteForOwner(taskId, ownerUserId);
    if (!deleted) throw new HttpError(404, 'Task not found');
  }
}

