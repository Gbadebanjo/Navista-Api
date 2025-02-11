import { createClient } from '@supabase/supabase-js';
import config from './index';

export const supabase = createClient(config.supabase.url, config.supabase.key);

// export const supabaseAdmin = createClient(config.supabase.url, config.supabase.admin_key);
