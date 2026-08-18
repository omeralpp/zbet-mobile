import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BibiPresence } from "./bibi-presence";
import {
  defaultDiscoveryState,
  featureDiscoveryStorageKey,
  nextDiscoveryHint,
  parseDiscoveryState,
  recordDiscoveryShown,
  setDiscoveryPace,
  type DiscoveryHint,
  type DiscoveryPace,
  type DiscoveryState
} from "./feature-discovery";

type DiscoveryValue = {
  ready: boolean;
  pace: DiscoveryPace;
  activeHint: DiscoveryHint | null;
  /**
   * Asks whether this surface has something to offer, and offers it if so.
   *
   * The caller supplies presence and tutorial state because the mascot overlay
   * is what knows them; the pacing rules stay in `feature-discovery`.
   */
  consider: (
    pathname: string,
    context: { presence: BibiPresence; tutorialActive: boolean }
  ) => void;
  dismissActiveHint: () => void;
  setPace: (pace: DiscoveryPace) => void;
};

const DiscoveryContext = createContext<DiscoveryValue | null>(null);

/**
 * Feature discovery: the product volunteering something, at most rarely.
 *
 * Kept apart from the tutorial on purpose. The tutorial is a guide the user
 * opens and can finish; discovery is an interruption the user did not ask for,
 * so it carries its own store, its own pacing and its own off switch. Sharing
 * one switch would mean silencing the interruption also closes the guide.
 *
 * Everything is local. No hint is fetched, scheduled or targeted from a server:
 * a promotional channel is a different product decision, and building the
 * transport for one "because it might be useful later" is how a help feature
 * turns into a marketing surface.
 */
export function DiscoveryProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<DiscoveryState>(defaultDiscoveryState);
  const [activeHint, setActiveHint] = useState<DiscoveryHint | null>(null);
  // `consider` runs from a timer, so it reads the latest state through refs
  // rather than through a closure that was captured when the timer was set.
  const stateRef = useRef(state);
  const activeRef = useRef<DiscoveryHint | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(featureDiscoveryStorageKey)
      .then((stored) => {
        const parsed = parseDiscoveryState(stored);
        stateRef.current = parsed;
        setState(parsed);
      })
      .catch(() => {
        stateRef.current = defaultDiscoveryState();
        setState(defaultDiscoveryState());
      })
      .finally(() => setReady(true));
  }, []);

  const updateState = useCallback((next: DiscoveryState) => {
    stateRef.current = next;
    setState(next);
    AsyncStorage.setItem(
      featureDiscoveryStorageKey,
      JSON.stringify(next)
    ).catch(() => undefined);
  }, []);

  const consider = useCallback<DiscoveryValue["consider"]>(
    (pathname, context) => {
      if (!ready || activeRef.current) {
        return;
      }
      const at = Date.now();
      const hint = nextDiscoveryHint(pathname, stateRef.current, at, context);
      if (!hint) {
        return;
      }
      // Charged against the cooldown and the cap at the moment of showing, so
      // a hint the user swipes away still counts as offered and never returns.
      activeRef.current = hint;
      setActiveHint(hint);
      updateState(recordDiscoveryShown(stateRef.current, hint.id, at));
    },
    [ready, updateState]
  );

  const dismissActiveHint = useCallback(() => {
    activeRef.current = null;
    setActiveHint(null);
  }, []);

  const setPace = useCallback(
    (pace: DiscoveryPace) => {
      if (pace === "QUIET") {
        activeRef.current = null;
        setActiveHint(null);
      }
      updateState(setDiscoveryPace(stateRef.current, pace));
    },
    [updateState]
  );

  const value = useMemo<DiscoveryValue>(
    () => ({
      ready,
      pace: state.pace,
      activeHint,
      consider,
      dismissActiveHint,
      setPace
    }),
    [activeHint, consider, dismissActiveHint, ready, setPace, state.pace]
  );

  return (
    <DiscoveryContext.Provider value={value}>
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery(): DiscoveryValue {
  const value = useContext(DiscoveryContext);
  if (!value) {
    throw new Error("useDiscovery must be used inside DiscoveryProvider.");
  }
  return value;
}
