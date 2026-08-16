import assert from "node:assert/strict";
import test from "node:test";
import {
  fioriTargetTitle,
  resolveFioriTargetUrl
} from "./fiori-target";

const launchpad = "https://example.test/site?siteId=btb";
const misconfiguredLaunchpad = `${launchpad}#Shell-home`;

function hashCount(url: string): number {
  return (url.match(/#/g) ?? []).length;
}

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

test("Fiori çerçevesi dokunulan Super kararını kendi nesne sayfasına yönlendirir", () => {
  const url = resolveFioriTargetUrl(launchpad, {
    target: "super",
    superKey: {
      matchDate: "2026-07-29",
      matchId: 472910,
      elapsed: 67,
      selectedOdd: "Ms1X",
      rating: 4,
      reason: "SCORE_CHANGED / HOME"
    }
  });
  assert.match(url, /#SuperLog-display/);
  assert.match(url, /id=472910/);
  assert.equal(fioriTargetTitle("super"), "Fiori Super kararı");
});

test("Fiori çerçevesi hedef verilmeden Work Zone ana sayfasına döner ve tek # üretir", () => {
  const url = resolveFioriTargetUrl(launchpad, { target: "launchpad" });
  assert.equal(url, `${launchpad}#Shell-home`);
  assert.equal(hashCount(url), 1);
});

test("configured launchpad URL zaten #Shell-home taşısa bile hiçbir hedef çift # üretmez", () => {
  const home = resolveFioriTargetUrl(misconfiguredLaunchpad, {
    target: "launchpad"
  });
  const match = resolveFioriTargetUrl(misconfiguredLaunchpad, {
    target: "match",
    matchKey: "2026-07-28:472910:20:45:00"
  });
  const toto = resolveFioriTargetUrl(misconfiguredLaunchpad, {
    target: "toto",
    gcNo: 350,
    version: 1
  });
  const superDecision = resolveFioriTargetUrl(misconfiguredLaunchpad, {
    target: "super",
    superKey: {
      matchDate: "2026-07-29",
      matchId: 472910,
      elapsed: 67,
      selectedOdd: "Ms1X",
      rating: 4,
      reason: "SCORE_CHANGED / HOME"
    }
  });

  for (const url of [home, match, toto, superDecision]) {
    assert.equal(hashCount(url), 1);
    assert.doesNotMatch(url, /#Shell-home#/);
  }
});
