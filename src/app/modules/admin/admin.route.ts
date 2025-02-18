import express from 'express';
import * as AdminController from './admin.controller';
import authorize from './admin.middleware';
import SuperAdminAuthorize from './super.admin.middleware';
// import authorize from './admin.middleware';

const clientAdminRouter = express.Router();
const supaAdminRouter = express.Router();

// router.use(authorize('admin')); //Admin Middleware  to be  used when admin signup and signin

clientAdminRouter.post('/login', AdminController.adminLogin);

clientAdminRouter.use(authorize('client_admin'));

clientAdminRouter.get('/clients/all', AdminController.getAllAdminClients);
clientAdminRouter.get('/clients/:id', AdminController.getAnAdminClient);

supaAdminRouter.post('/login', AdminController.adminLogin);

supaAdminRouter.use(SuperAdminAuthorize('super_admin'));

supaAdminRouter.get('/users/all', AdminController.getAllUsers);

supaAdminRouter.get('/client-admins/all', AdminController.getClientAdmins);
supaAdminRouter.get('/client-admins/:id', AdminController.getAClientAdmin);
supaAdminRouter.delete('/client-admins/:id', AdminController.deleteClientAdmin);

supaAdminRouter.get('/user/:id', AdminController.getAUser);
supaAdminRouter.post('/create-super-admin', AdminController.createSuperAdmin);
supaAdminRouter.post('/remove-super-admin', AdminController.removeAsuperAdmin);
supaAdminRouter.get('/clients-and-admins/all', AdminController.getAllAdminsWithClients);
supaAdminRouter.post('/create-admin', AdminController.createAdmin);
supaAdminRouter.post('/assign-client', AdminController.assignClientToAdmin);

supaAdminRouter.delete('/user/:id', AdminController.deleteUser);

//VISAS
supaAdminRouter.get('/visas/all', AdminController.getAllVisas);
supaAdminRouter.get('/visas/:id', AdminController.getAVisa);
supaAdminRouter.post('/visas/update/:id', AdminController.updateVisa);
supaAdminRouter.post('/visas/create', AdminController.createVisa);

export { clientAdminRouter, supaAdminRouter };
//
