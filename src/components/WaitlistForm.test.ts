import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WaitlistForm from './WaitlistForm.svelte';

describe('WaitlistForm', () => {
  afterEach(() => vi.unstubAllGlobals());

  const emailField = () => screen.getByLabelText('Your email');
  const joinButton = () => screen.getByRole('button', { name: 'Join the waitlist' });

  it('promises a single email before signup', () => {
    render(WaitlistForm);

    expect(screen.getByText('Free. One email when your invite is ready.')).toBeInTheDocument();
  });

  it('asks for a fixed email instead of submitting an invalid one', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(WaitlistForm);

    await user.type(emailField(), 'rider@nowhere');
    await user.click(joinButton());

    expect(screen.getByText('That email doesn’t look right. Check it and try again.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('clears the error once the rider edits the email', async () => {
    const user = userEvent.setup();
    render(WaitlistForm);

    await user.click(joinButton());
    await user.type(emailField(), 'r');

    expect(screen.getByText('Free. One email when your invite is ready.')).toBeInTheDocument();
  });

  it('thanks the rider with Jali after a successful signup', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 201 })));
    const user = userEvent.setup();
    render(WaitlistForm);

    await user.type(emailField(), ' rider@example.com ');
    await user.keyboard('{Enter}');

    expect(await screen.findByText("Thanks! We'll email rider@example.com when early access opens.")).toBeInTheDocument();
    expect(screen.queryByLabelText('Your email')).not.toBeInTheDocument();
  });

  it('keeps the form and explains when the signup fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    const user = userEvent.setup();
    render(WaitlistForm);

    await user.type(emailField(), 'rider@example.com');
    await user.click(joinButton());

    expect(await screen.findByText('We couldn’t add you just now. Try again in a moment.')).toBeInTheDocument();
    expect(emailField()).toHaveValue('rider@example.com');
  });
});
