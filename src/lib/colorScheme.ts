export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'jalvio-theme';

const systemTheme = (prefersDark: boolean): Theme => (prefersDark ? 'dark' : 'light');

export const resolveTheme = (override: Theme | null, prefersDark: boolean): Theme => override ?? systemTheme(prefersDark);

/** Flips the visible theme; landing back on the system theme clears the override so it follows the system again. */
export function toggledOverride(override: Theme | null, prefersDark: boolean): Theme | null {
  const next: Theme = resolveTheme(override, prefersDark) === 'dark' ? 'light' : 'dark';
  return next === systemTheme(prefersDark) ? null : next;
}

export const parseOverride = (stored: string | null): Theme | null => (stored === 'light' || stored === 'dark' ? stored : null);
