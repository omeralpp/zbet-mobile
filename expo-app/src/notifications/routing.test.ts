import assert from "node:assert/strict";
import test from "node:test";
import { notificationDataToPath } from "./routing";

test("routes complete BTB match keys to the native match screen", () => {
  assert.equal(
    notificationDataToPath({
      match_id: "472910",
      match_date: "20260728",
      match_time: "204500"
    }),
    "/match/2026-07-28%3A472910%3A20%3A45%3A00"
  );
});

test("routes Toto program keys to the native program screen", () => {
  assert.equal(
    notificationDataToPath({
      toto_program_gc_no: 350,
      toto_program_version: 1
    }),
    "/toto/350/1"
  );
});

test("keeps legacy Super and BTB route semantics", () => {
  assert.equal(notificationDataToPath({ route: "SCLEAR" }), "/super");
  assert.equal(notificationDataToPath({ route: "live" }), "/live");
  assert.equal(notificationDataToPath({ route: "toto" }), "/toto");
});

test("falls back to the dashboard for unsupported payloads", () => {
  assert.equal(notificationDataToPath({ route: "unknown" }), "/");
});
