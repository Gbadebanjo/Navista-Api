import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../interface/catchAsync';
// import ApiError from '../../../error/ApiError';
import config from '../../../config';

import { ILoginUserResponse } from '../interfaces/users';
// import httpStatus from 'http-status';
import sendResponse from '../../../common/sendResponse';
import { jwtHelper } from '../../../common/jwtHelper';
import { supabase } from '../../../config/supabase.config';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const register: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  try {
    // const user =
    // if (!user) {
    //   throw new ApiError(400, 'Failed to register');
    // }
    // sendResponse<IUser>(res, {
    //   statusCode: httpStatus.OK,
    //   success: true,
    //   message: 'user created successfully!',
    //   data: user,
    // });
  } catch (error) {
    res.status(500).json({
      status: 'user register failed!',
      message: error,
    });
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // const isUserExist = await User.isUserExist(email);

  // if (!email || !password) {
  //   throw new ApiError(httpStatus.NOT_IMPLEMENTED, 'Please provide an email and password');
  // }

  // if (!isUserExist) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  // }

  // if (isUserExist.password && !(await User.isPasswordMatched(password, isUserExist.password))) {
  //   throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  // }

  //create access token & refresh token
  const { _id: userId, role } = { _id: '123', role: 'user' };

  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  //Create a JWT for the newly created user
  const accessToken = jwtHelper.createToken({ id: userId, role: role });

  // Save the refreshToken to the user in the database if needed
  const refreshToken = jwtHelper.generateRefreshToken({ userId, role });

  res.cookie('token', refreshToken, cookieOptions);
  res.header('Authorization', `Bearer ${accessToken}`);

  sendResponse<ILoginUserResponse>(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully !',
    // data: {
    //   email,
    //   accessToken,
    //   refreshToken,
    // },
  });
});

const allUsers = catchAsync(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('profiles').select();
  if (error) return res.status(401).json({ error: error.message });

  res.status(200).json(data);
});

export const UserController = {
  register,
  login,
  allUsers,
};
