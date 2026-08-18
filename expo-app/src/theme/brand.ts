/**
 * The BTB brand asset contract, in one place because the mark is not one file
 * playing one role.
 *
 * Three surfaces render BTB itself, and Android decides two of them for us:
 *
 * - the **mark**, drawn by the product — launch screen, Overview hero, and the
 *   crest fallback when a team has no logo. It is drawn at its own size on a
 *   surface we control, so it wants tight optical bounds and no built-in
 *   padding;
 * - the **adaptive launcher foreground**, drawn by the launcher. Android masks
 *   it to whatever shape the device uses and keeps only the inner 66% of the
 *   canvas safe, so artwork that fills the frame loses its own edges;
 * - the **notification small icon**, drawn by the system as an alpha mask.
 *   Colour is discarded; a fully opaque raster becomes a filled square. This
 *   role is already answered by a monochrome vector and must stay a vector.
 *
 * The mark and the launcher foreground are therefore two files: one fills its
 * box, the other sits inside the safe zone. Both are derived from a single
 * generated master by `scripts/derive-brand-exports.py`, so they can never
 * drift into two different drawings, and `npm run check:brand` measures each
 * against the geometry its role requires.
 *
 * How the artwork was specified and what it replaced:
 * `docs/ASSET_GENERATION_BRIEF.md`, and `NXT-OBS-101` in
 * `docs/OBSERVATION_LOG.md`.
 */

/** Paths are Expo config paths: relative to the project root, not to this file. */
export const btbBrandMarkPath = "./assets/brand/btb-mark.png";

/**
 * The same artwork, scaled into the region Android guarantees. Derived from the
 * generated master by `scripts/derive-brand-exports.py`, which only crops,
 * scales and centres — the two files are the same drawing at two geometries,
 * not two drawings.
 */
export const btbAdaptiveIconForegroundPath =
  "./assets/brand/btb-adaptive-foreground.png";

/** Visible at last: the foreground above is genuinely transparent. */
export const btbAdaptiveIconBackground = "#04101E";

/**
 * Owned by the widget module's Android resources, registered for both Firebase
 * and Expo notification metadata. A raster must never take this role back.
 */
export const btbNotificationIconResource = "@drawable/btb_notification_icon";
