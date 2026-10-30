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

  it('posts the trimmed email as JSON to the site’s waitlist API', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    await submitWaitlist('  rider@example.com ');

    expect(fetchMock).toHaveBeenCalledWith('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rider@example.com' }),
    });
  });

  it('rejects when the API answers with an error status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(submitWaitlist('rider@example.com')).rejects.toThrow('500');
  });
});
