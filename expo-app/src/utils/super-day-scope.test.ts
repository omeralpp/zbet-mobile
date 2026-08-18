import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultSuperDayScope,
  resolveSuperDayScope,
  superDayScopeForLabel,
  superDayScopeLabel,
  superDayScopeLabels
} from "./super-day-scope";

test("Karar Günlüğü ilk açılışta Bugün kapsamında başlar", () => {
  // The regression this file exists for. A fresh entry carries no route
  // parameter, and that has to resolve to the newest day rather than to the
  // whole history.
  assert.equal(defaultSuperDayScope, "LATEST_DAY");
  assert.equal(resolveSuperDayScope(undefined), "LATEST_DAY");
  assert.equal(resolveSuperDayScope(null), "LATEST_DAY");
  assert.equal(resolveSuperDayScope(""), "LATEST_DAY");
  assert.equal(superDayScopeLabel(defaultSuperDayScope), "Bugün");
});

test("Tüm günler yalnız açıkça seçilince gelir", () => {
  // "All days" must be an explicit value. If it were still expressed by
  // clearing the parameter it would be unreachable, because the cleared route
  // now reads back as Bugün.
  assert.equal(resolveSuperDayScope("ALL"), "ALL");
  assert.equal(superDayScopeForLabel("Tüm günler"), "ALL");
  assert.equal(superDayScopeForLabel("Bugün"), "LATEST_DAY");
});

test("mevcut LATEST_DAY derin bağlantısı aynı kapsamı açar", () => {
  // The Özet screen links into the log with this exact value.
  assert.equal(resolveSuperDayScope("LATEST_DAY"), "LATEST_DAY");
});

test("tanınmayan kapsam ekranı bozmaz, varsayılana düşer", () => {
  for (const raw of ["LIVE", "STAR", "latest_day", "all", "  ", "0"]) {
    assert.equal(resolveSuperDayScope(raw), defaultSuperDayScope, raw);
  }
});

test("Türkçe etiketler değişmedi", () => {
  assert.equal(superDayScopeLabels.LATEST_DAY, "Bugün");
  assert.equal(superDayScopeLabels.ALL, "Tüm günler");
});

test("etiket ile kapsam iki yönde de aynı eşleşmeyi verir", () => {
  for (const scope of ["LATEST_DAY", "ALL"] as const) {
    assert.equal(superDayScopeForLabel(superDayScopeLabel(scope)), scope);
  }
});
