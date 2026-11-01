import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  moduleLayoutStorageKey,
  moduleLayoutSurfaces,
  moveModule,
  parseStoredModulePreference,
  reconcileModuleOrder,
  resolveVisibleMove,
  type ModuleLayoutSurface
} from "./module-layout";
import { moduleLayoutAnchors, moduleLayoutDefaults } from "./module-registry";

type Listener = () => void;

const listeners = new Set<Listener>();
const state = new Map<ModuleLayoutSurface, string[]>(
  moduleLayoutSurfaces.map((surface) => [
    surface,
    reconcileModuleOrder(null, moduleLayoutDefaults[surface])
  ])
);
// Whether a surface's order is the user's own (stored) rather than the default.
// A screen may offer a situational default, but never over a saved order.
const customized = new Map<ModuleLayoutSurface, boolean>(
  moduleLayoutSurfaces.map((surface) => [surface, false])
);
let hydration: Promise<void> | null = null;

function markCustomized(surface: ModuleLayoutSurface, value: boolean): void {
  if (customized.get(surface) === value) {
    return;
  }
  customized.set(surface, value);
  notify();
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function sameOrder(left: readonly string[], right: readonly string[]): boolean {
  return (
    left.length === right.length &&
    left.every((entry, index) => entry === right[index])
  );
}

function commit(surface: ModuleLayoutSurface, order: string[]): void {
  const current = state.get(surface);
  // Snapshot identity must stay stable for useSyncExternalStore, so an
  // equivalent order never replaces the stored array.
  if (current && sameOrder(current, order)) {
    return;
  }
  state.set(surface, order);
  notify();
}

async function persist(
  surface: ModuleLayoutSurface,
  order: readonly string[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      moduleLayoutStorageKey(surface),
      JSON.stringify(order)
    );
  } catch {
    // A failed write only costs the preference; the session keeps the order.
  }
}

/** Loads every persisted surface order once per app session. */
export function hydrateModuleLayouts(): Promise<void> {
  hydration ??= (async () => {
    try {
      const entries = await AsyncStorage.multiGet(
        moduleLayoutSurfaces.map(moduleLayoutStorageKey)
      );
      const stored = new Map(entries);
      for (const surface of moduleLayoutSurfaces) {
        const preference = parseStoredModulePreference(stored.get(moduleLayoutStorageKey(surface)));
        commit(
          surface,
          reconcileModuleOrder(
            preference,
            moduleLayoutDefaults[surface],
            moduleLayoutAnchors[surface]
          )
        );
        markCustomized(surface, Array.isArray(preference));
      }
    } catch {
      // Unreadable storage keeps the canonical defaults already in state.
    }
  })();
  return hydration;
}

export function getModuleOrder(surface: ModuleLayoutSurface): string[] {
  return (
    state.get(surface) ??
    reconcileModuleOrder(null, moduleLayoutDefaults[surface])
  );
}

export async function resetModuleOrder(
  surface: ModuleLayoutSurface
): Promise<void> {
  const defaults = reconcileModuleOrder(null, moduleLayoutDefaults[surface]);
  commit(surface, defaults);
  markCustomized(surface, false);
  try {
    await AsyncStorage.removeItem(moduleLayoutStorageKey(surface));
  } catch {
    // Losing the removal still leaves the session on the canonical default.
  }
}

export function isModuleOrderCustomized(surface: ModuleLayoutSurface): boolean {
  return customized.get(surface) ?? false;
}

/** Puts back an order captured before a reset (the reset's undo). */
export async function restoreModuleOrder(
  surface: ModuleLayoutSurface,
  order: readonly string[],
  wasCustomized: boolean
): Promise<void> {
  if (!wasCustomized) {
    await resetModuleOrder(surface);
    return;
  }
  const restored = reconcileModuleOrder(order, moduleLayoutDefaults[surface], moduleLayoutAnchors[surface]);
  commit(surface, restored);
  markCustomized(surface, true);
  await persist(surface, restored);
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * `situationalDefault` lets a screen open in a different default order for the
 * situation it shows (a live match), only while the user has no saved order;
 * the first move saves the order the user was actually looking at.
 */
export function useModuleLayout(surface: ModuleLayoutSurface, situationalDefault?: readonly string[]) {
  useEffect(() => {
    void hydrateModuleLayouts();
  }, []);

  const stored = useSyncExternalStore(
    subscribe,
    () => getModuleOrder(surface),
    () => getModuleOrder(surface)
  );
  const isCustomized = useSyncExternalStore(
    subscribe,
    () => isModuleOrderCustomized(surface),
    () => isModuleOrderCustomized(surface)
  );
  const situationalKey = situationalDefault?.join("|") ?? "";
  const effectiveOrder = useCallback(
    () => !isModuleOrderCustomized(surface) && situationalKey
      ? reconcileModuleOrder(situationalKey.split("|"), moduleLayoutDefaults[surface], moduleLayoutAnchors[surface])
      : getModuleOrder(surface),
    [situationalKey, surface]
  );
  const order = useMemo(
    () => !isCustomized && situationalKey ? effectiveOrder() : stored,
    [effectiveOrder, isCustomized, situationalKey, stored]
  );

  const move = useCallback(
    (from: number, to: number) => {
      const next = moveModule(effectiveOrder(), from, to);
      commit(surface, next);
      markCustomized(surface, true);
      void persist(surface, next);
    },
    [effectiveOrder, surface]
  );

  const reset = useCallback(() => resetModuleOrder(surface), [surface]);

  // Screens only render the modules they currently have data for, so a drag is
  // reported in visible slots and mapped back onto the stored order here.
  const reorderVisible = useCallback(
    (visibleIds: readonly string[], from: number, to: number) => {
      const mapped = resolveVisibleMove(
        effectiveOrder(),
        visibleIds,
        from,
        to
      );
      if (mapped) {
        move(mapped.from, mapped.to);
      }
    },
    [effectiveOrder, move]
  );

  return { order, move, reorderVisible, reset, customized: isCustomized };
}
