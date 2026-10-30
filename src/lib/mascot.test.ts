import { describe, expect, it } from 'vitest';
import { mascotFigure } from './mascot';

describe('mascotFigure', () => {
  it('draws a calm Jali as a gently scalloped round body', () => {
    const figure = mascotFigure({ mood: 'calm', tone: 'primary', size: 120 });

    expect(figure.scale).toBe(1.2);
    expect(figure.body).toMatchObject({ left: 10, top: 10, width: 80, height: 80 });
    expect(figure.clipPath.startsWith('polygon(')).toBe(true);
    expect(figure.clipPath.split(',')).toHaveLength(96);
    expect(figure.bodyColor).toBe('var(--primary)');
    expect(figure.inkColor).toBe('var(--on-primary)');
  });

  it('squashes the body wider and lower as the bus gets fuller', () => {
    const packed = mascotFigure({ mood: 'packed', tone: 'primary', size: 100 });

    expect(packed.body).toMatchObject({ left: 2, top: 32, width: 96, height: 58 });
  });

  it('uses theme-aware tone colors so Jali stays visible on the hero in both themes', () => {
    const soft = mascotFigure({ mood: 'calm', tone: 'container', size: 100 });
    const accent = mascotFigure({ mood: 'calm', tone: 'tertiary', size: 100 });

    expect([soft.bodyColor, soft.inkColor]).toEqual(['var(--jali-soft)', 'var(--on-jali-soft)']);
    expect([accent.bodyColor, accent.inkColor]).toEqual(['var(--accent)', 'var(--on-accent)']);
  });

  it('can take its colors from the card it sits on', () => {
    const onCard = mascotFigure({ mood: 'busy', tone: 'card', size: 100 });

    expect([onCard.bodyColor, onCard.inkColor]).toEqual(['var(--jali-card)', 'var(--on-jali-card)']);
  });

  it('places two mirrored eyes', () => {
    const { eyes } = mascotFigure({ mood: 'calm', tone: 'primary', size: 100 });

    expect(eyes.map((eye) => eye.x)).toEqual([-12, 12]);
    expect(eyes.map((eye) => eye.flip)).toEqual([-1, 1]);
  });

  it('shifts the eyes sideways for a glance when busy', () => {
    const { eyes } = mascotFigure({ mood: 'busy', tone: 'primary', size: 100 });

    expect(eyes[0].x).toBeCloseTo(-10.2);
    expect(eyes[1].x).toBeCloseTo(16.2);
  });

  it('blinks only while idle and only with open eyes', () => {
    expect(mascotFigure({ mood: 'calm', tone: 'primary', size: 100 }).blinks).toBe(true);
    expect(mascotFigure({ mood: 'calm', tone: 'primary', size: 100, idle: false }).blinks).toBe(false);
    expect(mascotFigure({ mood: 'thanks', tone: 'primary', size: 100 }).blinks).toBe(false);
  });

  it('stops the idle animation when idle is off', () => {
    expect(mascotFigure({ mood: 'late', tone: 'primary', size: 100 }).idleAnimation).toBe('mm-shake 1s ease-in-out infinite');
    expect(mascotFigure({ mood: 'late', tone: 'primary', size: 100, idle: false }).idleAnimation).toBe('none');
  });
});
