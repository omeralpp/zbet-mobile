import { Redirect } from "expo-router";

/**
 * The Fiori launchpad is obsolete (owner decision 2026-10-15) and was only ever
 * an in-app WebView. The web build has no such screen; an old link lands on
 * the overview instead.
 */
export default function FioriScreen() {
  return <Redirect href="/" />;
}
