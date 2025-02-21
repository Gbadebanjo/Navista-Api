import { supabaseAdmin } from '../config/supabase.config';

export async function uploadFile(file: string, file_path: string, bucket_name: string) {
  const { data, error } = await supabaseAdmin.storage.from(bucket_name).upload(file_path, file);
  if (error) {
    // Handle error

    throw new Error(error.message);
  } else {
    // Handle success
    return data;
  }
}
