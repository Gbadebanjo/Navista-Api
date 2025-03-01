import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { supabase, supabaseAdmin } from '../../../config/supabase.config';

const authorize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get authorization token from the request header
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      console.log('No authorization header');
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'You are not authorized',
      });
    }

    const token = authorizationHeader.replace('Bearer ', '');

    try {
      // Verify the token
      const getUser = await supabase.auth.getUser(token);
      if (getUser.error) {
        // console.log('You are not authorized, error', getUser.error);
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: getUser.error.message,
          errors: getUser.error,
        });
      }

      // console.log('getUser', getUser.data.user);

      const profileCheck = await supabaseAdmin.from('profiles').select('*').eq('id', getUser.data.user.id).single();

      console.log('profileCheck', profileCheck);

      if (!profileCheck.data) {
        // await supabaseAdmin.from('profiles').insert({
        //   id: getUser.data.user.id,
        //   email: getUser.data.user.email,
        // });
        // await supabaseAdmin
        //   .from('profiles')
        //   .update({
        //     email: getUser.data.user.email,
        //   })
        //   .eq('id', getUser.data.user.id);
      }

      const { data, error } = await supabaseAdmin
        .from('client_assessments')
        .select('*')
        .eq('email', getUser.data.user.email)
        .single();

      if (error) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'You have not taken the assessment, please take the assessment to continue',
        });
      }

      if (!data) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'You have not taken the assessment, please take the assessment to continue',
        });
      }

      req.body.user = getUser.data.user;
      next();
    } catch (error) {
      console.log('You are not authorized, catch 1', error);
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'You are not authorized',
      });
    }
  } catch (error) {
    console.log('You are not authorized, catch', error);
    next(error);
  }
};

export default authorize;
