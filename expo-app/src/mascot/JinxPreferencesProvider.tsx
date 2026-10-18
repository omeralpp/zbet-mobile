import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { defaultJinxPreferences, jinxPreferencesKey, parseJinxPreferences, type JinxPreferences } from "./jinx-preferences";
import type { JinxMotionMode } from "./jinx-motion";

type JinxPreferencesValue = JinxPreferences & {
  ready: boolean; saveFailed: boolean; denseSurface: boolean;
  setMode: (mode: JinxMotionMode) => void;
  setHidden: (hidden: boolean) => void;
  registerDenseSurface: () => () => void;
};
const Context = createContext<JinxPreferencesValue | null>(null);

export function JinxPreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState(defaultJinxPreferences);
  const [ready, setReady] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [surfaces, setSurfaces] = useState<readonly symbol[]>([]);
  const touched = useRef(false);
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(jinxPreferencesKey).then(stored => {
      if (mounted && !touched.current) setPreferences(parseJinxPreferences(stored));
    }).catch(() => { if (mounted) setSaveFailed(true); }).finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    if (!ready) return;
    let mounted = true;
    AsyncStorage.setItem(jinxPreferencesKey, JSON.stringify(preferences)).then(() => { if (mounted) setSaveFailed(false); }).catch(() => { if (mounted) setSaveFailed(true); });
    return () => { mounted = false; };
  }, [preferences, ready]);
  const setMode = useCallback((mode: JinxMotionMode) => { touched.current = true; setPreferences(previous => ({ ...previous, mode })); }, []);
  const setHidden = useCallback((hidden: boolean) => { touched.current = true; setPreferences(previous => ({ ...previous, hidden })); }, []);
  const registerDenseSurface = useCallback(() => {
    const key = Symbol("analytical-surface");
    setSurfaces(previous => [...previous, key]);
    return () => setSurfaces(previous => previous.filter(item => item !== key));
  }, []);
  const value = useMemo(() => ({ ...preferences, ready, saveFailed, denseSurface: surfaces.length > 0, setMode, setHidden, registerDenseSurface }), [preferences, ready, saveFailed, surfaces.length, setMode, setHidden, registerDenseSurface]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useJinxPreferences() {
  const value = useContext(Context);
  if (!value) throw new Error("JinxPreferencesProvider is missing.");
  return value;
}

/** Mounted content controls density, including the web /live embedded detail. */
export function useJinxAnalyticalSurface() {
  const { registerDenseSurface } = useJinxPreferences();
  // Tab screens stay mounted. Only the focused analytical screen reserves space.
  useFocusEffect(useCallback(() => registerDenseSurface(), [registerDenseSurface]));
}
