// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { d1WaitlistStore, handleWaitlistSignup, type WaitlistStore } from './waitlist';

function memoryStore(existing: string[] = []): WaitlistStore & { emails: Set<string> } {
  const emails = new Set(existing);
  return {
    emails,
    async add(email) {
      if (emails.has(email)) return 'existing';
      emails.add(email);
      return 'added';
    },
  };
}

const signup = (body: string, init: RequestInit = {}) =>
  new Request('https://jalvio.test/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    ...init,
  });

describe('handleWaitlistSignup', () => {
  it('stores a new email, normalized, and answers 201', async () => {
    const store = memoryStore();

    const response = await handleWaitlistSignup(signup(JSON.stringify({ email: '  Rider@Example.com ' })), store);

    expect(response.status).toBe(201);
    expect([...store.emails]).toEqual(['rider@example.com']);
  });

  it('treats a repeat signup as success without storing it twice', async () => {
    const store = memoryStore(['rider@example.com']);

    const response = await handleWaitlistSignup(signup(JSON.stringify({ email: 'rider@example.com' })), store);

    expect(response.status).toBe(200);
    expect(store.emails.size).toBe(1);
  });

  it('rejects an invalid email', async () => {
    const store = memoryStore();

    const response = await handleWaitlistSignup(signup(JSON.stringify({ email: 'rider@nowhere' })), store);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'invalid_email' });
    expect(store.emails.size).toBe(0);
  });

  it.each([['not json'], [JSON.stringify(['rider@example.com'])], [JSON.stringify({ email: 42 })]])(
    'rejects the malformed body %s',
    async (body) => {
      const response = await handleWaitlistSignup(signup(body), memoryStore());

      expect(response.status).toBe(400);
    },
  );

  it('only accepts JSON', async () => {
    const response = await handleWaitlistSignup(
      signup('email=rider@example.com', { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }),
      memoryStore(),
    );

    expect(response.status).toBe(415);
  });

  it('refuses oversized bodies', async () => {
    const response = await handleWaitlistSignup(signup(JSON.stringify({ email: `${'a'.repeat(2000)}@example.com` })), memoryStore());

    expect(response.status).toBe(413);
  });

  it('only allows POST', async () => {
    const response = await handleWaitlistSignup(new Request('https://jalvio.test/api/waitlist'), memoryStore());

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
  });
});

describe('d1WaitlistStore', () => {
  function fakeD1(changes: number) {
    const run = vi.fn().mockResolvedValue({ meta: { changes } });
    const bind = vi.fn(() => ({ run }));
    const prepare = vi.fn(() => ({ bind }));
    return { db: { prepare } as unknown as D1Database, prepare, bind };
  }

  it('inserts the email and reports a new row as added', async () => {
    const { db, prepare, bind } = fakeD1(1);

    await expect(d1WaitlistStore(db).add('rider@example.com')).resolves.toBe('added');
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining('ON CONFLICT (email) DO NOTHING'));
    expect(bind).toHaveBeenCalledWith('rider@example.com');
  });

  it('reports an email that was already there as existing', async () => {
    const { db } = fakeD1(0);

    await expect(d1WaitlistStore(db).add('rider@example.com')).resolves.toBe('existing');
  });
});
