import { useEffect, useState } from 'react';
import MainContent from './components/MainContent';
import { wishlist } from './wishlist';
import { fetchBookings, bookItem, cancelBooking, type BookingsMap } from './bookings';

export default function App() {
  const [bookings, setBookings] = useState<BookingsMap>({});

  useEffect(() => {
    fetchBookings().then(setBookings);
  }, []);

  async function handleBook(id: string, name: string) {
    const result = await bookItem(id, name);
    if (result.ok) {
      setBookings(prev => ({ ...prev, [id]: { name, bookedAt: new Date().toISOString() } }));
    }
    return result;
  }

  async function handleCancel(id: string) {
    await cancelBooking(id);
    setBookings(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  return <MainContent items={wishlist} bookings={bookings} onBook={handleBook} onCancel={handleCancel} />;
}
