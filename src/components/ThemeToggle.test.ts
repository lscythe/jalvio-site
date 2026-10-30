import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY } from '../lib/colorScheme';
import ThemeToggle from './ThemeToggle.svelte';

function systemPrefersDark(prefersDark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: prefersDark,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

describe('ThemeToggle', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('offers the opposite of the system theme', async () => {
    systemPrefersDark(true);
    render(ThemeToggle);

    expect(await screen.findByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });

  it('overrides the system theme and remembers the choice', async () => {
    systemPrefersDark(false);
    const user = userEvent.setup();
    render(ThemeToggle);

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });

  it('goes back to following the system when switched back', async () => {
    systemPrefersDark(false);
    const user = userEvent.setup();
    render(ThemeToggle);

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));

    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('starts from a remembered override', async () => {
    systemPrefersDark(false);
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    render(ThemeToggle);

    expect(await screen.findByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });
});
