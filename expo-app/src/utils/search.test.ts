import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSearchText, searchTextScore } from "./search";

test("Turkish keyboard variants, casing and composed/decomposed accents match anywhere", () => {
  for (const query of ["BESIK", "beşik", "BeSİK", "%şik%"]) {
    assert.equal(searchTextScore("Beşiktaş – Göztepe, Süper Lig", query), 0);
  }
  for (const query of ["göz", "goz", "GÖZ", "go\u0308z"]) {
    assert.equal(searchTextScore("Beşiktaş – Göztepe", query), 0);
  }
  assert.equal(searchTextScore("MKE Ankaragücü", "GÜCÜ"), 0);
  assert.equal(searchTextScore("Üsküdar İSTANBUL", "uskudar istanbul"), 0);
  assert.equal(normalizeSearchText("I İ ı i"), "i i i i");
});

test("all words are required, exact results beat typos and short queries do not overmatch", () => {
  assert.equal(searchTextScore("Göztepe – Beşiktaş Süper Lig", "besik goz"), 1);
  assert.equal(searchTextScore("Göztepe", "besik goz"), null);
  assert.ok(searchTextScore("Benevento", "benevnto")! > searchTextScore("Benevnto", "benevnto")!);
  assert.notEqual(searchTextScore("Almeria", "almeira"), null);
  assert.equal(searchTextScore("Roma", "rmo"), null);
  assert.equal(searchTextScore("Benevento", "xyzabc"), null);
  assert.equal(searchTextScore("anything", "  %  "), 0);
});
