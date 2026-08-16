export const moduleLayoutSurfaces = [
  "overview",
  "liveDetail",
  "superDetail"
] as const;

export type ModuleLayoutSurface = (typeof moduleLayoutSurfaces)[number];

export function moduleLayoutStorageKey(surface: ModuleLayoutSurface): string {
  return `btb-mobile-next-module-layout-${surface}-v1`;
}

/**
 * Reconciles a persisted module order against the current canonical default.
 *
 * A stored preference must survive future releases without ever hiding a module
 * the release introduced, so unknown ids are dropped, duplicates collapse to
 * their first occurrence and every missing default is appended in default order.
 */
export function reconcileModuleOrder(
  stored: unknown,
  defaultOrder: readonly string[]
): string[] {
  const canonical = [...new Set(defaultOrder)];
  if (!Array.isArray(stored)) {
    return canonical;
  }
  const known = new Set(canonical);
  const seen = new Set<string>();
  const reconciled: string[] = [];
  for (const entry of stored) {
    if (typeof entry !== "string" || !known.has(entry) || seen.has(entry)) {
      continue;
    }
    seen.add(entry);
    reconciled.push(entry);
  }
  for (const entry of canonical) {
    if (!seen.has(entry)) {
      reconciled.push(entry);
    }
  }
  return reconciled;
}

/** Parses raw storage text without letting corrupted JSON reach the caller. */
export function parseStoredModuleOrder(raw: string | null | undefined): unknown {
  if (typeof raw !== "string" || !raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/** Moves one module to a new slot, leaving the order untouched when invalid. */
export function moveModule(
  order: readonly string[],
  from: number,
  to: number
): string[] {
  const next = [...order];
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    to < 0 ||
    from >= next.length ||
    to >= next.length ||
    from === to
  ) {
    return next;
  }
  const [moved] = next.splice(from, 1);
  if (moved === undefined) {
    return [...order];
  }
  next.splice(to, 0, moved);
  return next;
}

/**
 * Translates a drag between two visible modules into stored-order indices.
 *
 * A screen only renders the modules it currently has data for, so the dragged
 * module has to land on the stored slot of the module it was dropped onto and
 * leave hidden modules where they were.
 */
export function resolveVisibleMove(
  order: readonly string[],
  visibleIds: readonly string[],
  from: number,
  to: number
): { from: number; to: number } | null {
  const fromId = visibleIds[from];
  const toId = visibleIds[to];
  if (fromId === undefined || toId === undefined || fromId === toId) {
    return null;
  }
  const storedFrom = order.indexOf(fromId);
  const storedTo = order.indexOf(toId);
  if (storedFrom < 0 || storedTo < 0) {
    return null;
  }
  return { from: storedFrom, to: storedTo };
}

/** Resolves the drop slot for a drag that travelled `offset` pixels. */
export function resolveDropIndex(
  heights: readonly number[],
  from: number,
  offset: number
): number {
  if (from < 0 || from >= heights.length) {
    return from;
  }
  let index = from;
  let remaining = offset;
  if (remaining > 0) {
    while (index < heights.length - 1) {
      const threshold = (heights[index + 1] ?? 0) / 2;
      if (remaining < threshold) {
        break;
      }
      remaining -= heights[index + 1] ?? 0;
      index += 1;
    }
    return index;
  }
  while (index > 0) {
    const threshold = (heights[index - 1] ?? 0) / 2;
    if (-remaining < threshold) {
      break;
    }
    remaining += heights[index - 1] ?? 0;
    index -= 1;
  }
  return index;
}
