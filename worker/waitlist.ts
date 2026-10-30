import { isValidEmail } from '../src/lib/waitlist';

const MAX_BODY_BYTES = 1024;

export interface WaitlistStore {
  add(email: string): Promise<'added' | 'existing'>;
}

export const d1WaitlistStore = (db: D1Database): WaitlistStore => ({
  async add(email) {
    const result = await db.prepare('INSERT INTO waitlist (email) VALUES (?) ON CONFLICT (email) DO NOTHING').bind(email).run();
    return result.meta.changes > 0 ? 'added' : 'existing';
  },
});

const json = (status: number, body: object, headers: HeadersInit = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

function emailFrom(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return null;
  const { email } = payload as { email?: unknown };
  return typeof email === 'string' ? email : null;
}

export async function handleWaitlistSignup(request: Request, store: WaitlistStore): Promise<Response> {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' }, { Allow: 'POST' });

  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) return json(415, { error: 'unsupported_media_type' });

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) return json(413, { error: 'payload_too_large' });

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const email = emailFrom(payload);
  if (email === null) return json(400, { error: 'missing_email' });
  if (!isValidEmail(email)) return json(400, { error: 'invalid_email' });

  // A repeat signup still succeeds, so the form never tells anyone whether an address is already listed.
  const outcome = await store.add(email.trim().toLowerCase());
  return outcome === 'added' ? json(201, { status: 'joined' }) : json(200, { status: 'joined' });
}
