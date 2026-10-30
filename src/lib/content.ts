import type { MascotMood } from './mascot';

export interface CrowdMood {
  mood: MascotMood;
  name: string;
  meaning: string;
  says: string;
  background: string;
  foreground: string;
}

export const CROWD_MOODS: readonly CrowdMood[] = [
  {
    mood: 'calm',
    name: 'Calm',
    meaning: 'Seats free',
    says: 'Nice, enjoy the ride',
    background: 'var(--tertiary-container)',
    foreground: 'var(--on-tertiary-container)',
  },
  {
    mood: 'busy',
    name: 'Busy',
    meaning: 'Some seats',
    says: 'Got it, thanks!',
    background: 'var(--busy-container)',
    foreground: 'var(--on-busy-container)',
  },
  {
    mood: 'standing',
    name: 'Standing',
    meaning: 'No seats',
    says: 'Hang in there',
    background: 'var(--standing-container)',
    foreground: 'var(--on-standing-container)',
  },
  {
    mood: 'packed',
    name: 'Packed',
    meaning: 'Hard to board',
    says: 'Oof. Thanks for the heads-up',
    background: 'var(--error-container)',
    foreground: 'var(--on-error-container)',
  },
];

export interface CrowdLevel {
  label: string;
  icon: string;
  background: string;
  foreground: string;
}

const SEATS_FREE: CrowdLevel = {
  label: 'Seats free',
  icon: 'event_seat',
  background: 'var(--tertiary-container)',
  foreground: 'var(--on-tertiary-container)',
};
const STANDING: CrowdLevel = {
  label: 'Standing',
  icon: 'person',
  background: 'var(--secondary-container)',
  foreground: 'var(--on-secondary-container)',
};
const PACKED: CrowdLevel = {
  label: 'Packed',
  icon: 'groups',
  background: 'var(--error-container)',
  foreground: 'var(--on-error-container)',
};

export interface Arrival {
  route: string;
  destination: string;
  minutes: number;
  crowd: CrowdLevel;
  badgeBackground: string;
  badgeForeground: string;
}

export const ARRIVALS: readonly Arrival[] = [
  {
    route: '1',
    destination: 'to Kota',
    minutes: 2,
    crowd: SEATS_FREE,
    badgeBackground: 'var(--primary)',
    badgeForeground: 'var(--on-primary)',
  },
  {
    route: '6',
    destination: 'to Ragunan',
    minutes: 5,
    crowd: STANDING,
    badgeBackground: 'var(--tertiary)',
    badgeForeground: 'var(--on-tertiary)',
  },
  {
    route: '9',
    destination: 'to Pluit',
    minutes: 11,
    crowd: PACKED,
    badgeBackground: 'var(--secondary)',
    badgeForeground: 'var(--on-secondary)',
  },
];

export const FAQ: readonly { question: string; answer: string }[] = [
  {
    question: 'When does Jalvio launch?',
    answer: 'Early access opens in stages. People on the waitlist get their invite first, by email.',
  },
  {
    question: 'Which buses does it cover?',
    answer:
      'All TransJakarta corridors and feeder routes. Buses that share their position show live on the map; the rest use the timetable.',
  },
  {
    question: "I'm visiting Jakarta. Is it useful for me?",
    answer:
      'Yes. Search a place by name and Jalvio shows the stop to walk to, the bus to take and where to get off. It works in English and Bahasa Indonesia.',
  },
  {
    question: 'How does crowding work?',
    answer:
      'Riders on board tap one of four levels: calm, busy, standing or packed. Older reports fade, so you only see how the bus is now.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No. You can skip sign-in and use a local account on your phone. A Google account keeps your saved places across phones.',
  },
  { question: 'Is it free?', answer: 'Yes. Jalvio is free to use.' },
];
