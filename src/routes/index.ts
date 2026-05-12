import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';
import { aiRouter } from './ai';
import { authRouter } from './auth';
import { projectRouter } from './projects';
import { taskRouter } from './tasks';

const router = Router();

const healthController = new HealthController();

router.get('/health', (req, res) => healthController.getHealth(req, res));
router.use('/auth', authRouter);
router.use('/ai', aiRouter);
router.use('/projects', projectRouter);
router.use('/tasks', taskRouter);

export default router;

