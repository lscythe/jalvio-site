import { CROWD_MOODS } from './content';

export interface HeroState {
  minutes: number;
  moodIndex: number;
}

const LOOP_START = 3;

export const HERO_TICK_MS = 4000;

export const INITIAL_HERO: HeroState = { minutes: LOOP_START, moodIndex: 0 };

export const tickHero = ({ minutes, moodIndex }: HeroState): HeroState => ({
  minutes: minutes <= 1 ? LOOP_START : minutes - 1,
  moodIndex: (moodIndex + 1) % CROWD_MOODS.length,
});

export const previousMinute = (minutes: number) => (minutes === LOOP_START ? 1 : minutes + 1);
