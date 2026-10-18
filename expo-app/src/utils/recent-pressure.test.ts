import assert from 'node:assert/strict';
import test from 'node:test';
import { capturedIntervalPressure, currentIntervalPressure, unavailablePressureMessage } from './recent-pressure';
import { decisionContextSchema } from '../api/schemas';

test('selected historical pressure uses its capture time while current pressure expires', () => {
  const context=decisionContextSchema.parse({contractVersion:'decision-context.v2',recentPressure:{
    availability:'AVAILABLE',reason:null,units:'WEIGHTED_ACTIVITY_PER_MINUTE',home:0,away:0,total:0,difference:0,
    intervalSeconds:60,observedAt:'2026-10-11T15:01:00Z',sourceTimingKnown:false,xgCovered:false,stateRevision:'S'},
    decisionCoherence:{availability:'UNAVAILABLE',reason:'NO_QUOTE',stateRevision:null,quoteRevision:null}});
  assert.equal(currentIntervalPressure(context,Date.parse('2026-10-12T15:01:00Z')).measured,false);
  assert.equal(capturedIntervalPressure(context,'2026-10-11T15:01:05Z').measured,true);
  assert.equal(capturedIntervalPressure(context,'2026-10-11T15:00:00Z').measured,false);
  assert.equal(capturedIntervalPressure(context,null).measured,false);
});

test('unavailable pressure distinguishes rejected versions from absent counter activity', () => {
  for (const reason of ['CAPTURE_REGIME_MISMATCH', 'CAPTURE_MODEL_REGIME_MISMATCH', 'CAPTURE_PARAMETER_REGIME_MISMATCH']) {
    assert.match(unavailablePressureMessage(reason).label, /sürüm uyuşmazlığı/);
    assert.match(unavailablePressureMessage(reason).detail, /hesaplanmadığı anlamına gelmez/);
  }
  assert.match(unavailablePressureMessage('OBS_ACTIVITY_UNPROVEN').detail, /sıfır baskı sayılmaz/);
  assert.match(unavailablePressureMessage('STATE_EPOCH_CHANGED').label, /yeni aralık/);
  assert.match(unavailablePressureMessage('CAPTURE_ENDPOINT_STALE').detail, /eski değer kullanılmıyor/);
  assert.doesNotMatch(unavailablePressureMessage('<source text>').detail, /<source text>/);
});
