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
  defaultListDensity,
  listDensityStorageKey,
  normalizeListDensity,
  type ListDensity
} from "./list-density";

type ListDensityContextValue = {
  density: ListDensity;
  setDensity: (density: ListDensity) => void;
};

const ListDensityContext = createContext<ListDensityContextValue | undefined>(undefined);

/** Per-device list density for the phone Canlı and Super lists. */
export function ListDensityProvider({ children }: PropsWithChildren) {
  const [density, setDensityState] = useState<ListDensity>(defaultListDensity);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(listDensityStorageKey)
      .then((stored) => {
        if (mounted) setDensityState(normalizeListDensity(stored));
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const setDensity = useCallback((next: ListDensity) => {
    setDensityState(next);
    AsyncStorage.setItem(listDensityStorageKey, next).catch(() => undefined);
  }, []);

  const value = useMemo(() => ({ density, setDensity }), [density, setDensity]);

  return <ListDensityContext.Provider value={value}>{children}</ListDensityContext.Provider>;
}

export function useListDensity(): ListDensityContextValue {
  const context = useContext(ListDensityContext);
  if (!context) {
    throw new Error("useListDensity must be used inside ListDensityProvider");
  }
  return context;
}
