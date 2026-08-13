package expo.modules.btbwidget;

import android.content.Context;
import android.graphics.Color;

final class BtbWidgetTheme {
    private static final String PREFERENCES = "btb_next_widget_theme";
    private static final String KEY_MODE = "mode";
    private static final String LIGHT = "light";

    private BtbWidgetTheme() {}

    static void setTheme(Context context, String mode) {
        context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_MODE, LIGHT.equals(mode) ? LIGHT : "dark")
                .apply();
        BtbNotificationWidgetProvider.updateAllWidgets(context);
        BtbPerformanceWidgetProvider.updateAllWidgets(context);
    }

    static Palette resolve(Context context) {
        String mode = context
                .getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
                .getString(KEY_MODE, "dark");
        return LIGHT.equals(mode) ? Palette.light() : Palette.dark();
    }

    static final class Palette {
        final int backgroundDrawable;
        final int secondaryButtonDrawable;
        final int primaryButtonDrawable;
        final int text;
        final int muted;
        final int subtle;
        final int gold;
        final int track;
        final int success;
        final int error;

        private Palette(
                int backgroundDrawable,
                int secondaryButtonDrawable,
                int primaryButtonDrawable,
                int text,
                int muted,
                int subtle,
                int gold,
                int track,
                int success,
                int error) {
            this.backgroundDrawable = backgroundDrawable;
            this.secondaryButtonDrawable = secondaryButtonDrawable;
            this.primaryButtonDrawable = primaryButtonDrawable;
            this.text = text;
            this.muted = muted;
            this.subtle = subtle;
            this.gold = gold;
            this.track = track;
            this.success = success;
            this.error = error;
        }

        static Palette dark() {
            return new Palette(
                    R.drawable.btb_widget_background,
                    R.drawable.btb_widget_secondary_button,
                    R.drawable.btb_widget_primary_button,
                    Color.rgb(244, 248, 252),
                    Color.rgb(148, 169, 188),
                    Color.rgb(110, 135, 157),
                    Color.rgb(245, 197, 66),
                    Color.rgb(23, 59, 89),
                    Color.rgb(98, 230, 109),
                    Color.rgb(255, 101, 115));
        }

        static Palette light() {
            return new Palette(
                    R.drawable.btb_widget_background_light,
                    R.drawable.btb_widget_secondary_button_light,
                    R.drawable.btb_widget_primary_button_light,
                    Color.rgb(16, 37, 56),
                    Color.rgb(77, 101, 119),
                    Color.rgb(108, 129, 144),
                    Color.rgb(155, 114, 0),
                    Color.rgb(213, 226, 234),
                    Color.rgb(25, 138, 67),
                    Color.rgb(201, 63, 81));
        }
    }
}
