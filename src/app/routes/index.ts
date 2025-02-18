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

/**
 * @swagger
 * /api/v1/all:
 *   get:
 *     summary: Get all /api/v1/all:
 *     tags: [/api/v1/all:]
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 */
router.get('/all', async (req, res) => {
  res.send('Working Successfully');
});

export default router;
