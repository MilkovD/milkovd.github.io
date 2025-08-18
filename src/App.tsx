import { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';
import './styles.css';

type UserInfo = {
  id: string;
  email: string | undefined;
  fullName: string | null;
};

export default function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const baseUrl = useMemo(() => {
    // Важно для GitHub Pages project pages
    return new URL(import.meta.env.BASE_URL, window.location.origin).toString();
  }, []);

  // 1) После возврата с Google: обменять ?code= на сессию
  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const errorDesc = url.searchParams.get('error_description');
        if (errorDesc) {
          console.error('OAuth error:', errorDesc);
        }
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          // подчистим URL
          url.searchParams.delete('code');
          url.searchParams.delete('state');
          url.searchParams.delete('error');
          url.searchParams.delete('error_description');
          window.history.replaceState({}, '', url.toString());
        }
      } finally {
        // 2) Получить текущую сессию
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (session?.user) {
          const metadata = session.user.user_metadata as any;
          const fullName: string | null =
            metadata?.full_name ?? metadata?.name ?? metadata?.preferred_username ?? null;
          setUser({
            id: session.user.id,
            email: session.user.email,
            fullName
          });
        } else {
          setUser(null);
        }
        // 3) Подпишемся на изменения
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
          if (session?.user) {
            const metadata = session.user.user_metadata as any;
            const fullName: string | null =
              metadata?.full_name ?? metadata?.name ?? metadata?.preferred_username ?? null;
            setUser({
              id: session.user.id,
              email: session.user.email,
              fullName
            });
          } else {
            setUser(null);
          }
        });
        setLoading(false);
        return () => sub.subscription.unsubscribe();
      }
    })();
  }, []);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: baseUrl // вернемся на стартовую страницу с правильной base
      }
    });
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
          <button onClick={signInWithGoogle}>Войти через Google</button>
        </div>
      </div>
    );
  }

  const displayName =
    user.fullName ?? (user.email ? user.email.split('@')[0] : 'друг');

  return (
    <div className="center">
      <div className="card">
        <h1>Привет&nbsp;{displayName}</h1>
        {/* При необходимости можно добавить кнопку выхода:
        <div style={{textAlign:'center', marginTop:12}}>
          <button onClick={() => supabase.auth.signOut()}>Выйти</button>
        </div> */}
      </div>
    </div>
  );
}
