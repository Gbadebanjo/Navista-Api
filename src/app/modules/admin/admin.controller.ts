import { assignClientToAdminEmailTemplate, inviteAdminEmailTemplate } from '../../../common/email.template';
import sendEmail from '../../../common/send.email';
import { supabase, supabaseAdmin } from '../../../config/supabase.config';
import catchAsync from '../../../interface/catchAsync';
import bcrypt from 'bcrypt';
import { validateVisaData } from './admin.helpers';
import { visaTypeSchema } from '../../middlewares/visa.data.validator';
import config from '../../../config';

/**
 * @swagger
 * /api/v1/admin/users/all:
 *   get:
 *     summary: Get all Users
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 */
export const getAllUsers = catchAsync(async (req, res) => {
  const users = await supabaseAdmin.from('profiles').select('*');

  const usersAdmins = await Promise.all(
    users.data.map(async (user) => {
      const clientAdmin = await supabaseAdmin.from('client_admin_assignments').select('*');

      console.log(clientAdmin);

      const searchClientAdmin = clientAdmin.data.find((admin) => admin.users_assigned.includes(user.id));

      const visa_application = await supabaseAdmin
        .from('application_trackings')
        .select('*')
        .eq('email', user.email)
        .single();

      if (!searchClientAdmin) {
        return {
          ...user,
          client_Admin: null,
          visa_type: visa_application?.data?.visa_type ? visa_application?.data?.visa_type || null : null,
        };
      }

      const clientAdminDetails = await supabaseAdmin
        .from('client_admins')
        .select('*')
        .eq('id', searchClientAdmin.client_admin_id)
        .single();

      if (!clientAdminDetails.data)
        return {
          ...user,
          client_Admin: null,
          visa_type: visa_application?.data?.visa_type ? visa_application?.data?.visa_type || null : null,
        };

      return {
        ...user,
        client_admin: {
          id: clientAdminDetails.data.id,
          name: `${clientAdminDetails.data.first_name} ${clientAdminDetails.data.last_name}`,
          email: clientAdminDetails.data.email,
        },
        visa_type: visa_application?.data?.visa_type ? visa_application?.data?.visa_type || null : null,
      };
    })
  );
  res.status(users.status).json({
    status: users.statusText,
    data: usersAdmins,
    admins: usersAdmins,
  });
});

/**
 * @swagger
 * /api/v1/admin/user/{id}:
 *   get:
 *     summary: Get A User
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Successfully retrieved a user
 */
export const getAUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();

  if (!user.data) return res.status(404).json({ error: 'User not found' });
  const documentPaths = await supabaseAdmin.from('documents').select('*').eq('user_id', id);
  // console.log(user);

  const user_assessments = await supabaseAdmin
    .from('client_assessments')
    .select('*')
    .eq('email', user.data.email)
    .single();

  // const documents = documentPaths.data.map((doc) => await supabaseAdmin.storage.from('documents').createSignedUrls);
  if (!documentPaths.data)
    return res.status(200).json({
      status: 'success',
      data: user.data,
      user_documents: [],
      user_assessment: user_assessments.data,
    });

  const documents = await supabaseAdmin.storage.from(config.supabase.bucket_name).createSignedUrls(
    documentPaths.data.map((doc) => doc.file_path),
    Number(config.supabase.document_expiry)
  );

  // const users = await supabase.auth.admin.listUsers();
  // console.log(users);
  res.status(user.status).json({
    status: user.statusText,
    data: user.data,
    user_documents: documents,
    user_assessment: user_assessments.data,
  });
});

/**
 * @swagger
 * /api/v1/admin/user/{id}:
 *   delete:
 *     summary: Delete A User
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Successfully deleted a user
 */
export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await supabaseAdmin.from('profiles').delete().eq('id', id);
  console.log(user);
  res.status(user.status).json({
    status: user.statusText,
    data: user.data,
  });
});

/**
 * @swagger
 * /api/v1/admin/create-admin:
 *   post:
 *     summary: Create A Client Admin
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: "exam@gmail.com"
 *               first_name: "John"
 *               last_name: "Doe"
 *               password: "password"
 *     responses:
 *       201:
 *         description: Successfully created an admin
 *       401:
 *         description: Error creating an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: "Error creating an admin"
 */
export const createAdmin = catchAsync(async (req, res) => {
  const { first_name, last_name, password } = req.body;
  const email = req.body.email.toLowerCase();
  const passwdEncrypt = bcrypt.hashSync(password, 10);

  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password: password,
    options: {
      data: {
        first_name,
        last_name,
        role: 'client_admin',
      },
    },
  });

  if (error) return res.status(401).json({ error: error.message });

  await supabaseAdmin.from('client_admins').insert({
    email,
    first_name,
    last_name,
    role: 'client_admin',
    password: passwdEncrypt,
  });

  //send email to user

  const mailBody = inviteAdminEmailTemplate(`${first_name} ${last_name}`, { email, password });
  await sendEmail({
    to: email,
    subject: 'Admin Account Created',
    text: 'Admin Account Created',
    html: mailBody,
  });

  return res.status(201).json({
    status: 'success',
    data: data,
    // client_admin: updateClientAdminTable.data,
  });
});

/**
 * @swagger
 * /api/v1/admin/client-admins/all:
 *  get:
 *    summary: Get all Client Admins
 *    tags: [Super Admin]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Successfully retrieved all client admins
 */
export const getClientAdmins = catchAsync(async (req, res) => {
  const admins = await supabaseAdmin.from('client_admins').select('*');
  console.log(admins);
  res.status(admins.status).json({
    status: admins.statusText,
    data: admins.data,
  });
}); /**
 * @swagger
 * /api/v1/admin/assign-client:
 *   post:
 *     summary: Assign A Client To Client Admin
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_id:
 *                 type: string
 *               admin_id:
 *                 type: string
 *             example:
 *               client_id: "client123"
 *               admin_id: "admin456"
 *     responses:
 *       201:
 *         description: Successfully assigned a client to an admin
 */
export const assignClientToAdmin = catchAsync(async (req, res) => {
  const { client_id, admin_id } = req.body;
  const { data, error } = await supabaseAdmin.from('client_admins').select('*').eq('id', admin_id);

  const client = await supabaseAdmin.from('profiles').select('*').eq('id', client_id);

  console.log(data, error);

  if (data.length === 0) return res.status(404).json({ error: 'Admin not found' });

  if (client.data.length === 0) return res.status(404).json({ error: 'Client not found' });

  if (error) return res.status(401).json({ error: error.message });

  const clientAssigned = await supabaseAdmin
    .from('client_admin_assignments')
    .select('*')
    .eq('client_admin_id', admin_id);

  if (clientAssigned.data.length > 0) {
    if (clientAssigned.data[0].users_assigned.includes(client_id))
      return res.status(400).json({ error: 'Client already assigned to admin' });
    await supabaseAdmin
      .from('client_admin_assignments')
      .update({
        users_assigned: clientAssigned.data[0].users_assigned.concat(client_id),
      })
      .eq('client_admin_id', admin_id);
  } else {
    await supabaseAdmin.from('client_admin_assignments').insert({
      client_admin_id: admin_id,
      users_assigned: [client_id],
    });
  }

  const mailBody = assignClientToAdminEmailTemplate(
    data[0].first_name,
    client.data[0].first_name || client.data[0].username
  );

  await sendEmail({
    to: data[0].email,
    subject: 'Client Assigned',
    text: 'Client Assigned',
    html: mailBody,
  });

  return res.status(201).json({
    status: 'success',
    data: 'Client assigned to admin',
  });
});

/**
 * @swagger
 * /api/v1/admin/client-admins/{id}:
 *   get:
 *     summary: Get A Client Admin
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the client admin
 *     responses:
 *       200:
 *         description: Successfully retrieved a client admin
 */
export const getAClientAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const admin = await supabaseAdmin.from('client_admins').select('*').eq('id', id);

  res.status(admin.status).json({
    status: admin.statusText,
    data: admin.data,
  });
});

/**
 * @swagger
 * /api/v1/admin/clients-and-admins/all:
 *   get:
 *     summary: Get all Admins with their Clients
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all clients and admins
 */
export const getAllAdminsWithClients = catchAsync(async (req, res) => {
  const admins = await supabaseAdmin.from('client_admins').select('*');

  const adminsClients = await Promise.all(
    admins.data.map(async (admin) => {
      const clients = await supabaseAdmin.from('client_admin_assignments').select('*').eq('client_admin_id', admin.id);

      if (clients.data.length === 0) {
        return { ...admin, clients: [] };
      }

      const clientDetails = await Promise.all(
        clients.data[0].users_assigned.map(async (clientId) => {
          const client = await supabaseAdmin.from('profiles').select('*').eq('id', clientId);
          return client.data[0];
        })
      );

      return { ...admin, clients: clientDetails };
    })
  );

  res.status(admins.status).json({
    status: admins.statusText,
    data: adminsClients,
  });
});

/**
 * @swagger
 * /api/v1/client-admin/clients/all:
 *   get:
 *     summary: Get all Clients for a Client Admin
 *     tags: [Client Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all clients
 */
export const getAllAdminClients = catchAsync(async (req, res) => {
  const adminDetail = req.body.user;

  const clientAdmin = await supabaseAdmin.from('client_admins').select('*').eq('email', adminDetail.email);

  const clients = await supabaseAdmin
    .from('client_admin_assignments')
    .select('*')
    .eq('client_admin_id', clientAdmin.data[0].id);

  if (clients.data.length === 0) {
    return res.status(404).json({ error: 'No clients found for this admin' });
  }

  const clientDetails = await Promise.all(
    clients.data[0].users_assigned.map(async (clientId) => {
      const client = await supabaseAdmin.from('profiles').select('*').eq('id', clientId);
      return client.data[0];
    })
  );

  res.status(clients.status).json({
    status: clients.statusText,
    data: clientDetails,
  });
});

/**
 * @swagger
 * /api/v1/admin/client-admins/{id}:
 *   delete:
 *     summary: Delete A Client Admin
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the client admin
 *     responses:
 *       200:
 *         description: Successfully deleted a client admin
 */
export const deleteClientAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const admin = await supabaseAdmin.from('client_admins').delete().eq('id', id);

  //What About the client_admin_assignments table?

  res.status(admin.status).json({
    status: admin.statusText,
    data: admin.data,
  });
});

/**
 * @swagger
 * /api/v1/admin/create-super-admin:
 *   post:
 *     summary: Create A Super Admin
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             example:
 *               email: "example@gmail.com"
 *     responses:
 *       201:
 *         description: Successfully created a super admin
 */
export const createSuperAdmin = catchAsync(async (req, res) => {
  const { email } = req.body;

  const { data, error } = await supabaseAdmin.from('super_admins').insert({
    email: email.toLowerCase(),
  });

  if (error) return res.status(401).json({ success: false, error: error.message });

  return res.status(201).json({
    status: 'success',
    data: data,
  });
});

/**
 * @swagger
 * /api/v1/admin/remove-super-admin:
 *   post:
 *     summary: Remove A Super Admin
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             example:
 *               email: "example@gmail.com"
 *     responses:
 *       201:
 *         description: Successfully removed a super admin
 */
export const removeAsuperAdmin = catchAsync(async (req, res) => {
  const { email } = req.body;
  const { data, error } = await supabaseAdmin.from('super_admins').delete().eq('email', email.toLowerCase());

  if (error) return res.status(401).json({ success: false, error: error.message });

  return res.status(201).json({
    status: 'success',
    data: data,
  });
});

/**
 * @swagger
 * /api/v1/admin/super-admins/all:
 *   get:
 *     summary: Get all Super Admins
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all super admins
 */
export const getAllSuperAdmins = catchAsync(async (req, res) => {
  const superAdmins = await supabaseAdmin.from('super_admins').select('*');
  res.status(superAdmins.status).json({
    status: superAdmins.statusText,
    data: superAdmins.data,
  });
});

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Login As Admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: "example@gmail.com"
 *               password: "Navisa_Admin"
 *     responses:
 *       200:
 *         description: Successfully logged in
 */
export const adminLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // console.log(data, error);

  if (error) return res.status(401).json({ error: error.message });

  const checkIfSuperAdmin = await supabaseAdmin.from('super_admins').select('*').eq('email', email.toLowerCase());

  const checkIfClientAdmin = await supabaseAdmin.from('client_admins').select('*').eq('email', email.toLowerCase());

  if (checkIfSuperAdmin.data.length === 0 && checkIfClientAdmin.data.length === 0)
    return res.status(401).json({ error: 'Unauthorized' });

  return res.status(200).json({
    status: 'success',
    data: {
      user: { ...data.user.user_metadata, role: checkIfSuperAdmin.data.length > 0 ? 'super_admin' : 'client_admin' },
      token: data.session.access_token,
    },
  });

  return res.status(200).json({
    status: 'success',
    data: { user: data.user.user_metadata, token: data.session.access_token },
  });
});

/**
 * @swagger
 * /api/v1/client-admin/clients/{id}:
 *   get:
 *     summary: Get A Client assigned to a client admin
 *     tags: [Client Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the client
 *     responses:
 *       200:
 *         description: Successfully retrieved a client admin
 */
export const getAnAdminClient = catchAsync(async (req, res) => {
  const { id } = req.params;
  const adminDetail = req.body.user;

  const clientAdmin = await supabaseAdmin.from('client_admins').select('*').eq('email', adminDetail.email);

  const clients = await supabaseAdmin
    .from('client_admin_assignments')
    .select('*')
    .eq('client_admin_id', clientAdmin.data[0].id);

  if (clients.data.length === 0) {
    return res.status(404).json({ error: 'No clients found for this admin' });
  }

  const clientDetails = await Promise.all(
    clients.data[0].users_assigned.map(async (clientId) => {
      const client = await supabaseAdmin.from('profiles').select('*').eq('id', clientId).single();

      return { ...client.data[0] };
    })
  );

  const client = clientDetails.find((client) => client.id === id);

  if (!client) return res.status(404).json({ error: 'Client not found' });

  const documentPaths = await supabaseAdmin.from('documents').select('*').eq('user_id', client.id);

  const documents = await supabaseAdmin.storage.from('documents').createSignedUrls(
    documentPaths.data.map((doc) => doc.file_path),
    Number(config.supabase.document_expiry)
  );

  const user_assessments = await supabaseAdmin
    .from('client_assessments')
    .select('*')
    .eq('email', client.data.email)
    .single();

  res.status(200).json({
    status: 'success',
    data: { client: client, user_documents: documents, user_assessment: user_assessments.data },
  });
});

//VISAS

export const updateVisa = catchAsync(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin.from('visas').update(req.body).eq('id', id);

  if (error) return res.status(401).json({ error: error.message });

  return res.status(201).json({
    status: 'success',
    data: data,
  });
});

export const getAllVisas = catchAsync(async (req, res) => {
  const visas = await supabaseAdmin.from('visas').select('*');
  res.status(visas.status).json({
    status: visas.statusText,
    data: visas.data,
  });
});

export const getAVisa = catchAsync(async (req, res) => {
  const { id } = req.params;
  const visa = await supabaseAdmin.from('visas').select('*').eq('id', id);
  res.status(visa.status).json({
    status: visa.statusText,
    data: visa.data,
  });
});

/**
 * @swagger
 * /api/v1/admin/visas/create:
 *   post:
 *     summary: Create Visas on the Database
 *     tags: [Super Admin]
 *     security:
 *      - bearerAuth: []
 *     description: Submit education, experience, achievements, and others .
 *     parameters:
 *       - name: visa_name
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["UK Global Talent Visa", "US EB-1/EB-2 VISA", "CANADA EXPRESS ENTRY", "DUBAI GOLDEN VISA"]
 *         description: The name of the visa type (e.g., "UK Global Talent Visa", "US EB-1/EB-2 VISA", "CANADA EXPRESS ENTRY", "DUBAI GOLDEN VISA")
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 description: Request body for UK Global Talent Visa
 *                 properties:
 *                   education:
 *                     type: object
 *                     properties:
 *                       scoring:
 *                         type: object
 *                         properties:
 *                           PhD: { type: integer, example: 100 }
 *                           Masters: { type: integer, example: 80 }
 *                           Bachelors: { type: integer, example: 60 }
 *                           Diploma: { type: integer, example: 40 }
 *                           Other: { type: integer, example: 20 }
 *                   experience:
 *                     type: object
 *                     properties:
 *                       minimumYearsRequired: { type: integer, example: 3 }
 *                       experiencePoints:
 *                         type: object
 *                         properties:
 *                           3-5Years: { type: integer, example: 60 }
 *                           5-8Years: { type: integer, example: 80 }
 *                           8+Years: { type: integer, example: 100 }
 *                   achievements:
 *                     type: object
 *                     properties:
 *                       required: { type: integer, example: 2 }
 *                       scoring:
 *                         type: object
 *                         properties:
 *                           2Items: { type: integer, example: 60 }
 *                           3Items: { type: integer, example: 80 }
 *                           4PlusItems: { type: integer, example: 100 }
 *               - type: object
 *                 description: Request body for US EB-1/EB-2 VISA
 *                 properties:
 *                   education:
 *                     type: object
 *                     properties:
 *                       scoring:
 *                         type: object
 *                         properties:
 *                           PhD: { type: integer, example: 100 }
 *                           Masters: { type: integer, example: 80 }
 *                           BachelorsExceptional: { type: integer, example: 60 }
 *                   experience:
 *                     type: object
 *                     properties:
 *                       minimumYearsRequired: { type: integer, example: 5 }
 *                       experiencePoints:
 *                         type: object
 *                         properties:
 *                           5-7Years: { type: integer, example: 60 }
 *                           8-10Years: { type: integer, example: 80 }
 *                           10+Years: { type: integer, example: 100 }
 *                   positions:
 *                     type: object
 *                     properties:
 *                       Executive: { type: integer, example: 100 }
 *                       SeniorManagement: { type: integer, example: 80 }
 *                       Expert: { type: integer, example: 70 }
 *                       Other: { type: integer, example: 50 }
 *                   achievements:
 *                     type: object
 *                     properties:
 *                       required: { type: integer, example: 3 }
 *                       recognitionLevels:
 *                         type: object
 *                         properties:
 *                           International: { type: integer, example: 100 }
 *                           National: { type: integer, example: 80 }
 *                           Industry: { type: integer, example: 60 }
 *               - type: object
 *                 description: Request body for CANADA EXPRESS ENTRY
 *                 properties:
 *                   education:
 *                     type: object
 *                     properties:
 *                       PhD: { type: integer, example: 100 }
 *                       Masters: { type: integer, example: 80 }
 *                       Bachelors: { type: integer, example: 60 }
 *                       ThreeYearDiploma: { type: integer, example: 50 }
 *                       OneTwoYearDiploma: { type: integer, example: 40 }
 *                   languageProficiency:
 *                     type: object
 *                     properties:
 *                       CLB9Plus: { type: integer, example: 100 }
 *                       CLB8: { type: integer, example: 80 }
 *                       CLB7: { type: integer, example: 60 }
 *                       CLB6: { type: integer, example: 40 }
 *                       BelowCLB6: { type: string, example: "Ineligible" }
 *                   workExperience:
 *                     type: object
 *                     properties:
 *                       scoring:
 *                         type: object
 *                         properties:
 *                           1Year: { type: integer, example: 40 }
 *                           2-3Years: { type: integer, example: 53 }
 *                           4-5Years: { type: integer, example: 64 }
 *                           6+Years: { type: integer, example: 72 }
 *                       foreignBonus:
 *                         type: object
 *                         properties:
 *                           1-2Years: { type: integer, example: 13 }
 *                           3-4Years: { type: integer, example: 25 }
 *                           5+Years: { type: integer, example: 50 }
 *               - type: object
 *                 description: Request body for DUBAI GOLDEN VISA
 *                 properties:
 *                   financialCriteria:
 *                     type: object
 *                     properties:
 *                       PublicInvestment10MPlus: { type: integer, example: 100 }
 *                       PublicInvestment5To10M: { type: integer, example: 80 }
 *                       PrivateCompany5MPlus: { type: integer, example: 80 }
 *                       PrivateCompany3To5M: { type: integer, example: 60 }
 *                       PropertyInvestment2MPlus: { type: integer, example: 60 }
 *                       PropertyInvestment1To2M: { type: integer, example: 40 }
 *                   professionalCriteria:
 *                     type: object
 *                     properties:
 *                       Salary30KPlus: { type: integer, example: 100 }
 *                       Salary20To30K: { type: integer, example: 80 }
 *                       Salary15To20K: { type: integer, example: 60 }
 *                       PositionCEOMD: { type: integer, example: 100 }
 *                       PositionSeniorManagement: { type: integer, example: 80 }
 *                       PositionDepartmentHead: { type: integer, example: 60 }
 *     responses:
 *       200:
 *         description: Successfully Uploaded Visa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 visa_name: { type: string, example: "DUBAI GOLDEN VISA" }
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Internal server error
 */

export const createVisa = catchAsync(async (req, res) => {
  // console.log(req.body, req.query);
  //
  const visaType = visaTypeSchema.safeParse(req.query.visa_name);

  if (!visaType.success) return res.status(400).json({ success: false, error: visaType.error.errors[0].message });

  const validateData = validateVisaData(req.query.visa_name, req.body);
  // console.log(validateData);

  if (!validateData.success) return res.status(400).json({ success: false, error: validateData.error.errors });

  const { data, error } = await supabaseAdmin.from('visas').insert({
    visa_name: visaType.data,
    criteras: validateData.data,
  });

  if (error) return res.status(401).json({ error: error.message });

  return res.status(201).json({
    status: 'success',
    data: data,
  });
});

/**
 * @swagger
 * /api/v1/admin/applications/all:
 *   get:
 *     summary: Get all Applications
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all applications
 *       401:
 *         description: Error retrieving all applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: "Error retrieving all applications"
 */
export const getAllApplications = catchAsync(async (req, res) => {
  try {
    const { data: appliations, error } = await supabaseAdmin.from('application_trackings').select('*');
    if (error) return res.status(401).json({ error: error.message });

    const applicationsDetail = await Promise.all(
      appliations.map(async (application) => {
        const user = await supabaseAdmin.from('profiles').select('*').eq('email', application.email).single();

        const { data: user_assessment } = await supabaseAdmin
          .from('client_assessments')
          .select('*')
          .eq('email', application.email)
          .single();
        let user_score = 0;
        const fieldOfStudy = user_assessment?.assessment_data?.field;
        const yearsOfExperience = user_assessment?.assessment_data?.experience?.years;
        const nationality = user_assessment?.personal?.nationality;

        switch (application.visa_type) {
          case 'UK Global Talent Visa':
            user_score = user_assessment?.score?.uk;
            break;

          case 'US EB-1/EB-2 VISA':
            user_score = user_assessment?.score?.us;
            break;

          case 'CANADA EXPRESS ENTRY':
            user_score = user_assessment?.score?.canada;
            break;

          case 'DUBAI GOLDEN VISA':
            user_score = user_assessment?.score?.dubai;
            break;
          default:
            break;
        }

        const incompleteUser = {
          first_name: user_assessment?.personal?.fullName.split(' ')[0],
          last_name: user_assessment?.personal?.fullName.split(' ')[1],
          email: application?.email,
        };

        if (!user.data)
          return {
            ...application,
            user: incompleteUser,
            documents: [],
            eligibilityScores: user_score,

            nationality: nationality,
            fieldOfStudy: fieldOfStudy,
            workHistory: yearsOfExperience + ' years',
          };

        const { data: documents, error: docerror } = await supabaseAdmin
          .from('documents')
          .select('*')
          .eq('user_id', user.data.id);

        if (docerror) return res.status(401).json({ error: docerror.message });

        const documentsWithUrl = await Promise.all(
          documents.map(async (doc) => {
            const { data: signedURL, error } = await supabaseAdmin.storage
              .from(config.supabase.bucket_name)
              .createSignedUrl(doc.file_path, Number(config.supabase.document_expiry));

            if (error) return res.status(401).json({ error: error.message });

            return { ...doc, signedUrl: signedURL.signedUrl };
          })
        );

        return {
          ...application,
          user: user.data ? user.data : incompleteUser,
          documents: documentsWithUrl,
          eligibilityScores: user_score,

          nationality: nationality,
          fieldOfStudy: fieldOfStudy,
          workHistory: yearsOfExperience + ' years',
        };
      })
    );

    return res.status(200).json({
      status: 'success',
      data: applicationsDetail.filter((app) => app.user !== null),
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: error.message });
  }
});

export const approveADocument = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin.from('documents').update({ status: 'Verified' }).eq('id', id);

  if (error) return res.status(401).json({ error: error.message });

  return res.status(201).json({
    status: 'success',
    data: data,
  });
});

export const rejectADocument = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin.from('documents').update({ status: 'Disapproved' }).eq('id', id);

  if (error) return res.status(401).json({ error: error.message });

  return res.status(201).json({
    status: 'success',
    data: data,
  });
});
