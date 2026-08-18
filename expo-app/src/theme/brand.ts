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
 *   canvas safe, so artwork that fills the frame loses its own edges — which is
 *   exactly what the current shared raster does;
 * - the **notification small icon**, drawn by the system as an alpha mask.
 *   Colour is discarded; a fully opaque raster becomes a filled square. This
 *   role is already answered by a monochrome vector and must stay a vector.
 *
 * The mark and the launcher foreground therefore cannot be the same bytes once
 * a real asset exists: one wants to fill its box, the other has to sit inside a
 * safe zone. They currently share a file, which is why the launcher mask clips
 * the shield rather than the ground around it. The two constants below are
 * deliberately separate names for that reason, and the asset that lands splits
 * them without touching a call site.
 *
 * Evidence, measurements and the replacement brief:
 * `docs/ASSET_GENERATION_BRIEF.md` and `ASSET_GENERATION_DEPENDENCY` in
 * `docs/OBSERVATION_LOG.md`.
 */

/** Paths are Expo config paths: relative to the project root, not to this file. */
export const btbBrandMarkPath = "./assets/brand/btb-mark.png";

/**
 * Still the mark. The launcher foreground keeps sharing the mark's bytes until
 * the safe-zone export exists, because a mechanically padded copy of today's
 * opaque raster would put a floating dark square on the launcher background
 * rather than fix anything. When the real exports land this points at
 * `./assets/brand/btb-adaptive-foreground.png` and nothing else moves.
 */
export const btbAdaptiveIconForegroundPath = btbBrandMarkPath;

/** Revealed only once the foreground actually carries transparency. */
export const btbAdaptiveIconBackground = "#04101E";

/**
 * Owned by the widget module's Android resources, registered for both Firebase
 * and Expo notification metadata. A raster must never take this role back.
 */
export const btbNotificationIconResource = "@drawable/btb_notification_icon";
