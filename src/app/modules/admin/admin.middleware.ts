import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../../error/ApiError';
// import { jwtHelper } from '../../common/jwtHelper';
import { supabase, supabaseAdmin } from '../../../config/supabase.config';

const authorize =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
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
          return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            message: getUser.error.message,
          });
        }

        console.log(getUser);

        const { data, error } = await supabaseAdmin
          .from('client_admins')
          .select('*')
          .eq('email', getUser.data.user.email);

        console.log(data);

        if (error) {
          return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            message: error.message,
          });
        }

        // Check if required roles are specified and verify user's role
        if (requiredRoles.length && !requiredRoles.includes(data[0].role)) {
          console.log('Insufficient permissions');
          return res.status(httpStatus.FORBIDDEN).json({
            success: false,
            message: 'Insufficient permissions',
          });
        }

        if (data[0].role !== 'client_admin') {
          console.log('You are not authorized');
          return res.status(httpStatus.FORBIDDEN).json({
            success: false,
            message: 'You are not authorized',
          });
        }

        // console.log(decodedUser);
        req.body.user = data[0];
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
