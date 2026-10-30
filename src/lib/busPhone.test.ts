import { describe, expect, it } from 'vitest';
import { busView, clockIn, collapseProgress, downstreamStops } from './busPhone';

describe('clockIn', () => {
  it('adds minutes to the 9:41 mockup time', () => {
    expect(clockIn(2)).toBe('9:43');
    expect(clockIn(19)).toBe('10:00');
  });
});

describe('busView', () => {
  it('describes each approaching bus for the selected one', () => {
    const view = busView({ selected: 0, notifying: new Set() });

    expect(view.buses.map((bus) => bus.eta)).toEqual([2, 9, 16]);
    expect(view.selected).toMatchObject({ plate: 'B 7412 TGB', fleet: 'TJ-0118', crowdNote: 'Standing · 2 min ago' });
    expect(view.lead).toBe('Next bus · live');
    expect(view.others.map((bus) => bus.index)).toEqual([1, 2]);
  });

  it('labels a later selection as selected rather than next', () => {
    const view = busView({ selected: 1, notifying: new Set() });

    expect(view.lead).toBe('Selected bus · live');
    expect(view.others.map((bus) => bus.index)).toEqual([0, 2]);
  });

  it('counts the stops between each bus and the rider', () => {
    const view = busView({ selected: 0, notifying: new Set() });

    expect(view.buses.map((bus) => bus.distanceLabel)).toEqual(['Next stop: yours', '3 stops away', '5 stops away']);
  });

  it('fills one crowd dot per crowd level', () => {
    const view = busView({ selected: 0, notifying: new Set() });

    expect(view.buses.map((bus) => bus.crowdDots.filter(Boolean).length)).toEqual([3, 2, 1]);
  });

  it('reflects whether alerts are on for the selected bus', () => {
    expect(busView({ selected: 0, notifying: new Set() }).selected.notifyLabel).toBe('Notify me when near');
    expect(busView({ selected: 0, notifying: new Set([0]) }).selected.notifyLabel).toBe('Notifying 2 min before');
  });
});

describe('downstreamStops', () => {
  it('times the stops after Bundaran HI from the selected bus', () => {
    const stops = downstreamStops(9);

    expect(stops[0]).toEqual({ name: 'Sarinah', minutes: 11, clock: '9:52', terminus: false });
    expect(stops.at(-1)).toEqual({ name: 'Kota', minutes: 27, clock: '10:08', terminus: true });
  });
});

describe('collapseProgress', () => {
  it('maps scroll distance onto the collapsible hero height, clamped to 0..1', () => {
    expect(collapseProgress(0, 250)).toBe(0);
    expect(collapseProgress(125, 250)).toBe(0.5);
    expect(collapseProgress(900, 250)).toBe(1);
    expect(collapseProgress(10, 0)).toBe(1);
  });
});
