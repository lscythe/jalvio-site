import { d1WaitlistStore, handleWaitlistSignup } from './waitlist';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/waitlist') return handleWaitlistSignup(request, d1WaitlistStore(env.DB));
    if (pathname.startsWith('/api/')) return Response.json({ error: 'not_found' }, { status: 404 });

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
