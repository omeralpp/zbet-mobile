package expo.modules.btbwidget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.text.format.DateFormat;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Locale;

public class BtbPerformanceWidgetProvider extends AppWidgetProvider {
    private static final String PREFERENCES = "btb_next_performance_widget";
    private static final String KEY_HAS_TOTO = "has_toto";
    private static final String KEY_TOTO_HITS = "toto_hits";
    private static final String KEY_TOTO_TOTAL = "toto_total";
    private static final String KEY_TOTO_GC_NO = "toto_gc_no";
    private static final String KEY_TOTO_VERSION = "toto_version";
    private static final String KEY_HAS_SUPER = "has_super";
    private static final String KEY_SUPER_MIN_RATING = "super_min_rating";
    private static final String KEY_SUPER_WINS = "super_wins";
    private static final String KEY_SUPER_LOSSES = "super_losses";
    private static final String KEY_SUPER_PROFIT = "super_profit";
    private static final String KEY_SUPER_UPDATED_AT = "super_updated_at";
    private static final String KEY_UPDATED_AT = "updated_at";

    @Override
    public void onUpdate(
            Context context,
            AppWidgetManager appWidgetManager,
            int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            appWidgetManager.updateAppWidget(appWidgetId, createViews(context));
        }
    }

    @Override
    public void onEnabled(Context context) {
        updateAllWidgets(context);
    }

    public static void storeAndUpdate(Context context, JSONObject payload) {
        if (payload == null) {
            return;
        }

        SharedPreferences.Editor editor = context
                .getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
                .edit();
        boolean changed = false;

        Integer totoHits = parseNonNegativeInteger(
                payload.opt("toto_coverage_hits"));
        Integer totoTotal = parseNonNegativeInteger(
                payload.opt("toto_coverage_total"));
        Integer totoGcNo = parseNonNegativeInteger(
                payload.opt("toto_program_gc_no"));
        Integer totoVersion = parseNonNegativeInteger(
                payload.opt("toto_program_version"));

        if (totoHits != null && totoTotal != null && totoHits <= totoTotal) {
            editor.putBoolean(KEY_HAS_TOTO, true);
            editor.putInt(KEY_TOTO_HITS, totoHits);
            editor.putInt(KEY_TOTO_TOTAL, totoTotal);
            if (totoGcNo != null && totoGcNo > 0 &&
                    totoVersion != null && totoVersion > 0) {
                editor.putInt(KEY_TOTO_GC_NO, totoGcNo);
                editor.putInt(KEY_TOTO_VERSION, totoVersion);
            } else {
                editor.remove(KEY_TOTO_GC_NO);
                editor.remove(KEY_TOTO_VERSION);
            }
            changed = true;
        }

        boolean rebuild = "BTB_RB1_20261018".equals(payload.optString("super_model_regime"));
        if (rebuild) {
            editor.putString("super_model_regime", "BTB_RB1_20261018");
            editor.putInt("super_days", payload.optInt("super_days", 7));
            editor.putInt("super_pending", payload.optInt("super_pending", 0));
            editor.putInt("super_unresolved", payload.optInt("super_unresolved", 0));
            editor.putInt("super_voids", payload.optInt("super_voids", 0));
            if (!payload.optBoolean("super_available", false)) editor.putBoolean(KEY_HAS_SUPER, false);
            changed = true;
        }
        Integer minRating = parseNonNegativeInteger(
                payload.opt("super_min_rating"));
        boolean hasSuperThreshold =
                minRating != null && minRating >= 1 && minRating <= 5;
        Integer superWins = hasSuperThreshold
                ? parseSuperCount(payload.opt("super_wins"))
                : null;
        Integer superLosses = hasSuperThreshold
                ? parseSuperCount(payload.opt("super_losses"))
                : null;
        BigDecimal superProfit = hasSuperThreshold
                ? parseSuperProfit(payload.opt("super_profit"))
                : null;

        if ((!rebuild || payload.optBoolean("super_available", false)) && hasSuperThreshold &&
                superWins != null &&
                superLosses != null &&
                superProfit != null) {
            long now = System.currentTimeMillis();
            editor.putBoolean(KEY_HAS_SUPER, true);
            editor.putInt(KEY_SUPER_MIN_RATING, minRating);
            editor.putInt(KEY_SUPER_WINS, superWins);
            editor.putInt(KEY_SUPER_LOSSES, superLosses);
            editor.putString(KEY_SUPER_PROFIT, superProfit.toPlainString());
            editor.putLong(KEY_SUPER_UPDATED_AT, now);
            changed = true;
        }

        if (!changed) {
            return;
        }

        editor.putLong(KEY_UPDATED_AT, System.currentTimeMillis()).apply();
        updateAllWidgets(context);
    }

    public static void clearStoredData(Context context) {
        context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
                .edit()
                .clear()
                .apply();
        updateAllWidgets(context);
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName provider =
                new ComponentName(context, BtbPerformanceWidgetProvider.class);
        for (int widgetId : manager.getAppWidgetIds(provider)) {
            manager.updateAppWidget(widgetId, createViews(context));
        }
    }

    private static RemoteViews createViews(Context context) {
        SharedPreferences preferences =
                context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
        boolean hasToto = preferences.getBoolean(KEY_HAS_TOTO, false);
        int totoHits = preferences.getInt(KEY_TOTO_HITS, 0);
        int totoTotal = preferences.getInt(KEY_TOTO_TOTAL, 0);
        int totoGcNo = preferences.getInt(KEY_TOTO_GC_NO, 0);
        int totoVersion = preferences.getInt(KEY_TOTO_VERSION, 0);
        boolean hasSuper = preferences.getBoolean(KEY_HAS_SUPER, false);
        int minRating = preferences.getInt(KEY_SUPER_MIN_RATING, 0);
        int superWins = preferences.getInt(KEY_SUPER_WINS, 0);
        int superLosses = preferences.getInt(KEY_SUPER_LOSSES, 0);
        BigDecimal superProfit = parseDecimal(
                preferences.getString(KEY_SUPER_PROFIT, ""));
        long superUpdatedAt = preferences.getLong(KEY_SUPER_UPDATED_AT, 0);
        long updatedAt = preferences.getLong(KEY_UPDATED_AT, 0);

        RemoteViews views = new RemoteViews(
                context.getPackageName(),
                R.layout.btb_performance_widget);
        BtbWidgetTheme.Palette palette = BtbWidgetTheme.resolve(context);
        views.setInt(
                R.id.btb_kpi_widget_root,
                "setBackgroundResource",
                palette.backgroundDrawable);
        views.setImageViewResource(
                R.id.btb_kpi_app_icon,
                context.getApplicationInfo().icon);

        // v40 board: each column is one large figure over a bar. Toto shows
        // the covered results of the last resulted program; the right column
        // is the RB1 report's seven days (the A3 daily profit is retired).
        boolean totoReady = hasToto && totoTotal > 0;
        String coverageValue = totoReady ? String.valueOf(totoHits) : "—";
        String coverageDetail = totoReady
                ? (totoGcNo > 0 ? "Program " + totoGcNo + " · " : "")
                        + totoHits + " / " + totoTotal + " sonuç kapsandı"
                : context.getString(R.string.btb_kpi_waiting);

        BigDecimal safeProfit =
                superProfit == null ? BigDecimal.ZERO : superProfit;
        String profitValue = hasSuper ? formatProfit(safeProfit) : "—";
        int superDays = preferences.getInt("super_days", 7);
        String superLabel = "BTB · " + (superDays == 1 ? "BUGÜN" : superDays + " GÜN")
                + (hasSuper && minRating > 0 ? " · " + minRating + "+ YILDIZ" : "");
        String superDetail = (hasSuper
                ? superWins + " kazandı · " + superLosses + " kaybetti"
                : "Sonuç bekleniyor")
                + " · " + preferences.getInt("super_pending", 0) + " bekleyen";
        int profitColor = safeProfit.signum() > 0
                ? palette.success
                : safeProfit.signum() < 0 ? palette.error : palette.text;

        views.setTextViewText(R.id.btb_kpi_toto_value, coverageValue);
        views.setTextColor(R.id.btb_kpi_toto_value, totoReady ? palette.blue : palette.muted);
        views.setImageViewBitmap(
                R.id.btb_kpi_toto_chart,
                createBar(
                        context,
                        totoReady ? totoHits : 0,
                        0,
                        totoReady ? Math.max(totoTotal - totoHits, 0) : 1,
                        palette.blue,
                        palette.error,
                        palette.track));
        views.setTextViewText(
                R.id.btb_kpi_toto_label,
                context.getString(R.string.btb_kpi_toto_title));
        views.setTextViewText(R.id.btb_kpi_toto_detail, coverageDetail);

        views.setTextViewText(R.id.btb_kpi_super_value, profitValue);
        views.setTextColor(R.id.btb_kpi_super_value, hasSuper ? profitColor : palette.muted);
        views.setImageViewBitmap(
                R.id.btb_kpi_super_chart,
                createBar(
                        context,
                        hasSuper ? superWins : 0,
                        hasSuper ? superLosses : 0,
                        hasSuper ? 0 : 1,
                        palette.success,
                        palette.error,
                        palette.track));
        views.setTextViewText(R.id.btb_kpi_super_label, superLabel);
        views.setTextViewText(R.id.btb_kpi_super_detail, superDetail);
        views.setTextViewText(
                R.id.btb_kpi_updated,
                (superUpdatedAt > 0 ? superUpdatedAt : updatedAt) > 0
                        ? context.getString(
                                R.string.btb_widget_updated,
                                DateFormat.getTimeFormat(context).format(
                                        new Date(
                                                superUpdatedAt > 0
                                                        ? superUpdatedAt
                                                        : updatedAt)))
                        : context.getString(R.string.btb_widget_ready));
        views.setTextColor(R.id.btb_kpi_title, palette.text);
        views.setTextColor(R.id.btb_kpi_updated, palette.subtle);
        views.setTextColor(R.id.btb_kpi_toto_label, palette.muted);
        views.setTextColor(R.id.btb_kpi_toto_detail, palette.muted);
        views.setTextColor(R.id.btb_kpi_super_label, palette.muted);
        views.setTextColor(R.id.btb_kpi_super_detail, palette.muted);
        views.setInt(R.id.btb_kpi_divider, "setBackgroundColor", palette.track);

        views.setOnClickPendingIntent(
                R.id.btb_kpi_widget_root,
                BtbNotificationWidgetProvider.createOpenIntent(
                        context,
                        BtbNotificationWidgetProvider.routeUri("home"),
                        5200));
        views.setOnClickPendingIntent(
                R.id.btb_kpi_toto,
                BtbNotificationWidgetProvider.createOpenIntent(
                        context,
                        BtbNotificationWidgetProvider.buildTargetUri(
                                "toto",
                                "",
                                "",
                                "",
                                totoGcNo > 0 ? String.valueOf(totoGcNo) : "",
                                totoVersion > 0 ? String.valueOf(totoVersion) : ""),
                        5201));
        views.setOnClickPendingIntent(
                R.id.btb_kpi_super,
                BtbNotificationWidgetProvider.createOpenIntent(
                        context,
                        BtbNotificationWidgetProvider.routeUri("super"),
                        5202));
        return views;
    }

    /**
     * The board's thin bar under a figure: the first part, an optional second
     * part (losses) and the rest of the track, as one rounded strip.
     */
    private static Bitmap createBar(
            Context context,
            int first,
            int second,
            int rest,
            int firstColor,
            int secondColor,
            int trackColor) {
        int width = dpToPx(context, 160);
        int height = dpToPx(context, 6);
        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        float radius = height / 2f;
        paint.setColor(trackColor);
        canvas.drawRoundRect(new RectF(0, 0, width, height), radius, radius, paint);
        int total = Math.max(first, 0) + Math.max(second, 0) + Math.max(rest, 0);
        if (total <= 0) {
            return bitmap;
        }
        float firstWidth = width * Math.max(first, 0) / (float) total;
        float secondWidth = width * Math.max(second, 0) / (float) total;
        if (firstWidth > 0) {
            paint.setColor(firstColor);
            canvas.drawRoundRect(new RectF(0, 0, firstWidth, height), radius, radius, paint);
        }
        if (secondWidth > 0) {
            paint.setColor(secondColor);
            canvas.drawRoundRect(
                    new RectF(firstWidth, 0, firstWidth + secondWidth, height),
                    radius,
                    radius,
                    paint);
        }
        return bitmap;
    }

    /** Hypothetical units with a Turkish decimal comma, as the app prints them. */
    private static String formatProfit(BigDecimal value) {
        Locale turkish = new Locale("tr", "TR");
        double number = value.doubleValue();
        double absolute = Math.abs(number);
        if (absolute >= 1000) {
            return String.format(turkish, "%+.1fk", number / 1000d);
        }
        if (number > 0) {
            return String.format(turkish, "+%.2f", number);
        }
        return String.format(turkish, "%.2f", number);
    }

    private static Integer parseNonNegativeInteger(Object value) {
        if (value instanceof Number) {
            double number = ((Number) value).doubleValue();
            if (
                    Double.isFinite(number) &&
                    number >= 0 &&
                    number <= Integer.MAX_VALUE &&
                    Math.rint(number) == number) {
                return (int) number;
            }
            return null;
        }

        try {
            int number = Integer.parseInt(valueText(value));
            return number >= 0 ? number : null;
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private static BigDecimal parseDecimal(Object value) {
        if (value instanceof Number) {
            double number = ((Number) value).doubleValue();
            return Double.isFinite(number)
                    ? BigDecimal.valueOf(number)
                    : null;
        }

        try {
            return new BigDecimal(valueText(value));
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private static Integer parseSuperCount(Object value) {
        return valueText(value).isEmpty()
                ? 0
                : parseNonNegativeInteger(value);
    }

    private static BigDecimal parseSuperProfit(Object value) {
        return valueText(value).isEmpty()
                ? BigDecimal.ZERO
                : parseDecimal(value);
    }

    private static String valueText(Object value) {
        return value == null || JSONObject.NULL.equals(value)
                ? ""
                : String.valueOf(value).trim();
    }

    private static int dpToPx(Context context, int value) {
        return Math.max(
                1,
                Math.round(
                        value *
                        context.getResources().getDisplayMetrics().density));
    }
}
