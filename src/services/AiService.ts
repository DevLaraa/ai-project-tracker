import type { Pool } from 'pg';
import { env } from '../config/env';
import type { PublicTask } from '../models/Task';
import type { GenerateTasksBody } from '../schemas/ai';
import type { ProjectRepository } from '../repositories/ProjectRepository';
import type { TaskRepository } from '../repositories/TaskRepository';
import { HttpError } from '../utils/httpError';
import { logger } from '../utils/logger';

type GeneratedTask = {
  title: string;
  description: string;
  status: 'todo';
};

type GenerateTasksResult = {
  provider: 'external-ai' | 'mock';
  tasks: GeneratedTask[];
};

type GenerateAndCreateTasksInput = {
  projectId: string;
  projectName: string;
  projectDescription?: string;
  taskCount?: number;
};

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function buildPrompt(input: GenerateTasksBody): string {
  const goals = input.goals?.length
    ? input.goals.map((g) => `- ${g}`).join('\n')
    : '- Not provided';

  const constraints = input.constraints?.length
    ? input.constraints.map((c) => `- ${c}`).join('\n')
    : '- Not provided';

  const taskCount = input.taskCount ?? 5;

  return [
    `Project: ${input.projectName}`,
    `Description: ${input.projectDescription ?? 'Not provided'}`,
    `Goals:\n${goals}`,
    `Constraints:\n${constraints}`,
    `Generate exactly ${taskCount} actionable tasks for this project.`,
    'Return ONLY valid JSON array with items: { "title": string, "description": string }.'
  ].join('\n\n');
}

function mockTasks(input: GenerateTasksBody): GeneratedTask[] {
  const project = input.projectName;

  const tasks: GeneratedTask[] = [
    {
      title: `Define scope for ${project}`,
      description: 'Document goals, timeline, and acceptance criteria.',
      status: 'todo'
    },
    {
      title: 'Set up initial architecture',
      description: 'Create modules, environment config, and base services.',
      status: 'todo'
    },
    {
      title: 'Implement core features',
      description: 'Deliver minimum features required for first release.',
      status: 'todo'
    },
    {
      title: 'Test and QA',
      description: 'Run integration tests and resolve critical issues.',
      status: 'todo'
    },
    {
      title: 'Prepare release',
      description: 'Finalize documentation and deployment checklist.',
      status: 'todo'
    }
  ];

  return tasks.slice(0, input.taskCount ?? 5);
}

function safeParseTasks(content: string): GeneratedTask[] {
  const parsed = JSON.parse(content) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error('AI response is not an array');
  }

  return parsed.map((item) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      !('title' in item) ||
      !('description' in item) ||
      typeof item.title !== 'string' ||
      typeof item.description !== 'string'
    ) {
      throw new Error('AI response has invalid task shape');
    }

    return {
      title: item.title.trim(),
      description: item.description.trim(),
      status: 'todo' as const
    };
  });
}

export class AiService {
  constructor(
    private readonly pool: Pool,
    private readonly projectRepository: ProjectRepository,
    private readonly taskRepository: TaskRepository
  ) {}

  async generateTasks(input: GenerateTasksBody): Promise<GenerateTasksResult> {
    if (!env.AI_API_KEY) {
      return {
        provider: 'mock',
        tasks: mockTasks(input)
      };
    }

    const prompt = buildPrompt(input);

    const response = await fetch(`${env.AI_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AI_API_KEY}`
      },
      body: JSON.stringify({
        model: env.AI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a project planning assistant. Return strict JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();

      logger.error(
        { status: response.status, body: errorBody },
        'AI provider request failed'
      );

      throw new HttpError(502, 'Failed to generate tasks from AI provider');
    }

    const data = (await response.json()) as OpenAiChatResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new HttpError(502, 'AI provider returned an empty response');
    }

    try {
      return {
        provider: 'external-ai',
        tasks: safeParseTasks(content)
      };
    } catch {
      throw new HttpError(502, 'AI provider returned invalid task format');
    }
  }

  async generateAndCreateTasks(input: GenerateAndCreateTasksInput, userId: string) {
    const project = await this.projectRepository.getByIdForOwner(input.projectId, userId);

    if (!project) {
      throw new HttpError(404, 'Project not found');
    }

    const aiResult = await this.generateTasks({
      projectName: input.projectName,
      projectDescription: input.projectDescription,
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
