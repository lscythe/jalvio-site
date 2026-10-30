const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const isValidEmail = (email: string) => EMAIL_PATTERN.test(email.trim());

// Without an endpoint (local development) the form behaves as if the signup succeeded.
export async function submitWaitlist(email: string, endpoint: string | undefined): Promise<void> {
  if (!endpoint) return;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });
  if (!response.ok) throw new Error(`Waitlist signup failed with status ${response.status}`);
}
