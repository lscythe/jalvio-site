import { afterEach, describe, expect, it, vi } from 'vitest';
import { isValidEmail, submitWaitlist } from './waitlist';

describe('isValidEmail', () => {
  it.each(['rider@example.com', '  rider@example.co.id  '])('accepts %j', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each(['', 'rider', 'rider@example', 'ri der@example.com', '@example.com'])('rejects %j', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

describe('submitWaitlist', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('posts the trimmed email as JSON to the endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await submitWaitlist('  rider@example.com ', '/api/waitlist');

    expect(fetchMock).toHaveBeenCalledWith('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rider@example.com' }),
    });
  });

  it('rejects when the endpoint answers with an error status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(submitWaitlist('rider@example.com', '/api/waitlist')).rejects.toThrow('500');
  });

  it('resolves without a request when no endpoint is configured', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitWaitlist('rider@example.com', undefined)).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
