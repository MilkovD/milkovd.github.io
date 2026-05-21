const API = (import.meta.env.VITE_BOOKINGS_API as string) || '';

export type Booking = { name: string; bookedAt: string };
export type BookingsMap = Record<string, Booking>;

export async function fetchBookings(): Promise<BookingsMap> {
  if (!API) return {};
  try {
    const res = await fetch(`${API}/bookings`);
    return res.ok ? res.json() : {};
  } catch {
    return {};
  }
}

export async function bookItem(id: string, name: string): Promise<{ ok?: boolean; error?: string }> {
  if (!API) return { error: 'api not configured' };
  try {
    const res = await fetch(`${API}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name }),
    });
    return res.json();
  } catch {
    return { error: 'network error' };
  }
}

export async function cancelBooking(id: string): Promise<void> {
  if (!API) return;
  await fetch(`${API}/bookings/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
}
