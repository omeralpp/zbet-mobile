import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveAndroidBackAction,
  resolveAndroidFallbackPath
} from "./back-navigation";

test("ana sekmelerden geri dönüş önce özete gider", () => {
  assert.equal(resolveAndroidBackAction("/live", false), "home");
  assert.equal(resolveAndroidBackAction("/super", true), "home");
  assert.equal(resolveAndroidBackAction("/toto", false), "home");
  assert.equal(resolveAndroidBackAction("/more", false), "home");
});

test("detay ekranı mevcut gezinme geçmişini kullanır", () => {
  assert.equal(
    resolveAndroidBackAction("/match/123", true),
    "back"
  );
});

test("Fiori ekranı Android geri tuşunu WebView katmanına bırakır", () => {
  assert.equal(resolveAndroidBackAction("/fiori", true), "delegate");
  assert.equal(resolveAndroidBackAction("/fiori", false), "delegate");
});

test("geçmişsiz derin bağlantı güvenli biçimde özete döner", () => {
  assert.equal(
    resolveAndroidBackAction("/match/123", false),
    "home"
  );
});

test("maç detayı geçmişsiz kalırsa geldiği uygulama ekranına döner", () => {
  assert.equal(
    resolveAndroidFallbackPath("/match/123", "/super"),
    "/super"
  );
  assert.equal(
    resolveAndroidFallbackPath("/match/123", "/live"),
    "/live"
  );
  assert.equal(
    resolveAndroidFallbackPath("/match/123", "/unknown"),
    "/"
  );
  assert.equal(
    resolveAndroidFallbackPath("/toto/350/1", "/"),
    "/toto"
  );
});

test("uygulama yalnızca kök ekranlarda çıkış onayı ister", () => {
  assert.equal(resolveAndroidBackAction("/", false), "confirm-exit");
  assert.equal(
    resolveAndroidBackAction("/sign-in", false),
    "confirm-exit"
  );
});
