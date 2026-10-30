// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import worker from './index';

function environment() {
  const assets = vi.fn(async () => new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html' } }));
  const env = { ASSETS: { fetch: assets }, DB: {} } as unknown as Env;
  return { env, assets };
}

describe('worker', () => {
  it('serves the static site for page requests', async () => {
    const { env, assets } = environment();

    const response = await worker.fetch(new Request('https://jalvio.test/'), env);

    expect(assets).toHaveBeenCalledOnce();
    expect(await response.text()).toBe('<!doctype html>');
  });

  it('routes the waitlist API to the signup handler', async () => {
    const { env, assets } = environment();

    const response = await worker.fetch(new Request('https://jalvio.test/api/waitlist'), env);

    expect(response.status).toBe(405);
    expect(assets).not.toHaveBeenCalled();
  });

  it('answers unknown API paths with a JSON 404', async () => {
    const { env } = environment();

    const response = await worker.fetch(new Request('https://jalvio.test/api/nope'), env);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });
});
