import express from 'express';
import * as AdminController from './admin.controller';
import authorize from './admin.middleware';
// import authorize from './admin.middleware';

const router = express.Router();

router.use(authorize('admin'));

router.get('/all', AdminController.getAllUsers);
router.get('/:id', AdminController.getAUser);
router.delete('/:id', AdminController.deleteUser);
export default router;
//
