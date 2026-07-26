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
import android.widget.RemoteViews;

import com.btb.R;

import org.json.JSONObject;

import java.util.Date;

public class BtbWidgetProvider extends AppWidgetProvider {
    private static final String PREFERENCES = "btb_widget";
    private static final String KEY_TITLE = "title";
    private static final String KEY_BODY = "body";
    private static final String KEY_ROUTE = "route";
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

        context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_TITLE, title)
                .putString(KEY_BODY, body)
                .putString(KEY_ROUTE, route)
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
        long updatedAt = preferences.getLong(KEY_UPDATED_AT, 0);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.btb_widget);
        views.setTextViewText(R.id.btb_widget_title, title);
        views.setTextViewText(R.id.btb_widget_body, body);
        views.setTextViewText(
                R.id.btb_widget_updated,
                updatedAt > 0
                        ? context.getString(
                                R.string.btb_widget_updated,
                                DateFormat.getTimeFormat(context).format(new Date(updatedAt)))
                        : context.getString(R.string.btb_widget_ready));

        views.setOnClickPendingIntent(
                R.id.btb_widget_root,
                createOpenIntent(context, route, 4100));
        views.setOnClickPendingIntent(
                R.id.btb_widget_open,
                createOpenIntent(context, "btb", 4101));
        views.setOnClickPendingIntent(
                R.id.btb_widget_super,
                createOpenIntent(context, "super", 4102));
        views.setOnClickPendingIntent(
                R.id.btb_widget_toto,
                createOpenIntent(context, "toto", 4103));
        return views;
    }

    private static PendingIntent createOpenIntent(
            Context context,
            String route,
            int requestCode) {
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
        String cleaned = value == null ? "" : value.trim();
        return cleaned.isEmpty() ? fallback : cleaned;
    }
}
