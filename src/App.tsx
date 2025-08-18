import { useEffect, useMemo, useState } from 'react';
import { supabase, signOut, signInWithGoogle, UserInfo, applySession } from './supabaseClient';
import HeaderBar from './components/HeaderBar';
import MainContent from './components/MainContent';
import { wishlist } from './wishlist';
import Login from './components/Login';
import Loader from './components/Loader';

export default function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = useMemo(() => {
    return new URL(import.meta.env.BASE_URL, window.location.origin).toString();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      applySession(data.session, setUser);
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        applySession(session, setUser);
      });
      setLoading(false);
      return () => sub.subscription.unsubscribe();
    })();
  }, []);

  if (loading) {
    return <Loader/>;
  }

  if (!user) {
    return <Login signInWithGoogle={() => signInWithGoogle(baseUrl)}/>;
  }

  const displayName = user.fullName ?? (user.email ? user.email.split('@')[0] : 'друг');

  return (
    <>
      <HeaderBar displayName={displayName} avatarUrl={user.avatarUrl} onSignOut={signOut} />
      <MainContent items={wishlist} />
    </>
  );
}
