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

    private CallbackContext routeListener;
    private String pendingRoute;

    @Override
    protected void pluginInitialize() {
        pendingRoute = consumeRoute(cordova.getActivity().getIntent());
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

        String currentRoute = consumeRoute(cordova.getActivity().getIntent());
        if (currentRoute != null) {
            pendingRoute = currentRoute;
        }

        if (pendingRoute != null) {
            emitRoute(pendingRoute);
            pendingRoute = null;
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
        String route = consumeRoute(intent);
        if (route == null) {
            return;
        }

        if (routeListener == null) {
            pendingRoute = route;
            return;
        }

        emitRoute(route);
    }

    @Override
    public void onReset() {
        routeListener = null;
    }

    private void emitRoute(String route) {
        if (routeListener == null) {
            pendingRoute = route;
            return;
        }

        try {
            JSONObject event = new JSONObject();
            event.put("route", normalizeRoute(route));
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

    private String consumeRoute(Intent intent) {
        if (intent == null || !intent.hasExtra(EXTRA_ROUTE)) {
            return null;
        }

        String route = normalizeRoute(intent.getStringExtra(EXTRA_ROUTE));
        intent.removeExtra(EXTRA_ROUTE);
        return route;
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
