/**
 * The one place the product loads the BTB mark.
 *
 * Kept apart from `brand.ts` because this module resolves a bundled image and
 * `app.config.ts` is evaluated by Node, where that resolution does not exist.
 * `brand.ts` states the contract; this states the asset.
 */
export const btbBrandMark = require("../../assets/brand/btb-mark.png");
