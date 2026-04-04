import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { pool } from '../db/pool';
import { authenticate } from '../middlewares/authenticate';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { UserRepository } from '../repositories/UserRepository';
import { TaskService } from '../services/TaskService';

const router = Router();

const taskRepository = new TaskRepository(pool);
const projectRepository = new ProjectRepository(pool);
const userRepository = new UserRepository(pool);
const taskService = new TaskService(taskRepository, projectRepository, userRepository);
const taskController = new TaskController(taskService);

router.use(authenticate);
router.get('/', taskController.listTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export const taskRouter = router;

