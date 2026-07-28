import assert from "node:assert/strict";
import test from "node:test";
import {
  fioriTargetTitle,
  resolveFioriTargetUrl
} from "./fiori-target";

const launchpad = "https://example.test/site?siteId=btb";

test("Fiori çerçevesi maç hedefini mevcut nesne sayfasına yönlendirir", () => {
  const url = resolveFioriTargetUrl(launchpad, {
    target: "match",
    matchKey: "2026-07-28:472910:20:45:00"
  });
  assert.match(url, /#btb-manage/);
  assert.match(url, /id=472910/);
});

test("Fiori çerçevesi Toto hedefini program nesne sayfasına yönlendirir", () => {
  const url = resolveFioriTargetUrl(launchpad, {
    target: "toto",
    gcNo: 350,
    version: 1
  });
  assert.match(url, /#SporToto-manage/);
  assert.match(url, /Programs\(gc_no=350,version_no=1\)/);
  assert.equal(fioriTargetTitle("toto"), "Fiori Toto programı");
});
