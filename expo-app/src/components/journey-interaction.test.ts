import assert from 'node:assert/strict';
import test from 'node:test';
import { mockRetainedJourney } from '../api/mock-data';
import { journeyDragIntent, momentGroupLead, momentGroupSymbols, momentGroupLabel, nearestJourneyPoint, nearestMomentGroup } from './journey-interaction';
import { journeyMoments, markerGroups } from './journey-story';

const fixture = mockRetainedJourney('touch');
const x = (minute: number) => 58 + minute / 90 * 240;

test('small horizontal movements scrub both ways while vertical and ambiguous diagonals do not', () => {
  assert.equal(journeyDragIntent(4.1, 1), 'SCRUB');
  assert.equal(journeyDragIntent(-5, -1), 'SCRUB');
  assert.equal(journeyDragIntent(3, 10), 'SCROLL');
  assert.equal(journeyDragIntent(-2, -7), 'SCROLL');
  assert.equal(journeyDragIntent(5, 5), 'WAIT');
  assert.equal(journeyDragIntent(1, 1), 'WAIT');
  assert.equal(journeyDragIntent(NaN, 2), 'WAIT');
});

test('dragging across and beyond the plot selects actual edge samples, never interpolated values', () => {
  const first = { ...fixture.points[0]!, key: 'first', plotMinute: 5, level: .8 };
  const last = { ...first, key: 'last', plotMinute: 80, level: .2 };
  assert.equal(nearestJourneyPoint([first, last], x(2), x), first);
  assert.equal(nearestJourneyPoint([first, last], x(79), x), last);
  assert.equal(nearestJourneyPoint([first, last], -100, x), first);
  assert.equal(nearestJourneyPoint([first, last], 1000, x), last);
  assert.equal(nearestJourneyPoint([], 100, x), undefined);
});

test('same-minute selection retains latest capture and ignores missing clock/level', () => {
  const first = { ...fixture.points[0]!, key: 'first', plotMinute: 60, level: .8 };
  const latest = { ...first, key: 'latest', level: .2 };
  const points = [first, latest, { ...first, key: 'unknown', level: null }, { ...first, plotMinute: null }];
  assert.equal(nearestJourneyPoint(points, x(60), x)?.key, 'latest');
  assert.equal(nearestJourneyPoint(points, NaN, x), undefined);
});

test('group taps require a real hit, scrubbing can snap to events, and all coincident members survive', () => {
  const moments = journeyMoments([], { availability: 'OK', timeline: [
    { eventKey: 'goal', kind: 'GOAL', minute: 45 },
    { eventKey: 'card', kind: 'RED_CARD', minute: 45 },
    { eventKey: 'later', kind: 'GOAL', minute: 80 },
    { eventKey: 'no-time', kind: 'GOAL', minute: null }
  ] });
  const groups = markerGroups(moments, x, 48);
  assert.deepEqual(nearestMomentGroup(groups, x(45), x, 24)?.map(event => event.key), ['goal', 'card']);
  assert.equal(momentGroupLead(groups[0]!)?.key, 'card');
  assert.equal(nearestMomentGroup(groups, x(2), x, 24), undefined);
  assert.equal(nearestMomentGroup(groups, x(70), x)?.[0]?.key, 'later');
  assert.equal(nearestMomentGroup([], 100, x), undefined);
  assert.equal(moments.at(-1)?.key, 'no-time');
});

test('one group preserves opposing goal teams and a card instead of implying all goals belong to the lead team', () => {
  const group = journeyMoments([], {availability:'OK',timeline:[
    {eventKey:'home',kind:'GOAL',minute:8,side:'HOME'},
    {eventKey:'away',kind:'GOAL',minute:14,side:'AWAY'},
    {eventKey:'home-again',kind:'GOAL',minute:15,side:'HOME'},
    {eventKey:'card',kind:'RED_CARD',minute:15,side:'AWAY'}
  ]});
  assert.deepEqual(momentGroupSymbols(group).map(event=>event.key), ['card','home','away']);
  assert.equal(momentGroupLabel(group), '8′–15′ · 4 olay · ayrı ayrı seç');
  assert.equal(group.length,4,'symbol compaction never drops an event choice');
});

test('same-side goals compact only their symbols; unknown teams and stoppage labels remain distinct', () => {
  const group = journeyMoments([], {availability:'OK',timeline:[
    {eventKey:'first',kind:'GOAL',minute:76,side:'AWAY'},
    {eventKey:'second',kind:'GOAL',minute:84,side:'AWAY'},
    {eventKey:'third',kind:'GOAL',minute:90,minuteLabel:'90+',side:'AWAY'}
  ]});
  assert.deepEqual(momentGroupSymbols(group).map(event=>event.key),['first']);
  assert.equal(momentGroupLabel(group),'76′–90+ · 3 olay · ayrı ayrı seç');
  const unknown={...group[0]!,key:'unknown',side:null};
  assert.deepEqual(momentGroupSymbols([group[0]!,unknown]).map(event=>event.side),['AWAY',null]);
  assert.deepEqual(momentGroupSymbols([]),[]);
  assert.equal(momentGroupLabel([]),'');
});
