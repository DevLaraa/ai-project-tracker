import type { NextFunction, Request, Response } from 'express';
import type { ProjectId } from '../models/Project';
import type { CreateTaskInput, TaskId, UpdateTaskInput } from '../models/Task';
import type { UserId } from '../models/User';
import {
  createTaskBodySchema,
  listTasksQuerySchema,
  taskIdParamSchema,
  updateTaskBodySchema
} from '../schemas/task';
import type { TaskService } from '../services/TaskService';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';

function requireUserId(req: Request): UserId {
  if (!req.user) throw new HttpError(401, 'Unauthorized');
  return req.user.id;
}

function toValidationDetails(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.map((issue) => ({
    field: issue.path.map((part) => String(part)).join('.') || 'body',
    message: issue.message
  }));
}

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  public listTasks = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = requireUserId(req);
    const parsed = listTasksQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new HttpError(400, 'Validation failed', toValidationDetails(parsed.error.issues));

    const projectId: ProjectId | undefined = parsed.data.projectId;
    const tasks = await this.taskService.listTasks(ownerUserId, projectId);
    res.json({ data: tasks });
  });

  public getTaskById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = requireUserId(req);
    const parsed = taskIdParamSchema.safeParse(req.params);
    if (!parsed.success) throw new HttpError(400, 'Validation failed', toValidationDetails(parsed.error.issues));

    const taskId: TaskId = parsed.data.id;
    const task = await this.taskService.getTaskById(ownerUserId, taskId);
    res.json({ data: task });
  });

  public createTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = requireUserId(req);
    const parsed = createTaskBodySchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Validation failed', toValidationDetails(parsed.error.issues));

    const payload: CreateTaskInput = parsed.data;
    const created = await this.taskService.createTask(ownerUserId, payload);
    res.status(201).json({ data: created });
  });

  public updateTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = requireUserId(req);
    const parsedParams = taskIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new HttpError(400, 'Validation failed', toValidationDetails(parsedParams.error.issues));
    }

    const parsedBody = updateTaskBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new HttpError(400, 'Validation failed', toValidationDetails(parsedBody.error.issues));
    }

    const taskId: TaskId = parsedParams.data.id;
    const payload: UpdateTaskInput = parsedBody.data;
    const updated = await this.taskService.updateTask(ownerUserId, taskId, payload);
    res.json({ data: updated });
  });

  public deleteTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = requireUserId(req);
    const parsed = taskIdParamSchema.safeParse(req.params);
    if (!parsed.success) throw new HttpError(400, 'Validation failed', toValidationDetails(parsed.error.issues));

    const taskId: TaskId = parsed.data.id;
    await this.taskService.deleteTask(ownerUserId, taskId);
    res.status(204).send();
  });
}

