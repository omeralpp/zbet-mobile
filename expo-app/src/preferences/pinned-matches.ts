const maxPinnedMatches = 200;

export const pinnedMatchesStorageKey = "btb.mobile.pinned-matches.v1";

function normalizedKey(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const key = value.trim();
  return key ? key : null;
}

export function normalizeStoredPinnedKeys(value: string | null): Set<string> {
  if (!value) {
    return new Set();
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    const result = new Set<string>();
    for (const candidate of parsed) {
      const key = normalizedKey(candidate);
      if (key) {
        result.add(key);
      }
      if (result.size >= maxPinnedMatches) {
        break;
      }
    }
    return result;
  } catch {
    return new Set();
  }
}

export function serializePinnedKeys(keys: ReadonlySet<string>): string {
  return JSON.stringify([...keys].sort());
}

export function togglePinnedKey(
  keys: ReadonlySet<string>,
  matchKey: string
): Set<string> {
  const normalized = normalizedKey(matchKey);
  const next = new Set(keys);
  if (!normalized) {
    return next;
  }
  if (next.has(normalized)) {
    next.delete(normalized);
  } else if (next.size < maxPinnedMatches) {
    next.add(normalized);
  }
  return next;
}

/** Pins are a current-list preference, never a hidden match history. */
export function reconcilePinnedKeys(
  keys: ReadonlySet<string>,
  eligibleKeys: readonly string[]
): Set<string> {
  const eligible = new Set(
    eligibleKeys
      .map(normalizedKey)
      .filter((key): key is string => key !== null)
  );
  return new Set([...keys].filter((key) => eligible.has(key)));
}

export function equalPinnedKeys(
  left: ReadonlySet<string>,
  right: ReadonlySet<string>
): boolean {
  return left.size === right.size && [...left].every((key) => right.has(key));
}

export function splitPinnedMatches<T extends { key: string }>(
  matches: readonly T[],
  pinnedKeys: ReadonlySet<string>
): { pinned: T[]; regular: T[] } {
  const pinned: T[] = [];
  const regular: T[] = [];
  for (const match of matches) {
    (pinnedKeys.has(match.key) ? pinned : regular).push(match);
  }
  return { pinned, regular };
}
