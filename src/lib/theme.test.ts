import { describe, expect, it } from 'vitest';
import { buildScheme, hexToHueChroma, JALVIO_PALETTE, lightDarkCss, tone } from './theme';

describe('hexToHueChroma', () => {
  it('converts brand hex colors to oklch hue and chroma', () => {
    expect(hexToHueChroma('#4977C2')).toEqual([259.7, 0.127]);
    expect(hexToHueChroma('#07885B')).toEqual([161.1, 0.122]);
  });
});

describe('tone', () => {
  it('sets lightness from the tone and tapers chroma away from mid tones', () => {
    expect(tone([295, 0.16], 40)).toBe('oklch(40.0% 0.130 295)');
    expect(tone([259.7, 0.127], 100)).toBe('oklch(100.0% 0.056 259.7)');
  });

  it('tapers chroma the most at the darkest tone', () => {
    expect(tone([100, 0.2], 0)).toBe('oklch(0.0% 0.063 100)');
  });
});

describe('buildScheme', () => {
  const light = buildScheme(JALVIO_PALETTE, 'light');
  const dark = buildScheme(JALVIO_PALETTE, 'dark');

  it('derives the light Material roles from the Jalvio palette', () => {
    expect(light['--primary']).toBe('oklch(40.0% 0.103 259.7)');
    expect(light['--tertiary-container']).toBe('oklch(90.0% 0.069 161.1)');
    expect(light['--surface']).toBe('oklch(98.0% 0.018 266.7)');
  });

  it('flips to light accents on dark surfaces for the dark roles', () => {
    expect(dark['--primary']).toBe('oklch(80.0% 0.087 259.7)');
    expect(dark['--primary-container']).toBe('oklch(30.0% 0.087 259.7)');
    expect(dark['--on-surface']).toBe('oklch(90.0% 0.021 266.7)');
  });

  it('paints the hero and closing banner with strong colors in light and muted containers in dark', () => {
    expect(light['--hero']).toBe(light['--primary']);
    expect(light['--on-hero']).toBe(light['--on-primary']);
    expect(dark['--hero']).toBe(dark['--primary-container']);
    expect(dark['--on-hero']).toBe(dark['--on-primary-container']);
    expect(light['--cta']).toBe(light['--tertiary']);
    expect(dark['--cta']).toBe(dark['--tertiary-container']);
  });

  it('keeps accent buttons and Jali visible against the dark hero', () => {
    expect(light['--accent']).toBe(light['--tertiary-container']);
    expect(dark['--accent']).toBe(dark['--tertiary']);
    expect(light['--jali-soft']).toBe(light['--primary-container']);
    expect(dark['--jali-soft']).toBe(dark['--primary']);
  });

  it('layers the page below cards and cards below their inset rows', () => {
    expect([light['--page'], light['--card'], light['--card-inset']]).toEqual([
      light['--surface-container'],
      light['--surface'],
      light['--surface-container'],
    ]);
    expect([dark['--page'], dark['--card'], dark['--card-inset']]).toEqual([
      dark['--surface'],
      dark['--surface-container'],
      dark['--surface-container-highest'],
    ]);
  });

  it('gives the dark hero a deep blue email field instead of near black', () => {
    expect(light['--hero-field']).toBe(light['--on-primary']);
    expect(dark['--hero-field']).toBe('oklch(18.0% 0.068 259.7)');
  });

  it('sets the Jali section a step below its tertiary cards in dark mode so the calm card keeps its edge', () => {
    expect(light['--spotlight']).toBe(light['--tertiary-container']);
    expect(dark['--spotlight']).toBe('oklch(18.0% 0.066 161.1)');
  });

  it('defines the same tokens in both modes', () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
  });

  it('includes every role the page styles use', () => {
    for (const role of ['primary', 'secondary', 'tertiary', 'error']) {
      expect(light).toHaveProperty(`--${role}`);
      expect(light).toHaveProperty(`--on-${role}`);
      expect(light).toHaveProperty(`--${role}-container`);
      expect(light).toHaveProperty(`--on-${role}-container`);
    }
    for (const key of [
      '--p30',
      '--p80',
      '--t70',
      '--surface-container',
      '--surface-container-highest',
      '--on-surface',
      '--on-surface-variant',
      '--outline',
      '--outline-variant',
      '--hero-field',
    ]) {
      expect(light).toHaveProperty(key);
    }
  });
});

describe('lightDarkCss', () => {
  it('pairs each token with its dark value', () => {
    expect(lightDarkCss({ '--a': 'red', '--b': 'blue' }, { '--a': 'pink', '--b': 'navy' })).toBe(
      '--a:light-dark(red,pink);--b:light-dark(blue,navy);',
    );
  });
});
