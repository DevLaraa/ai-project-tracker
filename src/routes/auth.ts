import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { pool } from '../db/pool';
import { UserRepository } from '../repositories/UserRepository';
import { AuthService } from '../services/AuthService';

const router = Router();

const userRepository = new UserRepository(pool);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post('/register', authController.register);
router.post('/login', authController.login);

export const authRouter = router;
