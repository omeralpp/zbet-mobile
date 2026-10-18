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

export type InspectorWheelState = { at: number; amount: number; locked: boolean; stepAt?: number; lastDelta?: number };

type WheelInput = { deltaMode: number; deltaX: number; deltaY: number; shiftKey: boolean; ctrlKey: boolean; metaKey: boolean };

/** Read the unit before the deltas; Shift+wheel is the one-axis mouse substitute. */
export function inspectorWheelInput(state: InspectorWheelState, event: WheelInput, at: number) {
  if (event.ctrlKey || event.metaKey) return { handled: false, direction: 0, state };
  const mode = event.deltaMode;
  const scale = mode === 1 ? 16 : mode === 2 ? 300 : 1;
  const dx = event.shiftKey ? event.deltaX || event.deltaY : event.deltaX;
  return inspectorWheel(state, dx * scale, (event.shiftKey ? 0 : event.deltaY) * scale, at);
}

/** Suppress coasting, but let a held tilt wheel keep moving after a bounded pause. */
export function inspectorWheel(state: InspectorWheelState, dx: number, dy: number, at: number) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(at) || Math.abs(dx) <= Math.abs(dy) * 1.2) {
    return { handled: false, direction: 0, state };
  }
  const previousDelta = state.lastDelta ?? state.amount;
  const reversed = previousDelta !== 0 && Math.sign(dx) !== Math.sign(previousDelta);
  const next = at - state.at > 180 || reversed ? { at, amount: dx, locked: false, stepAt: at, lastDelta: 0 }
    : { ...state, at, amount: state.amount + dx };
  // A discrete horizontal wheel step can be just 10px. The old 44px threshold
  // swallowed it entirely; keep a small noise guard and lock the remaining inertia.
  // Compare with the last advance, not the last input. Updating the latter on
  // every tick locked a continuously held mouse wheel forever. Falling deltas
  // are trackpad inertia; a sustained or renewed input may repeat at most 4/s.
  const repeat = next.locked && at - (next.stepAt ?? at) >= 250 &&
    Math.abs(dx) >= 8 && Math.abs(dx) >= Math.abs(next.lastDelta ?? 0);
  const direction = (!next.locked || repeat) && Math.abs(next.amount) >= 8 ? Math.sign(next.amount) : 0;
  return { handled: true, direction, state: { ...next, locked: next.locked || direction !== 0,
    stepAt: direction ? at : next.stepAt ?? 0, lastDelta: dx, amount: direction ? 0 : next.amount } };
}
