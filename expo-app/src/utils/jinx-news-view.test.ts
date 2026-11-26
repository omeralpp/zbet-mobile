import assert from "node:assert/strict";
import test from "node:test";
import { jinxNewsBriefSchema, type JinxNewsBrief } from "@/src/api/jinx-news-schema";
import { mockJinxNewsBrief } from "@/src/api/mock-jinx-news";
import { jinxNewsView, newsDay } from "./jinx-news-view";

const NOW = Date.parse("2026-11-25T20:00:00Z");
const brief = (change: Partial<JinxNewsBrief> = {}): JinxNewsBrief => jinxNewsBriefSchema.parse({
  schemaVersion: "btb-jinx-news.v1", matchKey: "k", status: "AVAILABLE", displayOnly: true,
  generatedAt: "2026-11-25T19:00:00Z", observedAt: "2026-11-25T20:00:00Z", refreshAvailableAt: "2026-11-25T19:30:00Z",
  bullets: [{ date: "2026-11-24", text: "Kaptan kadroda yok.", sources: [1, 0] }],
  sources: [{ title: "A", url: "https://example.com/a" }, { title: "B", url: "https://example.com/b" }], ...change });

test("the schema refuses uncited bullets and status mismatches", () => {
  const base = brief();
  assert.equal(jinxNewsBriefSchema.safeParse({ ...base, bullets: [{ ...base.bullets[0], sources: [5] }] }).success, false);
  assert.equal(jinxNewsBriefSchema.safeParse({ ...base, status: "NO_RECENT_NEWS" }).success, false);
  assert.equal(jinxNewsBriefSchema.safeParse({ ...base, sources: [{ title: "x", url: "http://example.com" }, base.sources[1]] }).success, false);
  assert.equal(jinxNewsBriefSchema.safeParse(mockJinxNewsBrief("k")).success, true);
});

test("an available brief lists dated lines with numbered sources", () => {
  const view = jinxNewsView(brief(), { loading: false, error: false, now: NOW });
  assert.equal(view.kind, "AVAILABLE");
  if (view.kind !== "AVAILABLE") return;
  assert.equal(view.items[0]!.date, newsDay("2026-11-24"));
  assert.deepEqual(view.items[0]!.sources.map((s) => [s.number, s.title]), [[2, "B"], [1, "A"]]);
  assert.equal(view.canRefresh, true);
  assert.match(view.generated ?? "", /^Taranma 22:00$/);
});

test("disabled hides the block; empty, limited and failures explain themselves", () => {
  assert.equal(jinxNewsView(brief({ status: "DISABLED", bullets: [], sources: [] }), { loading: false, error: false, now: NOW }).kind, "HIDDEN");
  assert.equal(jinxNewsView(brief({ status: "SKIPPED", bullets: [], sources: [] }), { loading: false, error: false, now: NOW }).kind, "HIDDEN");
  assert.equal(jinxNewsView(undefined, { loading: false, error: false, now: NOW }).kind, "HIDDEN");
  assert.equal(jinxNewsView(undefined, { loading: true, error: false, now: NOW }).kind, "LOADING");
  assert.equal(jinxNewsView(undefined, { loading: false, error: true, now: NOW }).kind, "FAILED");
  const empty = jinxNewsView(brief({ status: "NO_RECENT_NEWS", bullets: [], sources: [] }), { loading: false, error: false, now: NOW });
  assert.equal(empty.kind, "EMPTY");
  const limited = jinxNewsView(brief({ status: "LIMITED", bullets: [], sources: [], refreshAvailableAt: undefined }), { loading: false, error: false, now: NOW });
  assert.equal(limited.kind === "LIMITED" && limited.canRefresh, false);
  const spaced = jinxNewsView(brief({ refreshAvailableAt: "2026-11-25T20:30:00Z" }), { loading: false, error: false, now: NOW });
  assert.equal(spaced.kind === "AVAILABLE" && spaced.canRefresh, false);
});
