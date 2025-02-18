import express from 'express';
import { UserController } from './users.controller';

const router = express.Router();

// router.post('/register', UserController.register);
// router.post('/login', UserController.login);
router.get('/all', UserController.allUsers);
router.post('/take-assessment', UserController.takeAssessMentt);

export const UserRoutes = router;
