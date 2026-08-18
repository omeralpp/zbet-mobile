/**
 * Where Bibi belongs.
 *
 * Bibi shipped as a single global overlay: a draggable mascot floating above
 * every route, including the two densest analytical surfaces in the product.
 * On Match Detail and Super Decision Detail that put a character on top of the
 * material the user opened the screen to read, and a floating element the user
 * has to move out of the way is competing with the data rather than supporting
 * it.
 *
 * So presence became a property of the surface:
 *
 * - `FULL` — the ambient mascot. Draggable, idle micro-animations, quick menu.
 *   Brand, orientation and helper surfaces, where Bibi is the point or is at
 *   least free.
 * - `GUIDE_ONLY` — no ambient presence at all. Bibi appears solely to deliver
 *   an active tutorial step and leaves the moment it finishes.
 *
 * `GUIDE_ONLY` rather than `NONE` is the load-bearing distinction. The tutorial
 * has steps that target `/match/` and `/super/` components by id, and Bibi is
 * what renders them, so removing her outright would leave those steps
 * unreachable and quietly break the guide. Withdrawing ambient presence is the
 * design intent; withdrawing the guide would be a regression wearing its
 * clothes. A tutorial step is also a moment the user asked for, which is the
 * opposite of ambient.
 */

export type BibiPresence = "FULL" | "GUIDE_ONLY";

/**
 * Detail routes dense enough that a floating mascot competes with the data.
 *
 * Matched as prefixes because these are dynamic routes (`/match/[key]`), and
 * kept as an explicit list because "dense" is a product judgement about what a
 * surface is for, not something a path depth can infer.
 */
export const denseAnalyticalRoutes = ["/match/", "/super/"] as const;

/**
 * Resolves Bibi's presence for a route.
 *
 * The `/super` tab (the decision log list) and `/super/<key>` (one decision's
 * detail) differ by one segment and by a great deal of density. The list is a
 * scanning surface and keeps the ambient mascot; the detail does not.
 *
 * A route therefore has to carry something *after* the prefix to count as
 * dense. Matching the prefix alone would take Bibi off the Super tab too, and
 * a bare `/super/` names no decision, so it falls to the list reading — absence
 * is the outcome that cannot be recovered from, so ambiguity resolves toward
 * keeping her.
 */
export function bibiPresence(pathname: string | null | undefined): BibiPresence {
  if (!pathname) {
    return "FULL";
  }
  const dense = denseAnalyticalRoutes.some(
    (route) => pathname.startsWith(route) && pathname.length > route.length
  );
  return dense ? "GUIDE_ONLY" : "FULL";
}

/** Whether the ambient mascot — drag, idle motion, greeting, menu — may render. */
export function allowsAmbientBibi(presence: BibiPresence): boolean {
  return presence === "FULL";
}

/**
 * Whether Bibi should render at all right now.
 *
 * On a `GUIDE_ONLY` surface this is false until a tutorial step is actually
 * active, which is what makes the withdrawal real rather than cosmetic.
 */
export function shouldRenderBibi(
  presence: BibiPresence,
  hasActiveTip: boolean
): boolean {
  return presence === "FULL" || hasActiveTip;
}
