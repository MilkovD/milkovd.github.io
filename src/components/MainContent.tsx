import { useState } from 'react';
import type { BookingsMap } from '../bookings';
import type { WishItem } from '../wishlist';

type Props = {
  title?: string;
  items: WishItem[];
  bookings: BookingsMap;
  onBook: (id: string, name: string) => Promise<{ ok?: boolean; error?: string }>;
  onCancel: (id: string) => Promise<void>;
};

function getMyBookings(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem('wl-my-bookings') || '[]')); }
  catch { return new Set(); }
}

function addMyBooking(id: string) {
  const s = getMyBookings();
  s.add(id);
  localStorage.setItem('wl-my-bookings', JSON.stringify([...s]));
}

function removeMyBooking(id: string) {
  const s = getMyBookings();
  s.delete(id);
  localStorage.setItem('wl-my-bookings', JSON.stringify([...s]));
}

export default function MainContent({ title = 'Wishlist', items, bookings, onBook, onCancel }: Props) {
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [myBookings, setMyBookings] = useState<Set<string>>(getMyBookings);

  function openForm(id: string) {
    setBookingId(id);
    setName('');
    setError('');
  }

  function closeForm() {
    setBookingId(null);
    setName('');
    setError('');
  }

  async function handleBook(id: string) {
    if (!name.trim()) { setError('Введите имя'); return; }
    setLoading(true);
    const result = await onBook(id, name.trim());
    setLoading(false);
    if (result.ok) {
      addMyBooking(id);
      setMyBookings(getMyBookings());
      closeForm();
    } else {
      setError(result.error === 'already booked' ? 'Уже забронировано' : 'Ошибка, попробуйте снова');
    }
  }

  async function handleCancel(id: string) {
    await onCancel(id);
    removeMyBooking(id);
    setMyBookings(getMyBookings());
  }

  return (
    <main className="main">
      <h1 className="mainTitle">{title}</h1>
      <ul className="items">
        {items.map((it) => {
          const booking = bookings[it.id];
          const isMine = myBookings.has(it.id);
          const isBookingThis = bookingId === it.id;

          return (
            <li key={it.id} className={`item${booking ? ' item--booked' : ''}`}>
              <div className="itemBody">
                {it.url
                  ? <a className="itemTitle" href={it.url} target="_blank" rel="noreferrer">{it.title}</a>
                  : <span className="itemTitle">{it.title}</span>}
                {it.description && <p className="itemDesc">{it.description}</p>}
              </div>

              <div className="itemSide">
                {it.price && <div className="price">{it.price} ₽</div>}

                {booking ? (
                  <div className="bookingStatus">
                    <span className="bookedBadge">забронировано ✓</span>
                    {isMine && (
                      <button className="cancelBtn" onClick={() => handleCancel(it.id)}>отменить</button>
                    )}
                  </div>
                ) : isBookingThis ? (
                  <div className="bookingForm">
                    <div className="bookingInputRow">
                      <input
                        className="nameInput"
                        placeholder="Ваше имя"
                        value={name}
                        autoFocus
                        onChange={e => { setName(e.target.value); setError(''); }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleBook(it.id);
                          if (e.key === 'Escape') closeForm();
                        }}
                      />
                      <button className="confirmBtn" onClick={() => handleBook(it.id)} disabled={loading}>
                        {loading ? '…' : 'подарю'}
                      </button>
                      <button className="cancelFormBtn" onClick={closeForm} aria-label="Отмена">✕</button>
                    </div>
                    {error && <p className="bookingError">{error}</p>}
                  </div>
                ) : (
                  <button className="bookBtn" onClick={() => openForm(it.id)}>подарю</button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
