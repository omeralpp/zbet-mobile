package com.btb.widget;

import android.content.Intent;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class BtbWidgetPlugin extends CordovaPlugin {
    public static final String EXTRA_ROUTE = "com.btb.widget.ROUTE";
    public static final String EXTRA_MATCH_ID = "com.btb.widget.MATCH_ID";
    public static final String EXTRA_MATCH_DATE = "com.btb.widget.MATCH_DATE";
    public static final String EXTRA_MATCH_TIME = "com.btb.widget.MATCH_TIME";

    private CallbackContext routeListener;
    private JSONObject pendingEvent;

    @Override
    protected void pluginInitialize() {
        pendingEvent = consumeEvent(cordova.getActivity().getIntent());
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext)
            throws JSONException {
        if ("listen".equals(action)) {
            listen(callbackContext);
            return true;
        }

        if ("update".equals(action)) {
            JSONObject payload = args.optJSONObject(0);
            updateWidget(payload == null ? new JSONObject() : payload, callbackContext);
            return true;
        }

        return false;
    }

    private void listen(CallbackContext callbackContext) {
        routeListener = callbackContext;

        PluginResult waiting = new PluginResult(PluginResult.Status.NO_RESULT);
        waiting.setKeepCallback(true);
        callbackContext.sendPluginResult(waiting);

        JSONObject currentEvent = consumeEvent(cordova.getActivity().getIntent());
        if (currentEvent != null) {
            pendingEvent = currentEvent;
        }

        if (pendingEvent != null) {
            emitEvent(pendingEvent);
            pendingEvent = null;
        }
    }

    private void updateWidget(final JSONObject payload, final CallbackContext callbackContext) {
        final android.content.Context context =
                cordova.getActivity().getApplicationContext();

        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                BtbWidgetProvider.storeAndUpdate(context, payload);
                callbackContext.success();
            }
        });
    }

    @Override
    public void onNewIntent(Intent intent) {
        JSONObject event = consumeEvent(intent);
        if (event == null) {
            return;
        }

        if (routeListener == null) {
            pendingEvent = event;
            return;
        }

        emitEvent(event);
    }

    @Override
    public void onReset() {
        routeListener = null;
    }

    private void emitEvent(JSONObject event) {
        if (routeListener == null) {
            pendingEvent = event;
            return;
        }

        try {
            event.put("route", normalizeRoute(event.optString("route", "home")));
            event.put("source", "widget");

            PluginResult result = new PluginResult(PluginResult.Status.OK, event);
            result.setKeepCallback(true);
            routeListener.sendPluginResult(result);
        } catch (JSONException error) {
            PluginResult result =
                    new PluginResult(PluginResult.Status.JSON_EXCEPTION, error.getMessage());
            result.setKeepCallback(true);
            routeListener.sendPluginResult(result);
        }
    }

    private JSONObject consumeEvent(Intent intent) {
        if (intent == null || !intent.hasExtra(EXTRA_ROUTE)) {
            return null;
        }

        String route = normalizeRoute(intent.getStringExtra(EXTRA_ROUTE));
        String matchId = intent.getStringExtra(EXTRA_MATCH_ID);
        String matchDate = intent.getStringExtra(EXTRA_MATCH_DATE);
        String matchTime = intent.getStringExtra(EXTRA_MATCH_TIME);

        intent.removeExtra(EXTRA_ROUTE);
        intent.removeExtra(EXTRA_MATCH_ID);
        intent.removeExtra(EXTRA_MATCH_DATE);
        intent.removeExtra(EXTRA_MATCH_TIME);

        try {
            JSONObject event = new JSONObject();
            event.put("route", route);

            if (!isBlank(matchId) && !isBlank(matchDate) && !isBlank(matchTime)) {
                event.put("match_id", matchId.trim());
                event.put("match_date", matchDate.trim());
                event.put("match_time", matchTime.trim());
            }
            return event;
        } catch (JSONException ignored) {
            return null;
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    static String normalizeRoute(String route) {
        String normalized = route == null ? "" : route.trim().toLowerCase();

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
}
