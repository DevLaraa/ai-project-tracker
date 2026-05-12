export type AiTaskDraft = {
  title: string;
  description: string;
  status: 'todo';
};

export type GenerateProjectTasksInput = {
  projectName: string;
  projectDescription?: string;
  goals?: string[];
  constraints?: string[];
  taskCount?: number;
};

export type GeneratedTasksResult = {
  provider: 'mock' | 'openai';
  tasks: AiTaskDraft[];
};

export interface AiProvider {
  readonly name: GeneratedTasksResult['provider'];
  generateTasks(input: GenerateProjectTasksInput): Promise<GeneratedTasksResult>;
}
