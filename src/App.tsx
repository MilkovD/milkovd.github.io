import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './supabaseClient';

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
                await applySession(data.session);
                // 3) Подпишемся на изменения
                const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
                    await applySession(session);
                });
                setLoading(false);
                return () => sub.subscription.unsubscribe();
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function applySession(session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) {
        if (session?.user) {

            const allowed = await ensureAccess(session.user.id);
            if (!allowed) {
                alert('Доступ только по приглашению. Проверь ссылку с invite-кодом.');
                await supabase.auth.signOut();
                return;
            }

            const metadata = (session.user.user_metadata || {}) as any;
            const fullName: string | null =
                metadata.full_name ?? metadata.name ?? metadata.preferred_username ?? null;

            // Пытаемся достать ссылку на аватар (Google обычно кладёт picture/avatar_url)
            const avatarUrl: string | null =
                metadata.avatar_url ?? metadata.picture ?? null;

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

    function getInviteFromUrl() {
        return new URL(window.location.href).searchParams.get('invite');
    }

    async function signInWithGoogle() {
        const invite = getInviteFromUrl();
        const redirect = invite
            ? `${baseUrl}?invite=${encodeURIComponent(invite)}`
            : baseUrl;

        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: redirect }
        });
    }

    async function signOut() {
        await supabase.auth.signOut();
        setMenuOpen(false);
    }

    async function ensureAccess(userId: string): Promise<boolean> {
        // Уже в allowlist?
        const { data: row } = await supabase
            .from('allowed_users')
            .select('user_id')
            .eq('user_id', userId)
            .maybeSingle();
        if (row) return true;

        console.log('Пользователь не в allowlist, проверяем invite', userId);

        // Пробуем заявить инвайт из URL
        const invite = getInviteFromUrl();
        console.log('invite from URL:', invite);
        if (!invite) return false;

        const { data: ok, error } = await supabase.rpc('claim_invite', { p_code: invite });
        if (error) {
            console.error('claim_invite error', error);
            return false;
        }
        return ok === true;
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
