import { useCallback, useEffect, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  moduleCollapseStorageKey,
  reconcileCollapsedModules,
  toggleCollapsedModule
} from "./module-collapse";
import {
  moduleLayoutSurfaces,
  parseStoredModulePreference,
  type ModuleLayoutSurface
} from "./module-layout";
import { moduleLayoutDefaults } from "./module-registry";

type Listener = () => void;

const listeners = new Set<Listener>();
// Every surface starts fully expanded. Hydration can only ever close panels the
// user closed, never open something on their behalf.
const state = new Map<ModuleLayoutSurface, string[]>(
  moduleLayoutSurfaces.map((surface) => [surface, []])
);
let hydration: Promise<void> | null = null;

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  return (
    left.length === right.length &&
    left.every((entry, index) => entry === right[index])
  );
}

function commit(surface: ModuleLayoutSurface, collapsed: string[]): void {
  const current = state.get(surface);
  // Snapshot identity must stay stable for useSyncExternalStore, so an
  // equivalent set never replaces the stored array.
  if (current && sameSet(current, collapsed)) {
    return;
  }
  state.set(surface, collapsed);
  notify();
}

async function persist(
  surface: ModuleLayoutSurface,
  collapsed: readonly string[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      moduleCollapseStorageKey(surface),
      JSON.stringify(collapsed)
    );
  } catch {
    // A failed write only costs the preference; the session keeps the state.
  }
}

/** Loads every persisted surface collapse preference once per app session. */
export function hydrateModuleCollapse(): Promise<void> {
  hydration ??= (async () => {
    try {
      const entries = await AsyncStorage.multiGet(
        moduleLayoutSurfaces.map(moduleCollapseStorageKey)
      );
      const stored = new Map(entries);
      for (const surface of moduleLayoutSurfaces) {
        commit(
          surface,
          reconcileCollapsedModules(
            parseStoredModulePreference(
              stored.get(moduleCollapseStorageKey(surface))
            ),
            moduleLayoutDefaults[surface]
          )
        );
      }
    } catch {
      // Unreadable storage leaves every panel open, which is the state a user
      // who has never collapsed anything would expect to find.
    }
  })();
  return hydration;
}

export function getCollapsedModules(surface: ModuleLayoutSurface): string[] {
  return state.get(surface) ?? [];
}

/** Reopens every panel on a surface. */
export async function expandAllModules(
  surface: ModuleLayoutSurface
): Promise<void> {
  commit(surface, []);
  try {
    await AsyncStorage.removeItem(moduleCollapseStorageKey(surface));
  } catch {
    // Losing the removal still leaves the session fully expanded.
  }
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * The collapse preference for one surface.
 *
 * Kept as its own hook and its own store rather than a field on the layout
 * store: order and collapse are independent preferences, and a shared snapshot
 * would make every reorder re-render each panel and every toggle re-render the
 * reorder list.
 */
export function useModuleCollapse(surface: ModuleLayoutSurface) {
  useEffect(() => {
    void hydrateModuleCollapse();
  }, []);

  const collapsed = useSyncExternalStore(
    subscribe,
    () => getCollapsedModules(surface),
    () => getCollapsedModules(surface)
  );

  const toggle = useCallback(
    (id: string) => {
      const next = toggleCollapsedModule(getCollapsedModules(surface), id);
      commit(surface, next);
      void persist(surface, next);
    },
    [surface]
  );

  const expandAll = useCallback(() => expandAllModules(surface), [surface]);

  return { collapsed, toggle, expandAll };
}
