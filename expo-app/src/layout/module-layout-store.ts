import { useCallback, useEffect, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  moduleLayoutStorageKey,
  moduleLayoutSurfaces,
  moveModule,
  parseStoredModuleOrder,
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
let hydration: Promise<void> | null = null;

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
        commit(
          surface,
          reconcileModuleOrder(
            parseStoredModuleOrder(stored.get(moduleLayoutStorageKey(surface))),
            moduleLayoutDefaults[surface],
            moduleLayoutAnchors[surface]
          )
        );
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
  try {
    await AsyncStorage.removeItem(moduleLayoutStorageKey(surface));
  } catch {
    // Losing the removal still leaves the session on the canonical default.
  }
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useModuleLayout(surface: ModuleLayoutSurface) {
  useEffect(() => {
    void hydrateModuleLayouts();
  }, []);

  const order = useSyncExternalStore(
    subscribe,
    () => getModuleOrder(surface),
    () => getModuleOrder(surface)
  );

  const move = useCallback(
    (from: number, to: number) => {
      const next = moveModule(getModuleOrder(surface), from, to);
      commit(surface, next);
      void persist(surface, next);
    },
    [surface]
  );

  const reset = useCallback(() => resetModuleOrder(surface), [surface]);

  // Screens only render the modules they currently have data for, so a drag is
  // reported in visible slots and mapped back onto the stored order here.
  const reorderVisible = useCallback(
    (visibleIds: readonly string[], from: number, to: number) => {
      const mapped = resolveVisibleMove(
        getModuleOrder(surface),
        visibleIds,
        from,
        to
      );
      if (mapped) {
        move(mapped.from, mapped.to);
      }
    },
    [move, surface]
  );

  return { order, move, reorderVisible, reset };
}
