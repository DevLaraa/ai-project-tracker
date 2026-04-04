import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { pool } from '../db/pool';
import { authenticate } from '../middlewares/authenticate';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { ProjectService } from '../services/ProjectService';

const router = Router();

const projectRepository = new ProjectRepository(pool);
const projectService = new ProjectService(projectRepository);
const projectController = new ProjectController(projectService);

router.use(authenticate);
router.get('/', projectController.listProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.patch('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

export const projectRouter = router;

