// Mock data for the app preview: route 1 to Kota, seen from Bundaran HI at 9:41.

const MOCKUP_TIME_MINUTES = 9 * 60 + 41;
const STOPS_SHOWN = 5;

export const UPSTREAM_STOPS = ['Bendungan Hilir', 'Karet', 'Setiabudi', 'Dukuh Atas', 'Tosari'] as const;

const DOWNSTREAM: readonly [name: string, offsetMinutes: number][] = [
  ['Sarinah', 2],
  ['Bank Indonesia', 4],
  ['Monas', 6],
  ['Harmoni', 9],
  ['Glodok', 13],
  ['Kota', 18],
];

interface Crowd {
  level: number;
  color: string;
}

const CALM: Crowd = { level: 1, color: 'var(--tertiary)' };
const BUSY: Crowd = { level: 2, color: 'var(--busy)' };
const STANDING: Crowd = { level: 3, color: 'var(--standing)' };

const APPROACHING = [
  { eta: 2, stopsPassed: 4, plate: 'B 7412 TGB', fleet: 'TJ-0118', crowd: STANDING, crowdNote: 'Standing · 2 min ago' },
  { eta: 9, stopsPassed: 2, plate: 'B 7066 TGA', fleet: 'TJ-0231', crowd: BUSY, crowdNote: 'Busy · 4 min ago' },
  { eta: 16, stopsPassed: 0, plate: 'B 7890 TGC', fleet: 'TJ-0304', crowd: CALM, crowdNote: 'Calm · 8 min ago' },
] as const;

export function clockIn(minutes: number): string {
  const total = MOCKUP_TIME_MINUTES + minutes;
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export interface BusSummary {
  index: number;
  eta: number;
  clock: string;
  plate: string;
  fleet: string;
  crowdNote: string;
  crowdColor: string;
  crowdDots: boolean[];
  distanceLabel: string;
  /** Horizontal position on the route strip, as a percentage. */
  stripPosition: number;
  notifying: boolean;
  notifyLabel: string;
  notifyIcon: string;
}

export interface BusSelection {
  selected: number;
  notifying: ReadonlySet<number>;
}

function summarize(index: number, notifying: boolean): BusSummary {
  const bus = APPROACHING[index];
  const stopsAway = STOPS_SHOWN - bus.stopsPassed;
  return {
    index,
    eta: bus.eta,
    clock: clockIn(bus.eta),
    plate: bus.plate,
    fleet: bus.fleet,
    crowdNote: bus.crowdNote,
    crowdColor: bus.crowd.color,
    crowdDots: [0, 1, 2].map((dot) => dot < bus.crowd.level),
    distanceLabel: stopsAway === 1 ? 'Next stop: yours' : `${stopsAway} stops away`,
    stripPosition: ((bus.stopsPassed + 0.5) / STOPS_SHOWN) * 100,
    notifying,
    notifyLabel: notifying ? 'Notifying 2 min before' : 'Notify me when near',
    notifyIcon: notifying ? 'notifications_active' : 'notifications',
  };
}

export function busView({ selected, notifying }: BusSelection) {
  const buses = APPROACHING.map((_, index) => summarize(index, notifying.has(index)));
  return {
    buses,
    selected: buses[selected],
    others: buses.filter((bus) => bus.index !== selected),
    lead: selected === 0 ? 'Next bus · live' : 'Selected bus · live',
  };
}

export function downstreamStops(selectedEta: number) {
  return DOWNSTREAM.map(([name, offset], i) => ({
    name,
    minutes: selectedEta + offset,
    clock: clockIn(selectedEta + offset),
    terminus: i === DOWNSTREAM.length - 1,
  }));
}

export const notifyToast = (bus: BusSummary) =>
  bus.notifying ? 'Notification off' : `We'll tell you when the ${bus.clock} bus is 2 min away`;

export function collapseProgress(scrollTop: number, collapsibleHeight: number): number {
  if (collapsibleHeight <= 0) return 1;
  return Math.max(0, Math.min(1, scrollTop / collapsibleHeight));
}
