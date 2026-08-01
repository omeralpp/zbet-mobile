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

const storageKey = "btb.mobile.live-star-filter.v1";
const defaultFilter: StarDecisionFilter = "STAR_3_PLUS";

type LiveStarFilterContextValue = {
  filter: StarDecisionFilter;
  setFilter: (filter: StarDecisionFilter) => void;
};

const LiveStarFilterContext = createContext<
  LiveStarFilterContextValue | undefined
>(undefined);

export function LiveStarFilterProvider({ children }: PropsWithChildren) {
  const [filter, setFilterState] =
    useState<StarDecisionFilter>(defaultFilter);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(storageKey)
      .then((stored) => {
        const normalized = normalizeStoredStarDecisionFilter(stored);
        if (mounted && normalized) {
          setFilterState(normalized);
          if (stored !== normalized) {
            AsyncStorage.setItem(storageKey, normalized).catch(
              () => undefined
            );
          }
        }
      })
      .catch(() => undefined);
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
    <LiveStarFilterContext.Provider value={value}>
      {children}
    </LiveStarFilterContext.Provider>
  );
}

export function useLiveStarFilter() {
  const context = useContext(LiveStarFilterContext);
  if (!context) {
    throw new Error("LiveStarFilterProvider is missing.");
  }
  return context;
}
