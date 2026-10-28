/** Minimal immediate scrolling keeps the active option visible without moving input focus. */
export function paletteScrollOffset({ scrollTop, viewportHeight, itemTop, itemHeight }: {
  scrollTop: number; viewportHeight: number; itemTop: number; itemHeight: number;
}): number {
  if (itemTop < scrollTop || itemHeight > viewportHeight) return Math.max(0, itemTop);
  if (itemTop + itemHeight > scrollTop + viewportHeight) {
    return Math.max(0, itemTop + itemHeight - viewportHeight);
  }
  return scrollTop;
}
