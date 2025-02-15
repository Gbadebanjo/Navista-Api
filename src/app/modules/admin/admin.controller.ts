import { assignClientToAdminEmailTemplate, inviteAdminEmailTemplate } from '../../../common/email.template';
import sendEmail from '../../../common/send.email';
import { supabase, supabaseAdmin } from '../../../config/supabase.config';
import catchAsync from '../../../interface/catchAsync';
import bcrypt from 'bcrypt';

export const getAllUsers = catchAsync(async (req, res) => {
  const users = await supabaseAdmin.from('profiles').select('*');
  res.status(users.status).json({
    status: users.statusText,
    data: users.data,
  });
});

export const getClientAdmins = catchAsync(async (req, res) => {
  const admins = await supabaseAdmin.from('client_admins').select('*');
  console.log(admins);
  res.status(admins.status).json({
    status: admins.statusText,
    data: admins.data,
  });
});

export const getAClientAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const admin = await supabaseAdmin.from('client_admins').select('*').eq('id', id);
  res.status(admin.status).json({
    status: admin.statusText,
    data: admin.data,
  });
});

export const deleteClientAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const admin = await supabaseAdmin.from('client_admins').delete().eq('id', id);

  //What About the client_admin_assignments table?

  res.status(admin.status).json({
    status: admin.statusText,
    data: admin.data,
  });
});

export const getAUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await supabaseAdmin.from('profiles').select('*').eq('id', id);
  // const users = await supabase.auth.admin.listUsers();
  // console.log(users);
  res.status(user.status).json({
    status: user.statusText,
    data: user.data,
  });
});

export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await supabaseAdmin.from('profiles').delete().eq('id', id);
  console.log(user);
  res.status(user.status).json({
    status: user.statusText,
    data: user.data,
  });
});

export const createAdmin = catchAsync(async (req, res) => {
  const { email, first_name, last_name, password } = req.body;
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

export const createSuperAdmin = catchAsync(async (req, res) => {
  const { email } = req.body;

  const { data, error } = await supabaseAdmin.from('super_admins').insert({
    email,
  });

  if (error) return res.status(401).json({ success: false, error: error.message });

  return res.status(201).json({
    status: 'success',
    data: data,
  });
});

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

  const mailBody = assignClientToAdminEmailTemplate(data[0].first_name, client.data[0].first_name);

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

export const createVisa = catchAsync;

export const adminLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log(data, error);

  if (error) return res.status(401).json({ error: error.message });

  return res.status(200).json({
    status: 'success',
    data: { user: data.user.user_metadata, token: data.session.access_token },
  });
});

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
      const client = await supabaseAdmin.from('profiles').select('*').eq('id', clientId);
      return client.data[0];
    })
  );

  const client = clientDetails.find((client) => client.id === id);

  if (!client) return res.status(404).json({ error: 'Client not found' });

  res.status(200).json({
    status: 'success',
    data: client,
  });
});

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
