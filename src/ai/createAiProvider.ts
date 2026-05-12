import { env } from '../config/env';
import type { AiProvider } from './types';
import { MockAiProvider } from './providers/MockAiProvider';
import { OpenAiProvider } from './providers/OpenAiProvider';

export function createAiProvider(): AiProvider {
  if (env.AI_PROVIDER === 'openai') {
    return new OpenAiProvider();
  }

  return new MockAiProvider();
}
