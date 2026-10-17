import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectorCommit, inspectorIntent, adjacentInspectorMoment, inspectorWheel, inspectorWheelInput } from './journey-inspector';
import type { JourneyMoment } from './journey-story';

test('only a deliberate downward drag at the top dismisses; content scrolling and diagonals survive', () => {
  assert.equal(inspectorIntent(1, 16, true), 'DISMISS');
  assert.equal(inspectorIntent(1, 16, false), 'SCROLL');
  assert.equal(inspectorIntent(1, -16, true), 'SCROLL');
  assert.equal(inspectorIntent(-30, 2, false), 'NEXT');
  assert.equal(inspectorIntent(30, 2, false), 'PREVIOUS');
  assert.equal(inspectorIntent(12, 12, true), 'WAIT');
  assert.equal(inspectorCommit(0, 23, 0, 1200, 'DISMISS'), 'WAIT');
  assert.equal(inspectorCommit(0, 81, 0, 0, 'DISMISS'), 'DISMISS');
  assert.equal(inspectorCommit(-57, 0, 0, 0, 'NEXT'), 'NEXT');
  assert.equal(inspectorCommit(10, 0, 900, 0, 'PREVIOUS'), 'WAIT');
});

test('event navigation retains coincident events and ends without wrapping', () => {
  const moments = [{ key: 'goal', minute: 45 }, { key: 'card', minute: 45 },
    { key: 'super', minute: 63 }, { key: 'unknown', minute: null }] as JourneyMoment[];
  assert.equal(adjacentInspectorMoment(moments, 'goal', 45, 1)?.key, 'card');
  assert.equal(adjacentInspectorMoment(moments, 'goal', 45, -1), undefined);
  assert.equal(adjacentInspectorMoment(moments, 'unknown', null, 1), undefined);
  assert.equal(adjacentInspectorMoment(moments, null, 50, -1)?.key, 'card');
  assert.equal(adjacentInspectorMoment(moments, null, 50, 1)?.key, 'super');
  assert.equal(adjacentInspectorMoment([], null, null, 1), undefined);
});

test('one horizontal wheel burst advances once; vertical scroll stays untouched', () => {
  let state = { at: 0, amount: 0, locked: false };
  const first = inspectorWheel(state, 50, 1, 1000);
  assert.equal(first.direction, 1); state = first.state;
  const inertia = inspectorWheel(state, 90, 1, 1050);
  assert.equal(inertia.direction, 0);
  const reverse = inspectorWheel(inertia.state, -60, 0, 1300);
  assert.equal(reverse.direction, -1);
  assert.equal(inspectorWheel(reverse.state, 3, 80, 1400).handled, false);
});

test('small discrete horizontal steps navigate, including a quick direction reversal', () => {
  const initial = { at: 0, amount: 0, locked: false };
  const step = inspectorWheel(initial, 10, 0, 1000);
  assert.equal(step.direction, 1);
  assert.equal(inspectorWheel(step.state, 10, 0, 1050).direction, 0);
  const nextNotch = inspectorWheel(step.state, 10, 0, 1250);
  assert.equal(nextNotch.direction, 1);
  assert.equal(inspectorWheel(nextNotch.state, -10, 0, 1300).direction, -1);
  const noise = inspectorWheel(initial, 2, 0, 1000);
  assert.equal(noise.direction, 0);
  assert.equal(inspectorWheel(noise.state, 6, 0, 1030).direction, 1);
});

test('pixel, line, page and Shift wheel inputs share navigation and preserve reading/zoom', () => {
  const state = { at: 0, amount: 0, locked: false };
  const wheel = { deltaMode: 0, deltaX: 10, deltaY: 0, shiftKey: false, ctrlKey: false, metaKey: false };
  assert.equal(inspectorWheelInput(state, wheel, 1000).direction, 1);
  assert.equal(inspectorWheelInput(state, { ...wheel, deltaMode: 1, deltaX: -1 }, 1000).direction, -1);
  assert.equal(inspectorWheelInput(state, { ...wheel, deltaMode: 2, deltaX: 1 }, 1000).direction, 1);
  assert.equal(inspectorWheelInput(state, { ...wheel, deltaX: 0, deltaY: 10, shiftKey: true }, 1000).direction, 1);
  assert.equal(inspectorWheelInput(state, { ...wheel, deltaX: -10, deltaY: 10, shiftKey: true }, 1000).direction, -1);
  assert.equal(inspectorWheelInput(state, { ...wheel, deltaX: 0, deltaY: 100 }, 1000).handled, false);
  assert.equal(inspectorWheelInput(state, { ...wheel, deltaY: 100 }, 1000).handled, false);
  assert.equal(inspectorWheelInput(state, { ...wheel, ctrlKey: true }, 1000).handled, false);
  assert.equal(inspectorWheelInput(state, { ...wheel, metaKey: true }, 1000).handled, false);
});
