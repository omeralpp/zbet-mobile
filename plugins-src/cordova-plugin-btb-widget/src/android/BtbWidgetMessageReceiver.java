package com.btb.widget;

import android.content.Context;
import android.os.Bundle;

import com.google.firebase.messaging.RemoteMessage;

import org.apache.cordova.firebasex.FirebasePluginMessageReceiver;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

public class BtbWidgetMessageReceiver extends FirebasePluginMessageReceiver {
    private final Context context;

    public BtbWidgetMessageReceiver(Context context) {
        super();
        this.context = context;
    }

    @Override
    public boolean onMessageReceived(RemoteMessage remoteMessage) {
        if (remoteMessage == null) {
            return false;
        }

        Map<String, String> data = remoteMessage.getData();
        RemoteMessage.Notification notification = remoteMessage.getNotification();
        String title = firstMapValue(data, "notification_title", "title");
        String body = firstMapValue(data, "notification_body", "body");

        if (isBlank(title) && notification != null) {
            title = notification.getTitle();
        }
        if (isBlank(body) && notification != null) {
            body = notification.getBody();
        }

        updateWidget(
                title,
                body,
                firstMapValue(data, "route", "target", "screen"),
                firstMapValue(data, "rating", "star", "stars", "super_rating"));

        // Never consume the message; the existing Firebase plugin must still
        // display and deliver the notification through its normal flow.
        return false;
    }

    @Override
    public boolean sendMessage(Bundle bundle) {
        if (bundle == null) {
            return false;
        }

        updateWidget(
                firstBundleValue(bundle, "notification_title", "title"),
                firstBundleValue(bundle, "notification_body", "body"),
                firstBundleValue(bundle, "route", "target", "screen"),
                firstBundleValue(bundle, "rating", "star", "stars", "super_rating"));
        return false;
    }

    private void updateWidget(String title, String body, String route, String rating) {
        if (isBlank(title) && isBlank(body)) {
            return;
        }

        String normalizedRoute = resolveRoute(route, title, body);
        String finalTitle = isBlank(title)
                ? ("super".equals(normalizedRoute) ? "Yeni Super bildirimi" : "BTB Mobile")
                : title.trim();
        String finalBody = isBlank(body)
                ? ("super".equals(normalizedRoute)
                        ? "Super Log’u açmak için dokunun."
                        : "toto".equals(normalizedRoute)
                                ? "Spor Toto programını açmak için dokunun."
                                : "BTB uygulamasını açmak için dokunun.")
                : body.trim();
        int normalizedRating = parseRating(rating);

        if (normalizedRating > 0) {
            finalTitle = normalizedRating + "★ " + finalTitle;
        }

        try {
            JSONObject payload = new JSONObject();
            payload.put("title", finalTitle);
            payload.put("body", finalBody);
            payload.put("route", normalizedRoute);
            BtbWidgetProvider.storeAndUpdate(context, payload);
        } catch (JSONException ignored) {
            // All values are strings; this guard keeps FCM delivery non-fatal.
        }
    }

    private static String resolveRoute(
            String explicitRoute,
            String title,
            String body) {
        if (!isBlank(explicitRoute)) {
            return BtbWidgetPlugin.normalizeRoute(explicitRoute);
        }

        String text = ((title == null ? "" : title) + " " +
                (body == null ? "" : body)).toLowerCase();
        if (text.contains("super") || text.contains("sclear")) {
            return "super";
        }
        return text.contains("toto") ? "toto" : "btb";
    }

    private static int parseRating(String rating) {
        try {
            int value = Integer.parseInt(rating == null ? "" : rating.trim());
            return value >= 1 && value <= 5 ? value : 0;
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }

    private static String firstMapValue(Map<String, String> values, String... keys) {
        if (values == null) {
            return "";
        }

        for (String key : keys) {
            String value = values.get(key);
            if (!isBlank(value)) {
                return value;
            }
        }
        return "";
    }

    private static String firstBundleValue(Bundle bundle, String... keys) {
        for (String key : keys) {
            String value = bundle.getString(key);
            if (!isBlank(value)) {
                return value;
            }
        }
        return "";
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
