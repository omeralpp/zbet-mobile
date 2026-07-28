import assert from "node:assert/strict";
import test from "node:test";
import { extractRemoteNotificationData } from "./background-data";

test("Android RemoteMessage içindeki data alanını çıkarır", () => {
  assert.deepEqual(
    extractRemoteNotificationData({
      messageId: "abc",
      data: {
        notification_title: "BTB",
        rating: "4"
      }
    }),
    {
      notification_title: "BTB",
      rating: "4"
    }
  );
});

test("JSON dataString kullanan payloadları da destekler", () => {
  assert.deepEqual(
    extractRemoteNotificationData({
      data: {
        dataString: JSON.stringify({
          notification_title: "BTB",
          route: "super"
        })
      }
    }),
    {
      notification_title: "BTB",
      route: "super"
    }
  );
});

test("bildirim aksiyonu yanıtını yeni FCM mesajı saymaz", () => {
  assert.equal(
    extractRemoteNotificationData({
      actionIdentifier: "expo.modules.notifications.actions.DEFAULT"
    }),
    null
  );
});
