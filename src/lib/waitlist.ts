const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const isValidEmail = (email: string) => EMAIL_PATTERN.test(email.trim());

/** Served by the Worker in worker/index.ts. */
export const WAITLIST_ENDPOINT = '/api/waitlist';

export async function submitWaitlist(email: string): Promise<void> {
  const response = await fetch(WAITLIST_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });
  if (!response.ok) throw new Error(`Waitlist signup failed with status ${response.status}`);
}
