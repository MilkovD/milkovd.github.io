import { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';
import HeaderBar from './components/HeaderBar';
import MainContent from './components/MainContent';
import { wishlist } from './whishlist';

type UserInfo = {
  id: string;
  email: string | undefined;
  fullName: string | null;
  avatarUrl: string | null;
};

export default function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = useMemo(() => {
    return new URL(import.meta.env.BASE_URL, window.location.origin).toString();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      applySession(data.session);
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        applySession(session);
      });
      setLoading(false);
      return () => sub.subscription.unsubscribe();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applySession(session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) {
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

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: baseUrl }
    });
  }

  async function signOut() {
    await supabase.auth.signOut({ scope: 'local' });
  }

  if (loading) {
    return (
      <div className="center">
        <div className="card">Загрузка…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="center">
        <div className="card">
          <h1>Вход</h1>
          <button onClick={signInWithGoogle}>
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              width={18}
              height={18}
              style={{ verticalAlign: 'middle', marginRight: 8 }}
            />
            Войти через Google
          </button>
        </div>
      </div>
    );
  }

  const displayName = user.fullName ?? (user.email ? user.email.split('@')[0] : 'друг');

  return (
    <>
      <HeaderBar displayName={displayName} avatarUrl={user.avatarUrl} onSignOut={signOut} />
      <MainContent items={wishlist} />
    </>
  );
}
