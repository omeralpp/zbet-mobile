import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import type { AnalysisContext, JinxAssessment } from "@/src/api/schemas";
import { themeMode } from "@/src/theme/theme";
import { JinxAnimator } from "./JinxAnimator";
import { assessmentSignal } from "./jinx-assessment";
import { useJinxMotion } from "./use-jinx-motion";
import { observedJinxEvent } from "./jinx-observed-events";

/** In the assessment's own space, never floating over the analytical content. */
export function JinxMatchAnimator({ context, assessment, current, pending, unavailable }: {
  context: AnalysisContext | undefined; assessment: JinxAssessment | undefined;
  current: boolean; pending: boolean; unavailable: boolean;
}) {
  const matchKey = context?.matchKey ?? "unavailable";
  const revision = context?.evidenceRevision ?? "unavailable";
  const [focused, setFocused] = useState(false);
  useFocusEffect(useCallback(() => {
    setFocused(true);
    return () => setFocused(false);
  }, []));
  // NXT-OBS-173: the card's Jinx idles and breathes like the ambient one.
  const { state, dispatch, finish, preferences, reduceMotion } = useJinxMotion({ matchKey, revision }, true, focused);
  const previous = useRef<AnalysisContext | undefined>(undefined);
  const displayedAssessment = useRef("");
  useEffect(() => {
    const event = observedJinxEvent(previous.current, context);
    previous.current = context;
    if (event) dispatch(event);
  }, [context, dispatch]);
  useEffect(() => {
    if (pending) dispatch({ type: "scene", scene: "thinking" });
    else if (unavailable) dispatch({ type: "scene", scene: "waiting" });
  }, [dispatch, pending, unavailable]);
  useEffect(() => {
    if (!assessment || !current || pending) return;
    const key = `${assessment.matchKey}:${assessment.evidenceRevision}:${assessment.evaluatedAt}`;
    if (displayedAssessment.current === key) return;
    displayedAssessment.current = key;
    dispatch({ type: "answer", context: { matchKey, revision }, verdict: assessment.verdict, current,
      lean: assessmentSignal(assessment)?.lean ?? null });
  }, [assessment, current, dispatch, matchKey, pending, revision]);
  if (!preferences.ready || preferences.hidden) return null;
  return <JinxAnimator compact candidate="orb" state={state} mode={preferences.mode} size={56}
    dark={themeMode === "dark"} forceReducedMotion={reduceMotion} onComplete={finish} />;
}
