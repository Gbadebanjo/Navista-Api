import { supabase } from '../../../config/supabase.config';
import catchAsync from '../../../interface/catchAsync';

export const getAllUsers = catchAsync(async (req, res) => {
  const users = await supabase.from('profiles').select('*');
  res.status(users.status).json({
    status: users.statusText,
    data: users.data,
  });
});

export const getAUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await supabase.from('profiles').select('*').eq('id', id);
  res.status(user.status).json({
    status: user.statusText,
    data: user.data,
  });
});

export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await supabase.from('profiles').delete().eq('id', id);
  res.status(user.status).json({
    status: user.statusText,
    data: user.data,
  });
});
