import express from 'express';
import { UserRoutes } from '../modules/users/users.route';
import { clientAdminRouter, supaAdminRouter } from '../modules/admin/admin.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/admin',
    route: supaAdminRouter,
  },
  {
    path: '/client-admin',
    route: clientAdminRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
