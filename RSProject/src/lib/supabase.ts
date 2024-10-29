import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnczylhudqyedannsmur.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuY3p5bGh1ZHF5ZWRhbm5zbXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk4NTc2NTUsImV4cCI6MjA0NTQzMzY1NX0.85A5jKkNuOGF7gt4yG_KJIYG1FjhgYHdnLUJT5s0Lyg';

export const supabase = createClient(supabaseUrl, supabaseKey);
