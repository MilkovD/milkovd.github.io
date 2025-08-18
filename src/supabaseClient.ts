import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://smdelmqfkficyzohuwuq.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZGVsbXFma2ZpY3l6b2h1d3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDg4MjYsImV4cCI6MjA3MTA4NDgyNn0.85S8RxnraklQWq3Opq1OvMJR3TAU4M8my2Q60XJNnU8";

if (!supabaseUrl || !supabaseKey) {
  console.warn('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set');
}

export type UserInfo = {
  id: string;
  email: string | undefined;
  fullName: string | null;
  avatarUrl: string | null;
};

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function signOut() {
  await supabase.auth.signOut();
}

export async function signInWithGoogle(redirectUrl: string) {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl }
  });
}

export function applySession(session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'], setUser: (value: React.SetStateAction<UserInfo | null>) => void) {
  if (session?.user) {
    const md = (session.user.user_metadata || {}) as any;
    const fullName: string | null = md.full_name ?? md.name ?? md.preferred_username ?? null;
    const avatarUrl: string | null = md.avatar_url ?? md.picture ?? null;
    setUser({
      id: session.user.id,
      email: session.user.email,
      fullName,
      avatarUrl
    });
  } else {
    setUser(null);
  }
}