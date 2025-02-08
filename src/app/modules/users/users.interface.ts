// User interface
// export type IUser = {
//   _id: string;
//   name: string;
//   email: string;
//   role: 'user';
//   password: string;
//   passwordConfirm: string | undefined;
//   passwordChangedAt?: Date;
// };

export type ILoginUser = {
  email: string;
  password: string;
};

// Response after user login
export type ILoginUserResponse = {
  email: string;
  accessToken: string;
  refreshToken?: string;
};

// Response after refreshing access token
export type IRefreshTokenResponse = {
  accessToken: string;
};

export type IUser = {
  id: string; // UUID from Supabase Auth
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;

  created_at?: Date;
};

export type IEligibilityAssessMent = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  nationality: string;
  current_location: string;
  education_level: string;
  created_at: Date;
  updated_at: Date;
};
