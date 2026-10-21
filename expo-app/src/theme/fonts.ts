/**
 * Android reads the bundled families from the APK itself: the expo-font config
 * plugin in app.config.ts copies them into `res/font` at prebuild, so they are
 * ready before the first frame. Only the web build has to fetch them
 * (fonts.web.ts).
 */
export function useBrandFonts(): boolean {
  return true;
}
