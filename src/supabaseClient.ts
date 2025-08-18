import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://smdelmqfkficyzohuwuq.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZGVsbXFma2ZpY3l6b2h1d3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDg4MjYsImV4cCI6MjA3MTA4NDgyNn0.85S8RxnraklQWq3Opq1OvMJR3TAU4M8my2Q60XJNnU8";

if (!supabaseUrl || !supabaseKey) {
  console.warn('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
