import type { NextFunction, Request, Response } from 'express';
import type { CreateProjectInput, ProjectId, UpdateProjectInput } from '../models/Project';
import type { UserId } from '../models/User';
import { createProjectBodySchema, projectIdParamSchema, updateProjectBodySchema } from '../schemas/project';
import type { ProjectService } from '../services/ProjectService';
import { sendNoContent, sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import { parseOrThrow } from '../utils/validation';

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  public listProjects = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = this.requireUserId(req);
    const projects = await this.projectService.listProjects(ownerUserId);
    sendSuccess(res, projects);
  });

  public getProjectById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = this.requireUserId(req);
    const params = parseOrThrow(projectIdParamSchema, req.params);

    const projectId: ProjectId = params.id;
    const project = await this.projectService.getProjectById(ownerUserId, projectId);
    sendSuccess(res, project);
  });

  public createProject = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = this.requireUserId(req);
    const body = parseOrThrow(createProjectBodySchema, req.body);

    const payload: CreateProjectInput = {
      ownerUserId,
      name: body.name,
      description: body.description
    };
    const created = await this.projectService.createProject(payload);
    sendSuccess(res, created, 201);
  });

  public updateProject = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = this.requireUserId(req);
    const params = parseOrThrow(projectIdParamSchema, req.params);
    const body = parseOrThrow(updateProjectBodySchema, req.body);

    const projectId: ProjectId = params.id;
    const payload: UpdateProjectInput = body;
    const updated = await this.projectService.updateProject(ownerUserId, projectId, payload);
    sendSuccess(res, updated);
  });

  public deleteProject = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = this.requireUserId(req);
    const params = parseOrThrow(projectIdParamSchema, req.params);

    const projectId: ProjectId = params.id;
    await this.projectService.deleteProject(ownerUserId, projectId);
    sendNoContent(res);
  });

  private requireUserId(req: Request): UserId {
    if (!req.user) throw new HttpError(401, 'Unauthorized');
    return req.user.id;
  }
}

