export type HueChroma = readonly [hue: number, chroma: number];

export interface Palette {
  primary: HueChroma;
  secondary: HueChroma;
  tertiary: HueChroma;
  error: HueChroma;
  neutral: HueChroma;
  neutralVariant: HueChroma;
}

export type Scheme = Record<`--${string}`, string>;

const srgbToLinear = (channel: number) => {
  const v = channel / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

export function hexToHueChroma(hex: string): HueChroma {
  const n = parseInt(hex.slice(1), 16);
  const r = srgbToLinear((n >> 16) & 255);
  const g = srgbToLinear((n >> 8) & 255);
  const b = srgbToLinear(n & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  let hue = (Math.atan2(bAxis, a) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  return [+hue.toFixed(1), +Math.hypot(a, bAxis).toFixed(3)];
}

// Chroma tapers toward very light and very dark tones so they stay in gamut.
export function tone([hue, chroma]: HueChroma, toneValue: number): string {
  const lightness = toneValue / 100;
  const taper = Math.max(0.25, 1 - Math.abs(lightness - 0.55) * 1.25);
  return `oklch(${(lightness * 100).toFixed(1)}% ${(chroma * taper).toFixed(3)} ${hue})`;
}

export const JALVIO_PALETTE: Palette = {
  primary: hexToHueChroma('#4977C2'),
  secondary: hexToHueChroma('#577F6D'),
  tertiary: hexToHueChroma('#07885B'),
  error: hexToHueChroma('#CC4B49'),
  neutral: hexToHueChroma('#6D778E'),
  neutralVariant: hexToHueChroma('#5477B5'),
};

export type Mode = 'light' | 'dark';

const ACCENT_ROLES = ['primary', 'secondary', 'tertiary', 'error'] as const;

const TONES = {
  light: {
    role: 40,
    onRole: 100,
    container: 90,
    onContainer: 12,
    surface: 98,
    surfaceContainer: 94,
    surfaceContainerHighest: 90,
    onSurface: 10,
    onSurfaceVariant: 30,
    outline: 50,
    outlineVariant: 80,
  },
  dark: {
    role: 80,
    onRole: 20,
    container: 30,
    onContainer: 90,
    surface: 6,
    surfaceContainer: 12,
    surfaceContainerHighest: 22,
    onSurface: 90,
    onSurfaceVariant: 80,
    outline: 60,
    outlineVariant: 30,
  },
} as const;

export function buildScheme(palette: Palette, mode: Mode): Scheme {
  const t = TONES[mode];
  const scheme: Scheme = {};
  for (const role of ACCENT_ROLES) {
    scheme[`--${role}`] = tone(palette[role], t.role);
    scheme[`--on-${role}`] = tone(palette[role], t.onRole);
    scheme[`--${role}-container`] = tone(palette[role], t.container);
    scheme[`--on-${role}-container`] = tone(palette[role], t.onContainer);
  }
  for (const fixed of [30, 50, 60, 70, 80]) scheme[`--p${fixed}`] = tone(palette.primary, fixed);
  scheme['--t70'] = tone(palette.tertiary, 70);
  scheme['--surface'] = tone(palette.neutral, t.surface);
  scheme['--surface-container'] = tone(palette.neutral, t.surfaceContainer);
  scheme['--surface-container-highest'] = tone(palette.neutral, t.surfaceContainerHighest);
  scheme['--on-surface'] = tone(palette.neutral, t.onSurface);
  scheme['--on-surface-variant'] = tone(palette.neutralVariant, t.onSurfaceVariant);
  scheme['--outline'] = tone(palette.neutralVariant, t.outline);
  scheme['--outline-variant'] = tone(palette.neutralVariant, t.outlineVariant);
  return { ...scheme, ...pageLayers(scheme, mode), ...brandSurfaces(scheme, palette, mode) };
}

// Light mode lifts cards above a tinted page; dark mode does the reverse, with each layer a step lighter.
function pageLayers(roles: Scheme, mode: Mode): Scheme {
  const light = mode === 'light';
  return {
    '--page': light ? roles['--surface-container'] : roles['--surface'],
    '--card': light ? roles['--surface'] : roles['--surface-container'],
    '--card-inset': light ? roles['--surface-container'] : roles['--surface-container-highest'],
  };
}

// Large brand areas use strong colors in light mode but would glare in dark mode,
// so they drop to container tones there and the accents on them flip to stay visible.
function brandSurfaces(roles: Scheme, palette: Palette, mode: Mode): Scheme {
  const light = mode === 'light';
  return {
    '--hero': light ? roles['--primary'] : roles['--primary-container'],
    '--on-hero': light ? roles['--on-primary'] : roles['--on-primary-container'],
    '--hero-field': light ? roles['--on-primary'] : tone(palette.primary, 18),
    '--cta': light ? roles['--tertiary'] : roles['--tertiary-container'],
    '--on-cta': light ? roles['--on-tertiary'] : roles['--on-tertiary-container'],
    '--accent': light ? roles['--tertiary-container'] : roles['--tertiary'],
    '--on-accent': light ? roles['--on-tertiary-container'] : roles['--on-tertiary'],
    '--spotlight': light ? roles['--tertiary-container'] : tone(palette.tertiary, 18),
    '--jali-soft': light ? roles['--primary-container'] : roles['--primary'],
    '--on-jali-soft': light ? roles['--on-primary-container'] : roles['--on-primary'],
  };
}

export const lightDarkCss = (light: Scheme, dark: Scheme) =>
  Object.entries(light)
    .map(([name, value]) => `${name}:light-dark(${value},${dark[name as keyof Scheme]});`)
    .join('');
