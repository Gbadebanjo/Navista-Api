import express from 'express';
import { UserController } from './users.controller';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/all', UserController.allUsers);

export const UserRoutes = router;
