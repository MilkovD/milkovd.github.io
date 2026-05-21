const ALLOWED_ORIGIN = 'https://milkovd.github.io';

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = origin === ALLOWED_ORIGIN || /^http:\/\/localhost(:\d+)?$/.test(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = corsHeaders(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // GET /bookings — all bookings
    if (request.method === 'GET' && url.pathname === '/bookings') {
      const { keys } = await env.BOOKINGS.list();
      const bookings = {};
      await Promise.all(keys.map(async ({ name }) => {
        const val = await env.BOOKINGS.get(name);
        if (val) bookings[name] = JSON.parse(val);
      }));
      return Response.json(bookings, { headers });
    }

    // POST /bookings — { id, name }
    if (request.method === 'POST' && url.pathname === '/bookings') {
      let body;
      try { body = await request.json(); }
      catch { return Response.json({ error: 'invalid json' }, { status: 400, headers }); }

      const { id, name } = body;
      if (!id || !name?.trim()) {
        return Response.json({ error: 'id and name required' }, { status: 400, headers });
      }
      const existing = await env.BOOKINGS.get(id);
      if (existing) {
        return Response.json({ error: 'already booked' }, { status: 409, headers });
      }
      await env.BOOKINGS.put(id, JSON.stringify({ name: name.trim(), bookedAt: new Date().toISOString() }));
      return Response.json({ ok: true }, { headers });
    }

    // DELETE /bookings/:id — cancel
    if (request.method === 'DELETE' && url.pathname.startsWith('/bookings/')) {
      const id = decodeURIComponent(url.pathname.slice('/bookings/'.length));
      await env.BOOKINGS.delete(id);
      return Response.json({ ok: true }, { headers });
    }

    return new Response('Not found', { status: 404, headers });
  },
};
