package expo.modules.btbwidget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.text.format.DateFormat;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.math.BigDecimal;
import java.util.Calendar;
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

    private static final int COLOR_SUCCESS = Color.rgb(98, 230, 109);
    private static final int COLOR_ERROR = Color.rgb(255, 101, 115);
    private static final int COLOR_TRACK = Color.rgb(23, 59, 89);
    private static final int COLOR_TEXT = Color.WHITE;
    private static final int COLOR_MUTED = Color.rgb(148, 169, 188);

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
                payload.optString("toto_coverage_hits", ""));
        Integer totoTotal = parseNonNegativeInteger(
                payload.optString("toto_coverage_total", ""));
        Integer totoGcNo = parseNonNegativeInteger(
                payload.optString("toto_program_gc_no", ""));
        Integer totoVersion = parseNonNegativeInteger(
                payload.optString("toto_program_version", ""));

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

        Integer minRating = parseNonNegativeInteger(
                payload.optString("super_min_rating", ""));
        boolean hasSuperThreshold =
                minRating != null && minRating >= 1 && minRating <= 5;
        Integer superWins = hasSuperThreshold
                ? parseSuperCount(payload.optString("super_wins", ""))
                : null;
        Integer superLosses = hasSuperThreshold
                ? parseSuperCount(payload.optString("super_losses", ""))
                : null;
        BigDecimal superProfit = hasSuperThreshold
                ? parseSuperProfit(payload.optString("super_profit", ""))
                : null;

        if (hasSuperThreshold &&
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

        if (hasSuper &&
                !isSameLocalDay(superUpdatedAt, System.currentTimeMillis())) {
            superWins = 0;
            superLosses = 0;
            superProfit = BigDecimal.ZERO;
        }

        RemoteViews views = new RemoteViews(
                context.getPackageName(),
                R.layout.btb_performance_widget);

        int coveragePercent = totoTotal > 0
                ? Math.round((totoHits * 100f) / totoTotal)
                : 0;
        String coverageValue = hasToto && totoTotal > 0
                ? coveragePercent + "%"
                : "--";
        String coverageDetail = hasToto && totoTotal > 0
                ? totoHits + "/" + totoTotal + " kapsadı"
                : context.getString(R.string.btb_kpi_waiting);

        BigDecimal safeProfit =
                superProfit == null ? BigDecimal.ZERO : superProfit;
        String profitValue = hasSuper ? formatProfit(safeProfit) : "--";
        String superLabel = hasSuper
                ? getStars(minRating) + "+ Profit"
                : context.getString(R.string.btb_kpi_super_title);
        String superDetail = hasSuper
                ? superWins + " kazandı · " + superLosses + " kaybetti"
                : context.getString(R.string.btb_kpi_waiting);
        int profitColor = safeProfit.signum() > 0
                ? COLOR_SUCCESS
                : safeProfit.signum() < 0 ? COLOR_ERROR : COLOR_MUTED;

        views.setImageViewBitmap(
                R.id.btb_kpi_toto_chart,
                createDonut(
                        context,
                        totoHits,
                        Math.max(totoTotal - totoHits, 0),
                        coverageValue,
                        hasToto && totoTotal > 0 ? COLOR_TEXT : COLOR_MUTED));
        views.setTextViewText(
                R.id.btb_kpi_toto_label,
                context.getString(R.string.btb_kpi_toto_title));
        views.setTextViewText(R.id.btb_kpi_toto_detail, coverageDetail);

        views.setImageViewBitmap(
                R.id.btb_kpi_super_chart,
                createDonut(
                        context,
                        superWins,
                        superLosses,
                        profitValue,
                        hasSuper ? profitColor : COLOR_MUTED));
        views.setTextViewText(R.id.btb_kpi_super_label, superLabel);
        views.setTextViewText(R.id.btb_kpi_super_detail, superDetail);
        views.setTextViewText(
                R.id.btb_kpi_updated,
                updatedAt > 0
                        ? context.getString(
                                R.string.btb_widget_updated,
                                DateFormat.getTimeFormat(context).format(
                                        new Date(updatedAt)))
                        : context.getString(R.string.btb_widget_ready));

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

    private static Bitmap createDonut(
            Context context,
            int primaryValue,
            int secondaryValue,
            String centerText,
            int centerColor) {
        int size = dpToPx(context, 88);
        float strokeWidth = dpToPx(context, 10);
        float inset = strokeWidth / 2f + dpToPx(context, 3);
        Bitmap bitmap = Bitmap.createBitmap(
                size,
                size,
                Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        Paint ring = new Paint(Paint.ANTI_ALIAS_FLAG);
        RectF bounds = new RectF(inset, inset, size - inset, size - inset);

        ring.setStyle(Paint.Style.STROKE);
        ring.setStrokeWidth(strokeWidth);
        ring.setStrokeCap(Paint.Cap.BUTT);
        ring.setColor(COLOR_TRACK);
        canvas.drawArc(bounds, -90f, 360f, false, ring);

        int total = Math.max(primaryValue, 0) + Math.max(secondaryValue, 0);
        if (total > 0) {
            float primarySweep =
                    360f * Math.max(primaryValue, 0) / total;
            ring.setColor(COLOR_SUCCESS);
            canvas.drawArc(bounds, -90f, primarySweep, false, ring);
            if (secondaryValue > 0) {
                ring.setColor(COLOR_ERROR);
                canvas.drawArc(
                        bounds,
                        -90f + primarySweep,
                        360f - primarySweep,
                        false,
                        ring);
            }
        }

        Paint text = new Paint(Paint.ANTI_ALIAS_FLAG);
        text.setColor(centerColor);
        text.setTextAlign(Paint.Align.CENTER);
        text.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
        text.setTextSize(spToPx(context, centerText.length() > 6 ? 13 : 17));
        Paint.FontMetrics metrics = text.getFontMetrics();
        float textY = size / 2f -
                (metrics.ascent + metrics.descent) / 2f;
        canvas.drawText(centerText, size / 2f, textY, text);
        return bitmap;
    }

    private static String formatProfit(BigDecimal value) {
        double number = value.doubleValue();
        double absolute = Math.abs(number);
        if (absolute >= 1000) {
            return String.format(Locale.US, "%+.1fk", number / 1000d);
        }
        if (number > 0) {
            return String.format(Locale.US, "+%.2f", number);
        }
        return String.format(Locale.US, "%.2f", number);
    }

    private static String getStars(int rating) {
        StringBuilder stars = new StringBuilder();
        for (int index = 0; index < rating; index += 1) {
            stars.append('\u2605');
        }
        return stars.toString();
    }

    private static Integer parseNonNegativeInteger(String value) {
        try {
            int number = Integer.parseInt(value == null ? "" : value.trim());
            return number >= 0 ? number : null;
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private static BigDecimal parseDecimal(String value) {
        try {
            return new BigDecimal(value == null ? "" : value.trim());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private static Integer parseSuperCount(String value) {
        String text = value == null ? "" : value.trim();
        return text.isEmpty() ? 0 : parseNonNegativeInteger(text);
    }

    private static BigDecimal parseSuperProfit(String value) {
        String text = value == null ? "" : value.trim();
        return text.isEmpty() ? BigDecimal.ZERO : parseDecimal(text);
    }

    private static boolean isSameLocalDay(long first, long second) {
        if (first <= 0 || second <= 0) {
            return false;
        }
        Calendar firstDay = Calendar.getInstance();
        firstDay.setTimeInMillis(first);
        Calendar secondDay = Calendar.getInstance();
        secondDay.setTimeInMillis(second);
        return firstDay.get(Calendar.ERA) == secondDay.get(Calendar.ERA) &&
                firstDay.get(Calendar.YEAR) == secondDay.get(Calendar.YEAR) &&
                firstDay.get(Calendar.DAY_OF_YEAR) ==
                        secondDay.get(Calendar.DAY_OF_YEAR);
    }

    private static int dpToPx(Context context, int value) {
        return Math.max(
                1,
                Math.round(
                        value *
                        context.getResources().getDisplayMetrics().density));
    }

    private static float spToPx(Context context, int value) {
        return value *
                context.getResources().getDisplayMetrics().scaledDensity;
    }
}
