package expo.modules.btbwidget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject

class BtbWidgetModule : Module() {
  private val context: Context
    get() = appContext.reactContext?.applicationContext
      ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("BtbWidget")

    AsyncFunction("update") { payload: Map<String, Any?> ->
      val json = JSONObject()
      payload.forEach { (key, value) ->
        if (value != null) {
          json.put(key, value)
        }
      }

      if (json.has("title") || json.has("body")) {
        BtbNotificationWidgetProvider.storeAndUpdate(context, json)
      }
      if (
        json.has("toto_coverage_hits") ||
        json.has("toto_coverage_total") ||
        json.has("super_min_rating")
      ) {
        BtbPerformanceWidgetProvider.storeAndUpdate(context, json)
      }
    }

    AsyncFunction("clear") {
      BtbNotificationWidgetProvider.clearStoredData(context)
      BtbPerformanceWidgetProvider.clearStoredData(context)
    }

    AsyncFunction("getStatus") {
      val manager = AppWidgetManager.getInstance(context)
      mapOf(
        "available" to true,
        "notificationWidgetCount" to manager.getAppWidgetIds(
          ComponentName(context, BtbNotificationWidgetProvider::class.java)
        ).size,
        "performanceWidgetCount" to manager.getAppWidgetIds(
          ComponentName(context, BtbPerformanceWidgetProvider::class.java)
        ).size
      )
    }
  }
}
