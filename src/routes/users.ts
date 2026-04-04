import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { pool } from '../db/pool';
import { UserRepository } from '../repositories/UserRepository';
import { UserService } from '../services/UserService';
import { UserController } from '../controllers/UserController';

const router = Router();

const userRepository = new UserRepository(pool);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.use(authenticate);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.postUser);

export const userRouter = router;

