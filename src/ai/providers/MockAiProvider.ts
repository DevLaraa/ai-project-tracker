import type { AiProvider, GeneratedTasksResult, GenerateProjectTasksInput } from '../types';

export class MockAiProvider implements AiProvider {
  public readonly name = 'mock' as const;

  async generateTasks(input: GenerateProjectTasksInput): Promise<GeneratedTasksResult> {
    const tasks = [
      {
        title: `Define scope for ${input.projectName}`,
        description: 'Document the goals, stakeholders, timeline, and acceptance criteria.',
        status: 'todo' as const
      },
      {
        title: 'Set up delivery plan',
        description: 'Break the work into milestones, dependencies, and initial owner decisions.',
        status: 'todo' as const
      },
      {
        title: 'Implement core workflow',
        description: 'Build the minimum end-to-end flow required to validate the project outcome.',
        status: 'todo' as const
      },
      {
        title: 'Run QA and polish edge cases',
        description: 'Review behavior, resolve critical bugs, and tighten validation gaps.',
        status: 'todo' as const
      },
      {
        title: 'Prepare release checklist',
        description: 'Finalize documentation, rollout notes, and a short post-release verification pass.',
        status: 'todo' as const
      }
    ];

    return {
      provider: this.name,
      tasks: tasks.slice(0, input.taskCount ?? 5)
    };
  }
}
