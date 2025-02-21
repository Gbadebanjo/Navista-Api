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
