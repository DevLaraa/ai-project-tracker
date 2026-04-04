import type { NextFunction, Request, Response } from 'express';
import type { CreateProjectInput, ProjectId, UpdateProjectInput } from '../models/Project';
import type { UserId } from '../models/User';
import { createProjectBodySchema, projectIdParamSchema, updateProjectBodySchema } from '../schemas/project';
import type { ProjectService } from '../services/ProjectService';
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

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  public listProjects = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = requireUserId(req);
    const projects = await this.projectService.listProjects(ownerUserId);
    res.json({ data: projects });
  });

  public getProjectById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = requireUserId(req);
    const parsed = projectIdParamSchema.safeParse(req.params);
    if (!parsed.success) throw new HttpError(400, 'Validation failed', toValidationDetails(parsed.error.issues));

    const projectId: ProjectId = parsed.data.id;
    const project = await this.projectService.getProjectById(ownerUserId, projectId);
    res.json({ data: project });
  });

  public createProject = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = requireUserId(req);
    const parsed = createProjectBodySchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Validation failed', toValidationDetails(parsed.error.issues));

    const payload: CreateProjectInput = {
      ownerUserId,
      name: parsed.data.name,
      description: parsed.data.description
    };
    const created = await this.projectService.createProject(payload);
    res.status(201).json({ data: created });
  });

  public updateProject = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = requireUserId(req);
    const parsedParams = projectIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new HttpError(400, 'Validation failed', toValidationDetails(parsedParams.error.issues));
    }

    const parsedBody = updateProjectBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new HttpError(400, 'Validation failed', toValidationDetails(parsedBody.error.issues));
    }

    const projectId: ProjectId = parsedParams.data.id;
    const payload: UpdateProjectInput = parsedBody.data;
    const updated = await this.projectService.updateProject(ownerUserId, projectId, payload);
    res.json({ data: updated });
  });

  public deleteProject = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ownerUserId = requireUserId(req);
    const parsed = projectIdParamSchema.safeParse(req.params);
    if (!parsed.success) throw new HttpError(400, 'Validation failed', toValidationDetails(parsed.error.issues));

    const projectId: ProjectId = parsed.data.id;
    await this.projectService.deleteProject(ownerUserId, projectId);
    res.status(204).send();
  });
}

