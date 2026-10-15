import { Platform } from "react-native";

/**
 * Whether the obsolete Fiori launchpad entry points are offered. They open an
 * in-app WebView, which the web build has no equivalent for (its /fiori route
 * only redirects home), so the web client never shows them. Android keeps them
 * until the owner decides their removal under the UI5/Fiori retirement.
 */
export const fioriEntryAvailable = Platform.OS !== "web";
