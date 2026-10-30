import { describe, expect, it } from 'vitest';
import { parseOverride, resolveTheme, toggledOverride } from './colorScheme';

describe('resolveTheme', () => {
  it('follows the system when there is no override', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });

  it('lets an override win over the system', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('toggledOverride', () => {
  it('overrides the system with the opposite theme', () => {
    expect(toggledOverride(null, false)).toBe('dark');
    expect(toggledOverride(null, true)).toBe('light');
  });

  it('returns to following the system when toggling back to its theme', () => {
    expect(toggledOverride('dark', false)).toBeNull();
    expect(toggledOverride('light', true)).toBeNull();
  });
});

describe('parseOverride', () => {
  it('accepts only known themes from storage', () => {
    expect(parseOverride('dark')).toBe('dark');
    expect(parseOverride('light')).toBe('light');
    expect(parseOverride('sepia')).toBeNull();
    expect(parseOverride(null)).toBeNull();
  });
});
