import assert from "node:assert/strict";
import test from "node:test";
import { jinxDailyLinesSchema, jinxNotesSchema, pickJinxLine, pickJinxNote } from "./jinx-notes-schema";

const at = "2026-11-26T18:00:00.000Z";
const A = "A".repeat(32), B = "B".repeat(32);
const notes = (list: object[]) => jinxNotesSchema.parse({ contractVersion: "btb-jinx-notes.v1", matchKey: "k", status: "AVAILABLE", notes: list });

test("the card shows POST first, then the decision on screen, then the newest decision, then PRE", () => {
  const pre = { kind: "PRE", decisionId: null, text: "Ön.", generatedAt: at };
  const b = { kind: "DECISION", decisionId: B, text: "B kararı.", generatedAt: at };
  const a = { kind: "DECISION", decisionId: A, text: "A kararı.", generatedAt: at };
  const post = { kind: "POST", decisionId: null, text: "Son.", generatedAt: at };
  assert.equal(pickJinxNote(notes([pre]))?.text, "Ön.");
  assert.equal(pickJinxNote(notes([b, a, pre]))?.text, "B kararı.");
  assert.equal(pickJinxNote(notes([b, a, pre]), A)?.text, "A kararı.");
  assert.equal(pickJinxNote(notes([post, b]), B)?.text, "Son.");
  assert.equal(pickJinxNote(undefined), null);
  assert.equal(pickJinxNote(jinxNotesSchema.parse({ contractVersion: "btb-jinx-notes.v1", matchKey: "k", status: "DISABLED", notes: [] })), null);
});

test("mascot lines rotate by hour and are never used when stale", () => {
  const lines = jinxDailyLinesSchema.parse({ contractVersion: "btb-jinx-lines.v1", day: "2026-11-26", status: "AVAILABLE",
    signature: "s", stale: false, lines: ["bir", "iki", "üç"] });
  assert.equal(pickJinxLine(lines, 0), "bir");
  assert.equal(pickJinxLine(lines, 3_600_000), "iki");
  assert.equal(pickJinxLine({ ...lines, stale: true }, 0), null);
  assert.equal(pickJinxLine({ ...lines, status: "UNAVAILABLE" }, 0), null);
  assert.throws(() => jinxNotesSchema.parse({ contractVersion: "btb-jinx-notes.v1", matchKey: "k", status: "AVAILABLE",
    notes: [{ kind: "PRE", decisionId: null, text: "x".repeat(161), generatedAt: at }] }));
});
