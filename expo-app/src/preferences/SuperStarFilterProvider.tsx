import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import {
  normalizeStoredStarDecisionFilter,
  type StarDecisionFilter
} from "@/src/utils/decision-filters";

const storageKey = "btb.mobile.super-star-filter.v1";
export const defaultSuperStarFilter: StarDecisionFilter = "STAR_3_PLUS";

export async function readSuperStarFilter(): Promise<StarDecisionFilter> {
  try {
    const stored = await AsyncStorage.getItem(storageKey);
    const normalized = normalizeStoredStarDecisionFilter(stored);
    if (normalized && normalized !== stored) {
      await AsyncStorage.setItem(storageKey, normalized);
    }
    return normalized ?? defaultSuperStarFilter;
  } catch {
    return defaultSuperStarFilter;
  }
}

type SuperStarFilterContextValue = {
  filter: StarDecisionFilter;
  setFilter: (filter: StarDecisionFilter) => void;
};

const SuperStarFilterContext = createContext<
  SuperStarFilterContextValue | undefined
>(undefined);

export function SuperStarFilterProvider({ children }: PropsWithChildren) {
  const [filter, setFilterState] =
    useState<StarDecisionFilter>(defaultSuperStarFilter);

  useEffect(() => {
    let mounted = true;
    readSuperStarFilter().then((stored) => {
      if (mounted) {
        setFilterState(stored);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setFilter = useCallback((nextFilter: StarDecisionFilter) => {
    setFilterState(nextFilter);
    AsyncStorage.setItem(storageKey, nextFilter).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({ filter, setFilter }),
    [filter, setFilter]
  );

  return (
    <SuperStarFilterContext.Provider value={value}>
      {children}
    </SuperStarFilterContext.Provider>
  );
}

export function useSuperStarFilter() {
  const context = useContext(SuperStarFilterContext);
  if (!context) {
    throw new Error("SuperStarFilterProvider is missing.");
  }
  return context;
}
