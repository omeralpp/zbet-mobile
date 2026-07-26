package com.btb.widget;

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

import com.btb.R;

import org.json.JSONObject;

import java.util.Date;

public class BtbWidgetProvider extends AppWidgetProvider {
    private static final String PREFERENCES = "btb_widget";
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
                payload.optString("title", context.getString(R.string.btb_widget_default_title)),
                context.getString(R.string.btb_widget_default_title));
        String body = cleanText(
                payload.optString("body", context.getString(R.string.btb_widget_default_body)),
                context.getString(R.string.btb_widget_default_body));
        String route = BtbWidgetPlugin.normalizeRoute(payload.optString("route", "home"));
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

    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName provider = new ComponentName(context, BtbWidgetProvider.class);
        int[] widgetIds = manager.getAppWidgetIds(provider);

        for (int widgetId : widgetIds) {
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
        String route = BtbWidgetPlugin.normalizeRoute(
                preferences.getString(KEY_ROUTE, "home"));
        int rating = preferences.getInt(KEY_RATING, 0);
        String matchId = preferences.getString(KEY_MATCH_ID, "");
        String matchDate = preferences.getString(KEY_MATCH_DATE, "");
        String matchTime = preferences.getString(KEY_MATCH_TIME, "");
        long updatedAt = preferences.getLong(KEY_UPDATED_AT, 0);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.btb_widget);
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
                                DateFormat.getTimeFormat(context).format(new Date(updatedAt)))
                        : context.getString(R.string.btb_widget_ready));

        views.setOnClickPendingIntent(
                R.id.btb_widget_root,
                createOpenIntent(
                        context,
                        route,
                        4100,
                        matchId,
                        matchDate,
                        matchTime));
        views.setOnClickPendingIntent(
                R.id.btb_widget_open,
                createOpenIntent(context, "btb", 4101, "", "", ""));
        views.setOnClickPendingIntent(
                R.id.btb_widget_super,
                createOpenIntent(context, "super", 4102, "", "", ""));
        views.setOnClickPendingIntent(
                R.id.btb_widget_toto,
                createOpenIntent(context, "toto", 4103, "", "", ""));
        return views;
    }

    static PendingIntent createOpenIntent(
            Context context,
            String route,
            int requestCode,
            String matchId,
            String matchDate,
            String matchTime) {
        Intent intent = context.getPackageManager()
                .getLaunchIntentForPackage(context.getPackageName());

        if (intent == null) {
            intent = new Intent();
            intent.setPackage(context.getPackageName());
        }

        String normalizedRoute = BtbWidgetPlugin.normalizeRoute(route);
        intent.setAction(context.getPackageName() + ".widget.OPEN_" + normalizedRoute);
        intent.setData(Uri.parse("btb://widget/" + normalizedRoute));
        intent.putExtra(BtbWidgetPlugin.EXTRA_ROUTE, normalizedRoute);
        if (!cleanValue(matchId).isEmpty() &&
                !cleanValue(matchDate).isEmpty() &&
                !cleanValue(matchTime).isEmpty()) {
            intent.putExtra(BtbWidgetPlugin.EXTRA_MATCH_ID, cleanValue(matchId));
            intent.putExtra(BtbWidgetPlugin.EXTRA_MATCH_DATE, cleanValue(matchDate));
            intent.putExtra(BtbWidgetPlugin.EXTRA_MATCH_TIME, cleanValue(matchTime));
        }
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

    private static String cleanText(String value, String fallback) {
        String cleaned = cleanValue(value);
        return cleaned.isEmpty() ? fallback : cleaned;
    }

    private static String cleanValue(String value) {
        return value == null ? "" : value.trim();
    }

    private static String getStars(int rating) {
        if (rating < 1 || rating > 5) {
            return "";
        }

        StringBuilder stars = new StringBuilder();
        for (int index = 0; index < rating; index += 1) {
            stars.append("★");
        }
        return stars.toString();
    }
}
