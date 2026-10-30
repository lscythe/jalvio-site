import { render, screen, within } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import BusPhone from './BusPhone.svelte';

describe('BusPhone', () => {
  it('leads with the next bus and lists the later ones', () => {
    render(BusPhone);

    expect(screen.getByText('Next bus · live')).toBeInTheDocument();
    const later = screen.getByRole('list', { name: 'Later buses' });
    expect(within(later).getAllByRole('button')).toHaveLength(2);
  });

  it('switches the countdown to a later bus when it is picked', async () => {
    const user = userEvent.setup();
    render(BusPhone);

    await user.click(screen.getByRole('button', { name: /3 stops away · 9:50/ }));

    expect(screen.getByText('Selected bus · live')).toBeInTheDocument();
    expect(screen.getByText('B 7066 TGA')).toBeInTheDocument();
  });

  it('turns on an arrival alert and confirms it with a toast', async () => {
    const user = userEvent.setup();
    render(BusPhone);

    await user.click(screen.getByRole('button', { name: 'Notify me when near' }));

    expect(screen.getByRole('button', { name: 'Notifying 2 min before' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent("We'll tell you when the 9:43 bus is 2 min away");

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText("We'll tell you when the 9:43 bus is 2 min away")).not.toBeInTheDocument();
  });
});
