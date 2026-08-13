import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  parseSuperNotificationMinimum,
  type SuperNotificationMinimum
} from "./super-notification-policy";

export {
  parseSuperNotificationMinimum,
  shouldPresentSuperRating,
  superNotificationMinimumOptions,
  type SuperNotificationMinimum
} from "./super-notification-policy";

export const superNotificationMinimumStorageKey =
  "btb-mobile-super-notification-min-rating-v1";

export async function getSuperNotificationMinimum(): Promise<SuperNotificationMinimum> {
  return parseSuperNotificationMinimum(
    await AsyncStorage.getItem(superNotificationMinimumStorageKey)
  );
}

export async function setSuperNotificationMinimum(
  minimum: SuperNotificationMinimum
): Promise<void> {
  await AsyncStorage.setItem(
    superNotificationMinimumStorageKey,
    String(parseSuperNotificationMinimum(minimum))
  );
}
