import express from 'express';
import * as AdminController from './admin.controller';
import authorize from './admin.middleware';
// import authorize from './admin.middleware';

const router = express.Router();

// router.use(authorize('admin')); //Admin Middleware  to be  used when admin signup and signin

router.get('/all', AdminController.getAllUsers);
router.get('/client-admins/all', AdminController.getClientAdmins);
router.get('/client-admins/:id', AdminController.getAClientAdmin);
router.delete('/client-admins/:id', AdminController.deleteClientAdmin);

router.get('/:id', AdminController.getAUser);
router.post('/create-admin', AdminController.createAdmin);
router.post('/assign-client', AdminController.assignClientToAdmin);
router.delete('/:id', AdminController.deleteUser);
export default router;
//
