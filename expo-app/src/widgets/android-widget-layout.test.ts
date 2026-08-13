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

test("iki Android widgetı ortak light dark tema resolverını kullanır", async () => {
  const root = "../../modules/btb-widget/android/src/main/";
  const [theme, module, notification, performance] = await Promise.all([
    readFile(new URL(`${root}java/expo/modules/btbwidget/BtbWidgetTheme.java`, import.meta.url), "utf8"),
    readFile(new URL(`${root}java/expo/modules/btbwidget/BtbWidgetModule.kt`, import.meta.url), "utf8"),
    readFile(new URL(`${root}java/expo/modules/btbwidget/BtbNotificationWidgetProvider.java`, import.meta.url), "utf8"),
    readFile(new URL(`${root}java/expo/modules/btbwidget/BtbPerformanceWidgetProvider.java`, import.meta.url), "utf8")
  ]);

  assert.match(theme, /btb_next_widget_theme/);
  assert.match(theme, /Palette light\(\)/);
  assert.match(theme, /Palette dark\(\)/);
  assert.match(module, /AsyncFunction\("setTheme"\)/);
  assert.match(notification, /BtbWidgetTheme\.resolve/);
  assert.match(performance, /BtbWidgetTheme\.resolve/);
});
