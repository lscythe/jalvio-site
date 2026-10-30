import { describe, expect, it } from 'vitest';
import { INITIAL_HERO, previousMinute, tickHero } from './countdown';

describe('tickHero', () => {
  it('counts the minutes down and moves Jali to the next mood', () => {
    expect(tickHero({ minutes: 3, moodIndex: 0 })).toEqual({ minutes: 2, moodIndex: 1 });
  });

  it('loops the countdown back to 3 after the bus arrives', () => {
    expect(tickHero({ minutes: 1, moodIndex: 2 })).toEqual({ minutes: 3, moodIndex: 3 });
  });

  it('wraps the mood after the last one', () => {
    expect(tickHero({ minutes: 2, moodIndex: 3 }).moodIndex).toBe(0);
  });

  it('starts at 3 minutes with the calm mood', () => {
    expect(INITIAL_HERO).toEqual({ minutes: 3, moodIndex: 0 });
  });
});

describe('previousMinute', () => {
  it('is the value that was on screen before the current one', () => {
    expect(previousMinute(2)).toBe(3);
    expect(previousMinute(3)).toBe(1);
  });
});
