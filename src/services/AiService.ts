import type { Pool } from 'pg';
import type { PublicTask } from '../models/Task';
import type { GenerateTasksBody } from '../schemas/ai';
import type { ProjectRepository } from '../repositories/ProjectRepository';
import type { TaskRepository } from '../repositories/TaskRepository';
import type { AiProvider } from '../ai/types';
import { HttpError } from '../utils/httpError';
import { logger } from '../utils/logger';

type GenerateAndCreateTasksInput = {
  projectId: string;
  taskCount?: number;
};

export class AiService {
  constructor(
    private readonly pool: Pool,
    private readonly projectRepository: ProjectRepository,
    private readonly taskRepository: TaskRepository,
    private readonly aiProvider: AiProvider
  ) {}

  async generateTasks(input: GenerateTasksBody) {
    return this.aiProvider.generateTasks(input);
  }

  async generateAndCreateTasks(input: GenerateAndCreateTasksInput, userId: string) {
    const project = await this.projectRepository.getByIdForOwner(input.projectId, userId);

    if (!project) {
      throw new HttpError(404, 'Project not found');
    }

    const aiResult = await this.generateTasks({
      projectName: project.name,
      projectDescription: project.description ?? undefined,
      taskCount: input.taskCount
    });

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const createdTasks: PublicTask[] = [];

      for (const task of aiResult.tasks) {
        const createdTask = await this.taskRepository.createWithClient(client, {
          projectId: input.projectId,
          title: task.title,
          description: task.description,
          status: 'todo'
        });

        createdTasks.push(createdTask);
      }

      await client.query('COMMIT');

      return {
        provider: aiResult.provider,
        tasks: createdTasks
      };
    } catch (error) {
      await client.query('ROLLBACK');

      logger.error(
        { err: error, projectId: input.projectId },
        'Failed to persist AI-generated tasks'
      );

      throw new HttpError(500, 'Failed to create AI-generated tasks');
    } finally {
      client.release();
    }
  }
}
