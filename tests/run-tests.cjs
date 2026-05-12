const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '3000';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/client_project_tracker';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || '10';
process.env.AI_PROVIDER = process.env.AI_PROVIDER || 'mock';

const { AuthService } = require('../dist/services/AuthService');
const { TaskService } = require('../dist/services/TaskService');
const { AiService } = require('../dist/services/AiService');
const { MockAiProvider } = require('../dist/ai/providers/MockAiProvider');
const { registerBodySchema } = require('../dist/schemas/auth/register.schema');
const { updateTaskBodySchema } = require('../dist/schemas/task/task.schema');
const { parseOrThrow } = require('../dist/utils/validation');
const { HttpError } = require('../dist/utils/httpError');

async function runAuthServiceTests() {
  const registerRepository = {
    getAuthByEmail: async () => null,
    create: async (input) => ({
      id: 'user-1',
      email: input.email,
      name: input.name,
      createdAt: new Date().toISOString()
    })
  };

  const registerService = new AuthService(registerRepository);
  const session = await registerService.register({
    email: '  Engineer@Example.com ',
    password: 'super-secret-password',
    name: '  Sebas  '
  });

  assert.equal(session.user.email, 'engineer@example.com');
  assert.equal(session.user.name, 'Sebas');
  assert.ok(session.accessToken.length > 20);

  const missingUserService = new AuthService({
    getAuthByEmail: async () => null
  });

  await assert.rejects(
    missingUserService.login({ email: 'missing@example.com', password: 'wrong-password' }),
    (error) => error instanceof HttpError && error.statusCode === 401
  );

  const passwordHash = await bcrypt.hash('correct-password', 10);
  const loginService = new AuthService({
    getAuthByEmail: async () => ({
      id: 'user-1',
      email: 'engineer@example.com',
      name: 'Engineer',
      createdAt: new Date().toISOString(),
      passwordHash
    })
  });

  const loginSession = await loginService.login({
    email: 'engineer@example.com',
    password: 'correct-password'
  });

  assert.equal(loginSession.user.id, 'user-1');
}

async function runTaskServiceTests() {
  const listService = new TaskService(
    {
      listForOwner: async () => []
    },
    {
      existsForOwner: async () => false
    },
    {}
  );

  await assert.rejects(
    listService.listTasks('user-1', 'project-foreign'),
    (error) => error instanceof HttpError && error.statusCode === 404
  );

  let updateCalled = false;

  const existingTask = {
    id: 'task-1',
    projectId: 'project-1',
    title: 'Initial task',
    description: null,
    status: 'todo',
    assignedUserId: null,
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updateService = new TaskService(
    {
      getByIdForOwner: async () => existingTask,
      updateForOwner: async () => {
        updateCalled = true;
        return existingTask;
      }
    },
    {
      existsForOwner: async (projectId) => projectId === 'project-1'
    },
    {
      existsById: async () => true
    }
  );

  await assert.rejects(
    updateService.updateTask('user-1', 'task-1', { projectId: 'project-foreign' }),
    (error) => error instanceof HttpError && error.statusCode === 404
  );

  assert.equal(updateCalled, false);
}

async function runAiServiceTests() {
  const provider = new MockAiProvider();
  const providerResult = await provider.generateTasks({
    projectName: 'Portfolio Tracker',
    taskCount: 3
  });

  assert.equal(providerResult.provider, 'mock');
  assert.equal(providerResult.tasks.length, 3);

  const executedQueries = [];
  const createdTasks = [];

  const service = new AiService(
    {
      connect: async () => ({
        query: async (sql) => {
          executedQueries.push(sql);
        },
        release: () => undefined
      })
    },
    {
      getByIdForOwner: async () => ({
        id: 'project-1',
        name: 'Portfolio Tracker',
        description: 'Demo project',
        ownerUserId: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    },
    {
      createWithClient: async (_client, input) => {
        createdTasks.push(input);

        return {
          id: `task-${createdTasks.length}`,
          projectId: 'project-1',
          title: input.title,
          description: input.description ?? null,
          status: 'todo',
          assignedUserId: null,
          dueDate: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    },
    provider
  );

  const result = await service.generateAndCreateTasks({ projectId: 'project-1', taskCount: 2 }, 'user-1');

  assert.equal(result.provider, 'mock');
  assert.equal(result.tasks.length, 2);
  assert.deepEqual(executedQueries, ['BEGIN', 'COMMIT']);
}

function runValidationTests() {
  assert.throws(
    () =>
      parseOrThrow(registerBodySchema, {
        email: 'engineer@example.com',
        password: 'short'
      }),
    (error) =>
      error instanceof HttpError &&
      error.statusCode === 400 &&
      Array.isArray(error.details) &&
      error.details.some((detail) => detail.field === 'password')
  );

  assert.throws(
    () => parseOrThrow(updateTaskBodySchema, {}),
    (error) =>
      error instanceof HttpError &&
      error.statusCode === 400 &&
      Array.isArray(error.details) &&
      error.details.some((detail) => detail.message === 'At least one field must be provided')
  );
}

async function main() {
  const suites = [
    ['auth service', runAuthServiceTests],
    ['task ownership', runTaskServiceTests],
    ['ai service', runAiServiceTests],
    ['validation', runValidationTests]
  ];

  for (const [name, run] of suites) {
    await run();
    console.log(`PASS ${name}`);
  }
}

main().catch((error) => {
  console.error('Test failure');
  console.error(error);
  process.exit(1);
});
