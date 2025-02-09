import { IGenericErrorResponse } from '../interface/common';
import { IGenericErrorMessage } from '../interface/error';

const handleValidationError = (error): IGenericErrorResponse => {
  const statusCode = 400;

  return {
    statusCode,
    message: 'Validation Error',
    errorMessage: error,
  };
};

export default handleValidationError;
