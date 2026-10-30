import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HeroLive from './HeroLive.svelte';

describe('HeroLive', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts with the bus 3 minutes out and a calm Jali', () => {
    render(HeroLive);

    expect(screen.getByLabelText('Next bus in 3 minutes')).toBeInTheDocument();
    expect(screen.getByText('Calm · Nice, enjoy the ride')).toBeInTheDocument();
  });

  it('counts down and lets Jali react to the next crowd report', async () => {
    render(HeroLive);

    vi.advanceTimersByTime(4000);
    await tick();

    expect(screen.getByLabelText('Next bus in 2 minutes')).toBeInTheDocument();
    expect(screen.getByText('Busy · Got it, thanks!')).toBeInTheDocument();
  });
});
