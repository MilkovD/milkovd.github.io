import { useEffect, useRef, useState } from 'react';

type Props = {
  displayName: string;
  avatarUrl: string | null;
  onSignOut: () => Promise<void>;
};

export default function HeaderBar({ displayName, avatarUrl, onSignOut }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuOpen) return;
      const t = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(t) &&
        btnRef.current && !btnRef.current.contains(t)
      ) setMenuOpen(false);
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

  const initial = (displayName || '🙂').trim().charAt(0).toUpperCase();

  return (
    <div className="header">
      <button
        ref={btnRef}
        className="avatarButton"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(v => !v)}
        title={displayName}
      >
        {avatarUrl ? (
          <img className="avatarImg" src={avatarUrl} alt={displayName} />
        ) : (
          <span className="avatarFallback" aria-hidden="true">{initial}</span>
        )}
      </button>

      {menuOpen && (
        <div ref={menuRef} className="menu" role="menu">
          <button className="menuItem" role="menuitem" onClick={onSignOut}>
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
