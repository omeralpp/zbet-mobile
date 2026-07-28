import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Performans widgetı yalnız RemoteViews uyumlu layout bileşenleri kullanır", async () => {
  const layoutPath = new URL(
    "../../modules/btb-widget/android/src/main/res/layout/btb_performance_widget.xml",
    import.meta.url
  );
  const layout = await readFile(layoutPath, "utf8");

  assert.doesNotMatch(layout, /<View(?:\s|>)/);
  assert.match(layout, /<LinearLayout/);
  assert.match(layout, /<ImageView/);
  assert.match(layout, /<TextView/);
});
