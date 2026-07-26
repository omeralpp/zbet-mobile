package com.btb.widget;

import android.content.Context;
import android.os.Bundle;

import com.google.firebase.messaging.RemoteMessage;

import org.apache.cordova.firebasex.FirebasePluginMessageReceiver;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class BtbWidgetMessageReceiver extends FirebasePluginMessageReceiver {
    private static final Pattern LEGACY_RATING =
            Pattern.compile("\\brating\\s*([1-5])\\b", Pattern.CASE_INSENSITIVE);
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
        String notificationBody = firstMapValue(data, "notification_body", "body");
        String body = firstMapValue(data, "widget_body");

        if (isBlank(title) && notification != null) {
            title = notification.getTitle();
        }
        if (isBlank(notificationBody) && notification != null) {
            notificationBody = notification.getBody();
        }
        if (isBlank(body)) {
            body = notificationBody;
        }

        updateKpiWidget(
                firstMapValue(data, "toto_coverage_hits", "totoCoverageHits"),
                firstMapValue(data, "toto_coverage_total", "totoCoverageTotal"),
                firstMapValue(data, "toto_program_gc_no", "totoProgramGcNo"),
                firstMapValue(data, "toto_program_version", "totoProgramVersion"),
                firstMapValue(data, "super_min_rating", "superMinRating"),
                firstMapValue(data, "super_wins", "superWins"),
                firstMapValue(data, "super_losses", "superLosses"),
                firstMapValue(data, "super_profit", "superProfit"));

        updateWidget(
                title,
                body,
                firstMapValue(data, "route", "target", "screen"),
                firstMapValue(data, "rating", "star", "stars", "super_rating"),
                firstMapValue(data, "match_id", "matchId"),
                firstMapValue(data, "match_date", "matchDate"),
                firstMapValue(data, "match_time", "matchTime"),
                notificationBody);

        // Never consume the message; the existing Firebase plugin must still
        // display and deliver the notification through its normal flow.
        return false;
    }

    @Override
    public boolean sendMessage(Bundle bundle) {
        if (bundle == null) {
            return false;
        }

        updateKpiWidget(
                firstBundleValue(bundle, "toto_coverage_hits", "totoCoverageHits"),
                firstBundleValue(bundle, "toto_coverage_total", "totoCoverageTotal"),
                firstBundleValue(bundle, "toto_program_gc_no", "totoProgramGcNo"),
                firstBundleValue(
                        bundle,
                        "toto_program_version",
                        "totoProgramVersion"),
                firstBundleValue(bundle, "super_min_rating", "superMinRating"),
                firstBundleValue(bundle, "super_wins", "superWins"),
                firstBundleValue(bundle, "super_losses", "superLosses"),
                firstBundleValue(bundle, "super_profit", "superProfit"));

        updateWidget(
                firstBundleValue(bundle, "notification_title", "title"),
                firstBundleValue(
                        bundle,
                        "widget_body",
                        "notification_body",
                        "body"),
                firstBundleValue(bundle, "route", "target", "screen"),
                firstBundleValue(bundle, "rating", "star", "stars", "super_rating"),
                firstBundleValue(bundle, "match_id", "matchId"),
                firstBundleValue(bundle, "match_date", "matchDate"),
                firstBundleValue(bundle, "match_time", "matchTime"),
                firstBundleValue(bundle, "notification_body", "body"));
        return false;
    }

    private void updateKpiWidget(
            String totoCoverageHits,
            String totoCoverageTotal,
            String totoProgramGcNo,
            String totoProgramVersion,
            String superMinRating,
            String superWins,
            String superLosses,
            String superProfit) {
        try {
            JSONObject payload = new JSONObject();
            payload.put("toto_coverage_hits", cleanValue(totoCoverageHits));
            payload.put("toto_coverage_total", cleanValue(totoCoverageTotal));
            payload.put("toto_program_gc_no", cleanValue(totoProgramGcNo));
            payload.put(
                    "toto_program_version",
                    cleanValue(totoProgramVersion));
            payload.put("super_min_rating", cleanValue(superMinRating));
            payload.put("super_wins", cleanValue(superWins));
            payload.put("super_losses", cleanValue(superLosses));
            payload.put("super_profit", cleanValue(superProfit));
            BtbKpiWidgetProvider.storeAndUpdate(context, payload);
        } catch (JSONException ignored) {
            // All values are strings; this guard keeps FCM delivery non-fatal.
        }
    }

    private void updateWidget(
            String title,
            String body,
            String route,
            String rating,
            String matchId,
            String matchDate,
            String matchTime,
            String notificationBody) {
        if (isBlank(title) && isBlank(body)) {
            return;
        }

        int normalizedRating = parseRating(
                rating,
                isBlank(notificationBody) ? body : notificationBody);
        boolean hasMatchTarget =
                !isBlank(matchId) && !isBlank(matchDate) && !isBlank(matchTime);
        String normalizedRoute = resolveRoute(route, title, body);
        if (hasMatchTarget) {
            normalizedRoute = "btb";
        }
        String finalTitle = isBlank(title)
                ? ("super".equals(normalizedRoute) ? "Yeni Super bildirimi" : "BTB Mobile")
                : title.trim();
        String finalBody = isBlank(body)
                ? ("super".equals(normalizedRoute)
                        ? "Super Log’u açmak için dokunun."
                        : "toto".equals(normalizedRoute)
                                ? "Spor Toto programını açmak için dokunun."
                                : "BTB uygulamasını açmak için dokunun.")
                : getWidgetBody(body, normalizedRating);

        try {
            JSONObject payload = new JSONObject();
            payload.put("title", finalTitle);
            payload.put("body", finalBody);
            payload.put("route", normalizedRoute);
            payload.put("rating", normalizedRating);
            payload.put("match_id", cleanValue(matchId));
            payload.put("match_date", cleanValue(matchDate));
            payload.put("match_time", cleanValue(matchTime));
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

    private static int parseRating(String rating, String body) {
        try {
            int value = Integer.parseInt(rating == null ? "" : rating.trim());
            if (value >= 1 && value <= 5) {
                return value;
            }
        } catch (NumberFormatException ignored) {
            // Legacy payloads carried the rating only in the body.
        }

        Matcher matcher = LEGACY_RATING.matcher(body == null ? "" : body);
        return matcher.find() ? Integer.parseInt(matcher.group(1)) : 0;
    }

    private static String getWidgetBody(String body, int rating) {
        String source = cleanValue(body);
        if (rating == 0) {
            return source;
        }

        String cleaned = source
                .replaceFirst(
                        "(?i)\\s*\\(\\s*rating\\s*[1-5]\\s*\\)\\s*[.!?]?\\s*$",
                        "")
                .replaceFirst("\\s*[★⭐]{1,5}\\s*[.!?]?\\s*$", "")
                .trim();

        if (cleaned.isEmpty() ||
                cleaned.endsWith(".") ||
                cleaned.endsWith("!") ||
                cleaned.endsWith("?")) {
            return cleaned;
        }
        return cleaned + ".";
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

    private static String cleanValue(String value) {
        return value == null ? "" : value.trim();
    }
}
