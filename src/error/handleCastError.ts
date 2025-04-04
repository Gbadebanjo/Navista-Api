import { IGenericErrorMessage } from '../interface/error';

const handleCastError = (error) => {
  const errors: IGenericErrorMessage[] = [
    {
      path: error.path,
      message: 'Invalid Id',
    },
  ];

  const statusCode = 400;
  return {
    statusCode,
    message: 'Cast Error',
    errorMessage: errors,
  };
};

export default handleCastError;
