import assert from "node:assert/strict";
import test from "node:test";
import { assertDecisionContextResponse as check } from "./decision-context-http";
const v3 = "decision-context.v3", v2 = "decision-context.v2";
const row = (version: string) => ({ decisionContext: { contractVersion: version } });

test("dashboard cards require the acknowledged interval context instead of legacy cumulative pressure", () => {
  const path = "/v1/dashboard";
  for (const featuredMatches of [[], [row(v3)]]) assert.doesNotThrow(() => check(path, { featuredMatches }, v3, v3));
  for (const body of [{}, { featuredMatches: [row(v2)] }, { featuredMatches: [{}] }])
    assert.throws(() => check(path, body, v3, v3), /sözleşmesi/);
  assert.throws(() => check(path, { featuredMatches: [row(v3)] }, v3, null), /sözleşmesi/);
  assert.doesNotThrow(() => check(path, { featuredMatches: [row(v2)] }, v2, v2));
});
test("acknowledged V3 cannot silently return old or missing match/Super context", () => {
  for (const path of ["/v1/btb/matches", "/v1/btb/matches/key", "/v1/super/logs/key"]) {
    assert.doesNotThrow(()=>check(path,[row(v3)],v3,v3));
    for (const body of [[row(v2)], [{}]]) assert.throws(()=>check(path,body,v3,v3),/sözleşmesi/);
    assert.throws(()=>check(path,[row(v3)],v3,null),/sözleşmesi/);
  }
});
test("every journey point must match the acknowledged version, including honest unavailable records", () => {
  const path = "/v1/btb/matches/key/match-journey";
  for (const points of [[],[row(v3)]]) assert.doesNotThrow(()=>check(path,{ points },v3,v3));
  for (const points of [[row(v3),row(v2)],[{}]]) assert.throws(()=>check(path,{ points },v3,v3),/sözleşmesi/);
});
test("explicit acknowledged V2 fallback and non-opt-in legacy responses remain supported", () => {
  assert.doesNotThrow(()=>check("/v1/btb/matches",[row(v2)],v2,v2));
  assert.throws(()=>check("/v1/btb/matches",[row(v2)],v2,v3),/sözleşmesi/);
  assert.doesNotThrow(()=>check("/v1/btb/matches",[{}],null,null));
});
