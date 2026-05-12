import { env } from '../../config/env';
import { HttpError } from '../../utils/httpError';
import { logger } from '../../utils/logger';
import { parseGeneratedTasks } from '../outputSchema';
import type { AiProvider, GeneratedTasksResult, GenerateProjectTasksInput } from '../types';

type OpenAiResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function buildPrompt(input: GenerateProjectTasksInput): string {
  const goals = input.goals?.length ? input.goals.map((goal) => `- ${goal}`).join('\n') : '- Not provided';
  const constraints = input.constraints?.length
    ? input.constraints.map((constraint) => `- ${constraint}`).join('\n')
    : '- Not provided';

  return [
    `Project: ${input.projectName}`,
    `Description: ${input.projectDescription ?? 'Not provided'}`,
    `Goals:\n${goals}`,
    `Constraints:\n${constraints}`,
    `Generate exactly ${input.taskCount ?? 5} actionable implementation tasks.`,
    'Return only a JSON array of objects with this exact shape:',
    '[{ "title": "string", "description": "string" }]'
  ].join('\n\n');
}

function stripCodeFences(content: string): string {
  const trimmed = content.trim();

  if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  return trimmed;
}

function parseContent(content: string) {
  const normalized = stripCodeFences(content);

  try {
    return parseGeneratedTasks(JSON.parse(normalized));
  } catch (error) {
    logger.warn({ err: error }, 'Failed to parse AI provider response');
    throw new HttpError(502, 'AI provider returned an invalid task payload');
  }
}

export class OpenAiProvider implements AiProvider {
  public readonly name = 'openai' as const;

  async generateTasks(input: GenerateProjectTasksInput): Promise<GeneratedTasksResult> {
    if (!env.AI_API_KEY) {
      throw new HttpError(500, 'AI_PROVIDER is set to openai but AI_API_KEY is missing');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.AI_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${env.AI_API_BASE_URL}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.AI_API_KEY}`
        },
        body: JSON.stringify({
          model: env.AI_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You create practical software delivery plans. Return strict JSON only, with no commentary.'
            },
            {
              role: 'user',
              content: buildPrompt(input)
            }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();

        logger.error(
          { status: response.status, body: errorBody.slice(0, 1000) },
          'OpenAI request failed'
        );

        throw new HttpError(502, 'AI provider request failed');
      }

      const data = (await response.json()) as OpenAiResponse;
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new HttpError(502, 'AI provider returned an empty response');
      }

      return {
        provider: this.name,
        tasks: parseContent(content)
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpError(504, 'AI provider request timed out');
      }

      logger.error({ err: error }, 'OpenAI provider request crashed');
      throw new HttpError(502, 'AI provider request failed');
    } finally {
      clearTimeout(timeout);
    }
  }
}
