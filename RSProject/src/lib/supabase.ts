import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'Your_supabase_Url';
const supabaseKey =
  'Your_supabase_anon_key';

export const supabase = createClient(supabaseUrl, supabaseKey);
