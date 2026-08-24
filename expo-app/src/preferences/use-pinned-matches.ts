import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  equalPinnedKeys,
  normalizeStoredPinnedKeys,
  pinnedMatchesStorageKey,
  reconcilePinnedKeys,
  serializePinnedKeys,
  togglePinnedKey
} from "./pinned-matches";

export function usePinnedMatches(
  eligibleKeys: readonly string[],
  feedReady: boolean
) {
  const [hydrated, setHydrated] = useState(false);
  const [keys, setKeys] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(pinnedMatchesStorageKey)
      .then((stored) => {
        if (mounted) {
          setKeys(normalizeStoredPinnedKeys(stored));
          setHydrated(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setHydrated(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const reconciledKeys = useMemo(
    () =>
      hydrated && feedReady
        ? reconcilePinnedKeys(keys, eligibleKeys)
        : new Set(keys),
    [eligibleKeys, feedReady, hydrated, keys]
  );

  useEffect(() => {
    if (hydrated && feedReady && !equalPinnedKeys(keys, reconciledKeys)) {
      AsyncStorage.setItem(
        pinnedMatchesStorageKey,
        serializePinnedKeys(reconciledKeys)
      ).catch(() => undefined);
    }
  }, [feedReady, hydrated, keys, reconciledKeys]);

  const toggle = useCallback(
    (matchKey: string) => {
      setKeys((current) => {
        const currentEligible =
          hydrated && feedReady
            ? reconcilePinnedKeys(current, eligibleKeys)
            : current;
        const next = togglePinnedKey(currentEligible, matchKey);
        AsyncStorage.setItem(
          pinnedMatchesStorageKey,
          serializePinnedKeys(next)
        ).catch(() => undefined);
        return next;
      });
    },
    [eligibleKeys, feedReady, hydrated]
  );

  return { hydrated, keys: reconciledKeys, toggle };
}
