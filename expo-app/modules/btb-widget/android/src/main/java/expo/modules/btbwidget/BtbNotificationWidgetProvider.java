package expo.modules.btbwidget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.text.format.DateFormat;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.util.Date;
import java.util.Locale;

public class BtbNotificationWidgetProvider extends AppWidgetProvider {
    private static final String PREFERENCES = "btb_next_notification_widget";
    private static final String KEY_TITLE = "title";
    private static final String KEY_BODY = "body";
    private static final String KEY_ROUTE = "route";
    private static final String KEY_RATING = "rating";
    private static final String KEY_MATCH_ID = "match_id";
    private static final String KEY_MATCH_DATE = "match_date";
    private static final String KEY_MATCH_TIME = "match_time";
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
        String title = cleanText(
                payload.optString(
                        "title",
                        context.getString(R.string.btb_widget_default_title)),
                context.getString(R.string.btb_widget_default_title));
        String body = cleanText(
                payload.optString(
                        "body",
                        context.getString(R.string.btb_widget_default_body)),
                context.getString(R.string.btb_widget_default_body));
        String route = normalizeRoute(payload.optString("route", "home"));
        int rating = payload.optInt("rating", 0);
        String matchId = cleanValue(payload.optString("match_id", ""));
        String matchDate = cleanValue(payload.optString("match_date", ""));
        String matchTime = cleanValue(payload.optString("match_time", ""));

        context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_TITLE, title)
                .putString(KEY_BODY, body)
                .putString(KEY_ROUTE, route)
                .putInt(KEY_RATING, rating >= 1 && rating <= 5 ? rating : 0)
                .putString(KEY_MATCH_ID, matchId)
                .putString(KEY_MATCH_DATE, matchDate)
                .putString(KEY_MATCH_TIME, matchTime)
                .putLong(KEY_UPDATED_AT, System.currentTimeMillis())
                .apply();

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
                new ComponentName(context, BtbNotificationWidgetProvider.class);
        for (int widgetId : manager.getAppWidgetIds(provider)) {
            manager.updateAppWidget(widgetId, createViews(context));
        }
    }

    private static RemoteViews createViews(Context context) {
        SharedPreferences preferences =
                context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
        String title = preferences.getString(
                KEY_TITLE,
                context.getString(R.string.btb_widget_default_title));
        String body = preferences.getString(
                KEY_BODY,
                context.getString(R.string.btb_widget_default_body));
        String route = normalizeRoute(preferences.getString(KEY_ROUTE, "home"));
        int rating = preferences.getInt(KEY_RATING, 0);
        String matchId = preferences.getString(KEY_MATCH_ID, "");
        String matchDate = preferences.getString(KEY_MATCH_DATE, "");
        String matchTime = preferences.getString(KEY_MATCH_TIME, "");
        long updatedAt = preferences.getLong(KEY_UPDATED_AT, 0);

        RemoteViews views = new RemoteViews(
                context.getPackageName(),
                R.layout.btb_notification_widget);
        views.setTextViewText(R.id.btb_widget_title, title);
        views.setTextViewText(R.id.btb_widget_body, body);
        views.setTextViewText(R.id.btb_widget_rating, getStars(rating));
        views.setViewVisibility(
                R.id.btb_widget_rating,
                rating >= 1 && rating <= 5 ? View.VISIBLE : View.GONE);
        views.setTextViewText(
                R.id.btb_widget_updated,
                updatedAt > 0
                        ? context.getString(
                                R.string.btb_widget_updated,
                                DateFormat.getTimeFormat(context).format(
                                        new Date(updatedAt)))
                        : context.getString(R.string.btb_widget_ready));

        Uri contentUri = buildTargetUri(
                route,
                matchId,
                matchDate,
                matchTime,
                "",
                "");
        views.setOnClickPendingIntent(
                R.id.btb_widget_root,
                createOpenIntent(context, contentUri, 5100));
        views.setOnClickPendingIntent(
                R.id.btb_widget_open,
                createOpenIntent(context, routeUri("live"), 5101));
        views.setOnClickPendingIntent(
                R.id.btb_widget_super,
                createOpenIntent(context, routeUri("super"), 5102));
        views.setOnClickPendingIntent(
                R.id.btb_widget_toto,
                createOpenIntent(context, routeUri("toto"), 5103));
        return views;
    }

    static PendingIntent createOpenIntent(
            Context context,
            Uri uri,
            int requestCode) {
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        intent.setPackage(context.getPackageName());
        intent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK |
                Intent.FLAG_ACTIVITY_CLEAR_TOP |
                Intent.FLAG_ACTIVITY_SINGLE_TOP);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getActivity(context, requestCode, intent, flags);
    }

    static Uri buildTargetUri(
            String route,
            String matchId,
            String matchDate,
            String matchTime,
            String totoGcNo,
            String totoVersion) {
        if (isPositiveInteger(matchId) &&
                isDate(matchDate) &&
                isTime(matchTime)) {
            String matchKey = matchDate + ":" + matchId + ":" + matchTime;
            return Uri.parse("btbmobile:///match/" + Uri.encode(matchKey));
        }

        if (isPositiveInteger(totoGcNo) && isPositiveInteger(totoVersion)) {
            return Uri.parse(
                    "btbmobile:///toto/" +
                    Uri.encode(totoGcNo) +
                    "/" +
                    Uri.encode(totoVersion));
        }

        return routeUri(normalizeRoute(route));
    }

    static Uri routeUri(String route) {
        String normalized = normalizeRoute(route);
        if ("btb".equals(normalized) || "live".equals(normalized)) {
            return Uri.parse("btbmobile:///live");
        }
        if ("super".equals(normalized)) {
            return Uri.parse("btbmobile:///super");
        }
        if ("toto".equals(normalized)) {
            return Uri.parse("btbmobile:///toto");
        }
        return Uri.parse("btbmobile:///");
    }

    static String normalizeRoute(String route) {
        String normalized = cleanValue(route).toLowerCase(Locale.ROOT);
        if ("super".equals(normalized) ||
                "superlog".equals(normalized) ||
                "super-log".equals(normalized) ||
                "sclear".equals(normalized)) {
            return "super";
        }
        if ("btb".equals(normalized) ||
                "main".equals(normalized) ||
                "live".equals(normalized)) {
            return "btb";
        }
        if ("toto".equals(normalized) ||
                "sportoto".equals(normalized) ||
                "spor-toto".equals(normalized)) {
            return "toto";
        }
        return "home";
    }

    private static String getStars(int rating) {
        if (rating < 1 || rating > 5) {
            return "";
        }
        StringBuilder stars = new StringBuilder();
        for (int index = 0; index < rating; index += 1) {
            stars.append('\u2605');
        }
        return stars.toString();
    }

    private static boolean isPositiveInteger(String value) {
        try {
            return Integer.parseInt(cleanValue(value)) > 0;
        } catch (NumberFormatException ignored) {
            return false;
        }
    }

    private static boolean isDate(String value) {
        return cleanValue(value).matches("\\d{4}-\\d{2}-\\d{2}");
    }

    private static boolean isTime(String value) {
        return cleanValue(value).matches("\\d{2}:\\d{2}:\\d{2}");
    }

    private static String cleanText(String value, String fallback) {
        String cleaned = cleanValue(value);
        return cleaned.isEmpty() ? fallback : cleaned;
    }

    private static String cleanValue(String value) {
        return value == null ? "" : value.trim();
    }
}
