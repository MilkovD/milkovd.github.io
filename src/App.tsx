import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import './styles.css';

type UserInfo = {
  id: string;
  email: string | undefined;
  fullName: string | null;
  avatarUrl: string | null;
};

export default function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const baseUrl = useMemo(() => {
    // Важно для GitHub Pages (user/org pages)
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
          // Используем тот же вызов, что уже "заработал" у тебя
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
        applySession(data.session);
        // 3) Подпишемся на изменения
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
          applySession(session);
        });
        setLoading(false);
        return () => sub.subscription.unsubscribe();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applySession(session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) {
    if (session?.user) {
      const md = (session.user.user_metadata || {}) as any;
      const fullName: string | null =
        md.full_name ?? md.name ?? md.preferred_username ?? null;

      // Пытаемся достать ссылку на аватар (Google обычно кладёт picture/avatar_url)
      const avatarUrl: string | null =
        md.avatar_url ?? md.picture ?? null;

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
    await supabase.auth.signOut();
    setMenuOpen(false);
  }

  // Закрытие меню по клику вне и по Esc
  const avatarBtnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuOpen) return;
      const t = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(t) &&
        avatarBtnRef.current &&
        !avatarBtnRef.current.contains(t)
      ) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

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

  const wishlist = [
    'PlayStation 5',
    'Телевизор',
    'Наушники',
    'Электросамокат'
  ];

  const initial = (displayName || '🙂').trim().charAt(0).toUpperCase();

  return (
    <>
      {/* Верхняя панель с аватаркой */}
      <div className="header">
        <button
          ref={avatarBtnRef}
          className="avatarButton"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          title={displayName}
        >
          {user.avatarUrl ? (
            <img className="avatarImg" src={user.avatarUrl} alt={displayName} />
          ) : (
            <span className="avatarFallback" aria-hidden="true">{initial}</span>
          )}
        </button>

        {menuOpen && (
          <div ref={menuRef} className="menu" role="menu">
            <button className="menuItem" role="menuitem" onClick={signOut}>
              Выйти
            </button>
          </div>
        )}
      </div>

      {/* Центрированный контент */}
      <div className="center">
        <div className="card" style={{ minWidth: 320, width: 480, maxWidth: '90vw' }}>
          <h1 className="title">Whishlist</h1>
          <ul className="list">
            {wishlist.map((name) => (
              <li key={name} className="itemRow">
                <span className="itemName">{name}</span>
                <button className="giftBtn" onClick={() => { /* действие добавим позже */ }}>
                  подарю
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
