import { supabase } from '../config/supabase.config';

export async function uploadFile(file: File, file_path: string, bucket_name: string) {
  const { data, error } = await supabase.storage.from(bucket_name).upload(file_path, file);
  if (error) {
    // Handle error

    throw new Error(error.message);
  } else {
    // Handle success
    return data;
  }
}
