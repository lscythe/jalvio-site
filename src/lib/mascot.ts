export type MascotMood = 'calm' | 'busy' | 'standing' | 'packed' | 'thanks' | 'late' | 'home' | 'night' | 'error';
/** `card` reads --jali-card and --on-jali-card, which the surrounding card sets. */
export type MascotTone = 'primary' | 'container' | 'tertiary' | 'card';

type EyeStyle = 'pill' | 'glance' | 'lid' | 'chev' | 'happy' | 'content' | 'wide' | 'line' | 'x';

interface MoodSpec {
  eye: EyeStyle;
  /** Petal count, petal depth and rotation of the body outline. */
  outline: [petals: number, depth: number, rotation?: number];
  /** 0 is a relaxed round body, 1 is fully squashed by the crowd. */
  squash: number;
  idle: string;
  muted?: boolean;
}

const MOODS: Record<MascotMood, MoodSpec> = {
  calm: { eye: 'pill', outline: [8, 0.05], squash: 0, idle: 'mm-breathe 3s ease-in-out infinite' },
  busy: { eye: 'glance', outline: [6, 0.08], squash: 0.3, idle: 'mm-bob 1.8s ease-in-out infinite' },
  standing: { eye: 'lid', outline: [4, 0.12], squash: 0.55, idle: 'mm-squish 2.2s ease-in-out infinite' },
  packed: { eye: 'chev', outline: [12, 0.08], squash: 1, idle: 'mm-squish .8s ease-in-out infinite' },
  thanks: { eye: 'happy', outline: [5, 0.12], squash: 0, idle: 'mm-hop 1.4s ease-in-out infinite' },
  late: { eye: 'wide', outline: [10, 0.1], squash: 0.2, idle: 'mm-shake 1s ease-in-out infinite' },
  home: { eye: 'content', outline: [6, 0.06], squash: 0, idle: 'mm-breathe 3.6s ease-in-out infinite' },
  night: { eye: 'line', outline: [8, 0], squash: 0, idle: 'mm-breathe 4.4s ease-in-out infinite' },
  error: { eye: 'x', outline: [4, 0.035, Math.PI], squash: 0, idle: 'mm-shake 2.6s ease-in-out infinite', muted: true },
};

const TONES: Record<MascotTone, [body: string, ink: string]> = {
  primary: ['var(--primary)', 'var(--on-primary)'],
  container: ['var(--jali-soft)', 'var(--on-jali-soft)'],
  tertiary: ['var(--accent)', 'var(--on-accent)'],
  card: ['var(--jali-card)', 'var(--on-jali-card)'],
};

const MUTED: [string, string] = ['var(--surface-container-highest)', 'var(--on-surface-variant)'];

const BLINKING_EYES: readonly EyeStyle[] = ['pill', 'glance', 'wide', 'lid'];

const OUTLINE_POINTS = 96;

function petalOutline(petals: number, depth: number, rotation = 0): string {
  const points: string[] = [];
  for (let i = 0; i < OUTLINE_POINTS; i++) {
    const angle = (i / OUTLINE_POINTS) * Math.PI * 2;
    const radius = 50 * (1 - depth + depth * Math.cos(petals * angle + rotation));
    points.push(`${(50 + radius * Math.sin(angle)).toFixed(2)}% ${(50 - radius * Math.cos(angle)).toFixed(2)}%`);
  }
  return `polygon(${points.join(',')})`;
}

export interface EyePart {
  left: number;
  top: number;
  width: number;
  height: number;
  radius: string;
  fill: string;
  border: string;
  borderWidth: string;
  rotate: number;
}

interface PartSpec {
  w: number;
  h: number;
  r: string;
  fill?: boolean;
  borderWidth?: string;
  rotate?: number;
  dx?: number;
  dy?: number;
}

const EYE_PARTS: Record<EyeStyle, PartSpec[]> = {
  pill: [{ w: 7, h: 14, r: '4px', fill: true }],
  glance: [{ w: 7, h: 14, r: '4px', fill: true }],
  lid: [{ w: 9, h: 8, r: '1px 1px 5px 5px', fill: true, dy: 2 }],
  chev: [{ w: 9, h: 9, r: '1.5px', borderWidth: '3.5px 0 0 3.5px', rotate: -45, dx: 1.5 }],
  happy: [{ w: 13, h: 8, r: '50% 50% 0 0 / 100% 100% 0 0', borderWidth: '3.5px 3.5px 0 3.5px', dy: 1 }],
  content: [{ w: 13, h: 8, r: '0 0 50% 50% / 0 0 100% 100%', borderWidth: '0 3.5px 3.5px 3.5px', dy: -1 }],
  wide: [{ w: 9, h: 16, r: '5px', fill: true }],
  line: [{ w: 11, h: 3.5, r: '2px', fill: true, dy: 2 }],
  x: [
    { w: 12, h: 3.5, r: '2px', fill: true, rotate: 45 },
    { w: 12, h: 3.5, r: '2px', fill: true, rotate: -45 },
  ],
};

const eyeParts = (style: EyeStyle, ink: string): EyePart[] =>
  EYE_PARTS[style].map((part) => ({
    left: -part.w / 2 + (part.dx ?? 0),
    top: -part.h / 2 + (part.dy ?? 0),
    width: part.w,
    height: part.h,
    radius: part.r,
    fill: part.fill ? ink : 'transparent',
    border: part.borderWidth ? ink : 'transparent',
    borderWidth: part.borderWidth ?? '0',
    rotate: part.rotate ?? 0,
  }));

export interface MascotOptions {
  mood: MascotMood;
  tone: MascotTone;
  size: number;
  idle?: boolean;
}

export interface MascotFigure {
  scale: number;
  body: { left: number; top: number; width: number; height: number };
  clipPath: string;
  bodyColor: string;
  inkColor: string;
  eyeLine: number;
  eyes: { x: number; flip: -1 | 1; parts: EyePart[] }[];
  idleAnimation: string;
  blinks: boolean;
}

/** Geometry for Jali drawn in a 100 by 100 box, scaled to `size` pixels. */
export function mascotFigure({ mood, tone, size, idle = true }: MascotOptions): MascotFigure {
  const spec = MOODS[mood] ?? MOODS.calm;
  const [bodyColor, inkColor] = spec.muted ? MUTED : TONES[tone];
  const width = 80 + 16 * spec.squash;
  const height = 80 - 22 * spec.squash;
  const top = 90 - height;
  const eyeSpread = 12 + 4 * spec.squash;
  const glanceOffset = spec.eye === 'glance' ? 3 : 0;
  const parts = eyeParts(spec.eye, inkColor);

  return {
    scale: size / 100,
    body: { left: 50 - width / 2, top, width, height },
    clipPath: petalOutline(...spec.outline),
    bodyColor,
    inkColor,
    eyeLine: top + height * 0.5,
    eyes: ([-1, 1] as const).map((side) => ({ x: side * eyeSpread + glanceOffset, flip: side, parts })),
    idleAnimation: idle ? spec.idle : 'none',
    blinks: idle && BLINKING_EYES.includes(spec.eye),
  };
}
