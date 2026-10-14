import type { MatchJourneyPoint } from '../api/schemas';
import type { JourneyMoment } from './journey-story';

export const journeyTouch = {
  activationDistance: 4,
  scrollDistance: 6,
  directionRatio: 1.25,
  eventHitRadius: 24,
  markerGap: 48
} as const;

/** A diagonal hesitation stays undecided; a vertical swipe belongs to the page. */
export function journeyDragIntent(dx: number, dy: number): 'SCRUB' | 'SCROLL' | 'WAIT' {
  'worklet';
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return 'WAIT';
  const horizontal = Math.abs(dx), vertical = Math.abs(dy);
  if (horizontal >= journeyTouch.activationDistance && horizontal > vertical * journeyTouch.directionRatio) return 'SCRUB';
  if (vertical >= journeyTouch.scrollDistance && vertical > horizontal * journeyTouch.directionRatio) return 'SCROLL';
  return 'WAIT';
}

/** Select a retained sample, never a fabricated value between two captures.
 * Same-minute samples resolve to the latest capture in the retained order. */
export function nearestJourneyPoint(points: MatchJourneyPoint[], px: number, position: (minute: number) => number) {
  if (!Number.isFinite(px)) return undefined;
  let nearest: MatchJourneyPoint | undefined;
  let distance = Infinity;
  for (const point of points) {
    if (point.plotMinute === null || point.level === null) continue;
    const next = Math.abs(position(point.plotMinute) - px);
    if (next <= distance) { nearest = point; distance = next; }
  }
  return nearest;
}

/** Tap the rendered group anchor, not an invisible first event's timestamp. */
export function nearestMomentGroup(groups: JourneyMoment[][], px: number, position: (minute: number) => number, maxDistance = Infinity) {
  if (!Number.isFinite(px)) return undefined;
  let nearest: JourneyMoment[] | undefined;
  let distance = maxDistance;
  for (const group of groups) {
    const minute = group[0]?.minute;
    if (minute == null) continue;
    const next = Math.abs(position(minute) - px);
    if (next <= distance) { nearest = group; distance = next; }
  }
  return nearest;
}

/** A card takes visual priority in a cluster; all members remain selectable. */
export function momentGroupLead(group: JourneyMoment[]) {
  return group.find(event => event.kind === 'RED_CARD') ?? group.find(event => event.kind === 'GOAL') ?? group[0];
}

/** Opposing goals are different symbols, even though both have kind GOAL. */
export function momentGroupSymbols(group: JourneyMoment[]) {
  const lead = momentGroupLead(group);
  if (!lead) return [];
  return [lead, ...group.filter(event => event.kind === 'GOAL'), ...group]
    .filter((event, index, all) => all.findIndex(other =>
      other.kind === event.kind && (other.kind !== 'GOAL' || other.side === event.side)) === index)
    .slice(0, 3);
}

/** A marker groups nearby events; it does not claim they happened together. */
export function momentGroupLabel(group: JourneyMoment[]) {
  const first = group[0], last = group.at(-1);
  if (!first || !last) return '';
  const span = first.minute !== last.minute ? `${first.label}–${last.label}` : first.label;
  return `${span} · ${group.length} olay · ayrı ayrı seç`;
}
