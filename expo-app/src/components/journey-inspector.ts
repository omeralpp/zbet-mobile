import type { JourneyMoment } from './journey-story';

export type InspectorIntent = 'WAIT' | 'SCROLL' | 'DISMISS' | 'PREVIOUS' | 'NEXT';

/** Axis locking keeps vertical reading, taps and diagonal hesitation intact. */
export function inspectorIntent(dx: number, dy: number, canDismiss: boolean): InspectorIntent {
  'worklet';
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return 'WAIT';
  if (Math.abs(dx) >= 10 && Math.abs(dx) > Math.abs(dy) * 1.3) return dx < 0 ? 'NEXT' : 'PREVIOUS';
  if (Math.abs(dy) >= 8 && Math.abs(dy) > Math.abs(dx) * 1.3) return dy > 0 && canDismiss ? 'DISMISS' : 'SCROLL';
  return 'WAIT';
}

export function inspectorCommit(dx: number, dy: number, vx: number, vy: number, mode: InspectorIntent): InspectorIntent {
  'worklet';
  if (mode === 'DISMISS') return dy >= 80 || (dy >= 24 && vy >= 900) ? 'DISMISS' : 'WAIT';
  if (mode === 'NEXT' || mode === 'PREVIOUS') {
    if (Math.abs(dx) >= 56 || (Math.abs(dx) >= 20 && Math.abs(vx) >= 600)) return dx < 0 ? 'NEXT' : 'PREVIOUS';
  }
  return 'WAIT';
}

/** Never wrap at the ends; same-minute and unplaced events remain separate. */
export function adjacentInspectorMoment(moments: readonly JourneyMoment[], activeKey: string | null,
  minute: number | null, direction: -1 | 1) {
  const active = moments.findIndex(moment => moment.key === activeKey);
  if (active >= 0) return moments[active + direction];
  if (minute === null) return direction === 1 ? moments[0] : moments.at(-1);
  return direction === 1 ? moments.find(moment => moment.minute !== null && moment.minute >= minute)
    : moments.findLast(moment => moment.minute !== null && moment.minute <= minute);
}

export type InspectorWheelState = { at: number; amount: number; locked: boolean };

/** A wheel/trackpad burst advances once; inertia cannot skip several events. */
export function inspectorWheel(state: InspectorWheelState, dx: number, dy: number, at: number) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(at) || Math.abs(dx) <= Math.abs(dy) * 1.2) {
    return { handled: false, direction: 0, state };
  }
  const next = at - state.at > 180 ? { at, amount: dx, locked: false }
    : { ...state, at, amount: state.amount + dx };
  const direction = !next.locked && Math.abs(next.amount) >= 44 ? Math.sign(next.amount) : 0;
  return { handled: true, direction, state: { ...next, locked: next.locked || direction !== 0 } };
}
