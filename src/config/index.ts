import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5001,
  bycrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    secret: process.env.JWT_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  supabase: {
    url: process.env.SUPERBASE_DATABASE_URL,
    key: process.env.SUPERBASE_DATABASE_KEY,
    admin_key: process.env.SUPERBASE_SERVICE_ROLE_KEY,
    supa_admin_email: process.env.SUPER_ADMIN_EMAIL,
    bucket_name: process.env.SUPERBASE_BUCKET_NAME,
    document_expiry: process.env.SUPABASE_DOC_SIGNED_URL_EXPIRY,
  },
  mail: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.FROM_NAME,
  },
};
