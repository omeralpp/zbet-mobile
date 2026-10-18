import { useCallback, useEffect, useReducer } from "react";
import { AppState } from "react-native";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";
import { useJinxPreferences } from "./JinxPreferencesProvider";
import { createJinxMotionState, jinxMotionReducer, type JinxMotionContext } from "./jinx-motion";

/** One owner per visible character. No timers or travel survive a hidden app. */
export function useJinxMotion(context: JinxMotionContext, ambient = false, visible = true) {
  const preferences = useJinxPreferences();
  const reduceMotion = useReducedMotion();
  const [state, dispatch] = useReducer(jinxMotionReducer, context, createJinxMotionState);
  useEffect(() => {
    dispatch({ type: "context", context: { matchKey: context.matchKey, revision: context.revision } });
  }, [context.matchKey, context.revision]);
  useEffect(() => {
    dispatch({ type: "active", active: visible && AppState.currentState === "active" });
    const listener = AppState.addEventListener("change", next => dispatch({ type: "active", active: visible && next === "active" }));
    return () => listener.remove();
  }, [visible]);
  useEffect(() => {
    if (!preferences.ready || preferences.hidden || preferences.mode !== "LIVE" || reduceMotion || !ambient || !state.active || state.blocked || state.scene !== "idle") return;
    const timer = setTimeout(() => dispatch({ type: "scene", scene: "idle" }), 10_000 + Math.random() * 5000);
    return () => clearTimeout(timer);
  }, [ambient, preferences.hidden, preferences.mode, preferences.ready, reduceMotion, state.active, state.blocked, state.scene, state.sequence]);
  const finish = useCallback((sequence: number) => dispatch({ type: "finish", sequence }), []);
  return { state, dispatch, finish, preferences, reduceMotion: reduceMotion || preferences.mode === "OFF" || !preferences.ready };
}
