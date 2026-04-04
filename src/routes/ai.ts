import { Router } from 'express';
import { pool } from '../db/pool';
import { authenticate } from '../middlewares/authenticate';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { AiService } from '../services/AiService';
import { AiController } from '../controllers/AiController';

const router = Router();

const projectRepository = new ProjectRepository(pool);
const taskRepository = new TaskRepository(pool);
const aiService = new AiService(pool, projectRepository, taskRepository);
const aiController = new AiController(aiService);

router.use(authenticate);

router.post('/generate-tasks', aiController.generateTasks);
router.post('/generate-and-create-tasks', aiController.generateAndCreateTasks);

export const aiRouter = router;
