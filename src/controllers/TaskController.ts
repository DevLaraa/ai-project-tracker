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
import { sendNoContent, sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import { parseOrThrow } from '../utils/validation';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  public listTasks = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = this.requireUserId(req);
    const query = parseOrThrow(listTasksQuerySchema, req.query);

    const projectId: ProjectId | undefined = query.projectId;
    const tasks = await this.taskService.listTasks(ownerUserId, projectId);
    sendSuccess(res, tasks);
  });

  public getTaskById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = this.requireUserId(req);
    const params = parseOrThrow(taskIdParamSchema, req.params);

    const taskId: TaskId = params.id;
    const task = await this.taskService.getTaskById(ownerUserId, taskId);
    sendSuccess(res, task);
  });

  public createTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = this.requireUserId(req);
    const body = parseOrThrow(createTaskBodySchema, req.body);

    const payload: CreateTaskInput = body;
    const created = await this.taskService.createTask(ownerUserId, payload);
    sendSuccess(res, created, 201);
  });

  public updateTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = this.requireUserId(req);
    const params = parseOrThrow(taskIdParamSchema, req.params);
    const body = parseOrThrow(updateTaskBodySchema, req.body);

    const taskId: TaskId = params.id;
    const payload: UpdateTaskInput = body;
    const updated = await this.taskService.updateTask(ownerUserId, taskId, payload);
    sendSuccess(res, updated);
  });

  public deleteTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = this.requireUserId(req);
    const params = parseOrThrow(taskIdParamSchema, req.params);

    const taskId: TaskId = params.id;
    await this.taskService.deleteTask(ownerUserId, taskId);
    sendNoContent(res);
  });

  private requireUserId(req: Request): UserId {
    if (!req.user) throw new HttpError(401, 'Unauthorized');
    return req.user.id;
  }
}

