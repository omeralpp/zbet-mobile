import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname } from "expo-router";
import {
  activeTutorialTip,
  defaultTutorialState,
  parseTutorialState,
  tipsForPath,
  tutorialStorageKey,
  type TutorialState,
  type TutorialTip
} from "./tutorial-state";

type TutorialValue = {
  ready: boolean;
  enabled: boolean;
  activeTip: TutorialTip | null;
  activeTargetRect: TutorialTargetRect | null;
  hasNextOnPage: boolean;
  completeActiveTip: () => void;
  setEnabled: (enabled: boolean) => void;
  restart: () => void;
  setTargetRect: (targetId: string, rect: TutorialTargetRect | null) => void;
};

export type TutorialTargetRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const TutorialContext = createContext<TutorialValue | null>(null);

export function TutorialProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<TutorialState>(defaultTutorialState);
  const [measuredTarget, setMeasuredTarget] = useState<{
    id: string;
    rect: TutorialTargetRect;
  } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(tutorialStorageKey)
      .then((stored) => setState(parseTutorialState(stored)))
      .catch(() => setState(defaultTutorialState()))
      .finally(() => setReady(true));
  }, []);

  const updateState = useCallback((next: TutorialState) => {
    setState(next);
    AsyncStorage.setItem(tutorialStorageKey, JSON.stringify(next)).catch(
      () => undefined
    );
  }, []);

  const activeTip = ready ? activeTutorialTip(pathname, state) : null;
  const activeTargetRect =
    activeTip && measuredTarget?.id === activeTip.targetId
      ? measuredTarget.rect
      : null;
  const pageTips = tipsForPath(pathname);
  const hasNextOnPage = Boolean(
    activeTip &&
      pageTips.some(
        (tip) =>
          tip.id !== activeTip.id && !state.completedTipIds.includes(tip.id)
      )
  );

  const completeActiveTip = useCallback(() => {
    if (!activeTip || state.completedTipIds.includes(activeTip.id)) {
      return;
    }
    updateState({
      ...state,
      completedTipIds: [...state.completedTipIds, activeTip.id]
    });
  }, [activeTip, state, updateState]);

  const setEnabled = useCallback(
    (enabled: boolean) => updateState({ ...state, enabled }),
    [state, updateState]
  );
  const restart = useCallback(
    () => updateState(defaultTutorialState()),
    [updateState]
  );
  const setTargetRect = useCallback(
    (targetId: string, rect: TutorialTargetRect | null) => {
      setMeasuredTarget((current) => {
        if (!rect) {
          return current?.id === targetId ? null : current;
        }
        if (
          current?.id === targetId &&
          current.rect.x === rect.x &&
          current.rect.y === rect.y &&
          current.rect.width === rect.width &&
          current.rect.height === rect.height
        ) {
          return current;
        }
        return { id: targetId, rect };
      });
    },
    []
  );

  const value = useMemo<TutorialValue>(
    () => ({
      ready,
      enabled: state.enabled,
      activeTip,
      activeTargetRect,
      hasNextOnPage,
      completeActiveTip,
      setEnabled,
      restart,
      setTargetRect
    }),
    [
      activeTip,
      activeTargetRect,
      completeActiveTip,
      hasNextOnPage,
      ready,
      restart,
      setEnabled,
      setTargetRect,
      state.enabled
    ]
  );

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial(): TutorialValue {
  const value = useContext(TutorialContext);
  if (!value) {
    throw new Error("useTutorial must be used inside TutorialProvider.");
  }
  return value;
}
