import assert from "node:assert/strict";
import test from "node:test";
import { QueryClient } from "@tanstack/react-query";
import { totoQueryView } from "./toto-query-view";

test("a failed Toto refresh retains the exact previously received evidence and its receipt time", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const queryKey = ["toto-ux-regression"];
  const data = { program: 364, predictions: [{ mainPick: "1", result: "MAIN_HIT" }] };
  client.setQueryData(queryKey, data, { updatedAt: 1_793_184_000_000 });
  try {
    await client.fetchQuery({ queryKey, queryFn: async () => { throw { status: 503 }; }, staleTime: 0 });
  } catch { /* The rejected request is the failed-refresh scenario. */ }
  const state = client.getQueryState<typeof data>(queryKey)!;
  const view = totoQueryView({ data: state.data, dataUpdatedAt: state.dataUpdatedAt, isLoading: false, isError: state.status === "error", error: state.error });
  assert.equal(view.kind, "retained");
  if (view.kind === "retained") {
    assert.equal(view.data, data);
    assert.equal(view.receivedAt, 1_793_184_000_000);
  }
  client.clear();
});

test("initial loading and initial failure never present an invented empty program list", () => {
  const query = { data: undefined, dataUpdatedAt: 0, isLoading: true, isError: false, error: null };
  assert.equal(totoQueryView(query).kind, "loading");
  assert.equal(totoQueryView({ ...query, isLoading: false, isError: true, error: { status: 503 } }).kind, "unavailable");
  assert.equal(totoQueryView({ ...query, data: [], isLoading: false }).kind, "current");
  assert.equal(totoQueryView({ ...query, data: [], isLoading: false, isError: true }).kind, "retained");
});

test("access loss and an authoritative missing record suppress cached Toto evidence", () => {
  const query = { data: { program: 364 }, dataUpdatedAt: 1, isLoading: false, isError: true, error: null as unknown };
  for (const status of [401, 403, 404]) assert.equal(totoQueryView({ ...query, error: { status } }).kind, "unavailable");
});

test("successful recovery restores current data and clears the retained state", () => {
  const query = { data: { program: 364, settled: 15 }, dataUpdatedAt: 2, isLoading: false, isError: false, error: null };
  assert.deepEqual(totoQueryView(query), { kind: "current", data: query.data, receivedAt: 2 });
});
