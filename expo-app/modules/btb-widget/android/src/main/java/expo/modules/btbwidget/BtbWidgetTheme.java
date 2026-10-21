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

    /**
     * The app's v40 tokens (src/theme/experience-palette.ts) so a widget reads
     * as part of BTB in both themes: ink, muted ink, gold, the soft track,
     * the accent and loss colours, the analytical blue and the ink on accent.
     */
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
        final int blue;
        final int onAccent;

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
                int error,
                int blue,
                int onAccent) {
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
            this.blue = blue;
            this.onAccent = onAccent;
        }

        static Palette dark() {
            return new Palette(
                    R.drawable.btb_widget_background,
                    R.drawable.btb_widget_secondary_button,
                    R.drawable.btb_widget_primary_button,
                    Color.rgb(247, 245, 236),
                    Color.rgb(182, 202, 212),
                    Color.rgb(182, 202, 212),
                    Color.rgb(255, 200, 69),
                    Color.rgb(23, 53, 72),
                    Color.rgb(61, 220, 151),
                    Color.rgb(255, 92, 112),
                    Color.rgb(98, 176, 255),
                    Color.rgb(4, 40, 26));
        }

        static Palette light() {
            return new Palette(
                    R.drawable.btb_widget_background_light,
                    R.drawable.btb_widget_secondary_button_light,
                    R.drawable.btb_widget_primary_button_light,
                    Color.rgb(18, 42, 51),
                    Color.rgb(69, 92, 99),
                    Color.rgb(69, 92, 99),
                    Color.rgb(122, 84, 10),
                    Color.rgb(229, 239, 234),
                    Color.rgb(11, 106, 75),
                    Color.rgb(190, 40, 67),
                    Color.rgb(28, 93, 166),
                    Color.rgb(255, 255, 255));
        }
    }
}
