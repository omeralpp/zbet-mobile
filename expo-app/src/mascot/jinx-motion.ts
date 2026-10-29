/** Presentation only. No scene can create or change a betting verdict or lean. */
export type JinxCandidate = "orb" | "fox";
export type JinxMotionMode = "LIVE" | "CALM" | "OFF";
export type JinxScene = "idle" | "greeting" | "touch" | "drag" | "thinking" | "answer" | "cheer" | "doubt" | "goal" | "halfTime" | "waiting" | "guide";
export type JinxVerdict = "FAVORABLE" | "UNFAVORABLE" | "WAIT";
export type JinxLeanMotion = "FAVORABLE" | "NEUTRAL" | "UNFAVORABLE";
export type JinxMotionContext = { matchKey: string; revision: string };
export type JinxMotionState = {
  context: JinxMotionContext;
  scene: JinxScene;
  sequence: number;
  seen: readonly string[];
  active: boolean;
  blocked: boolean;
  message: string;
};
export type JinxMotionAction =
  | { type: "context"; context: JinxMotionContext }
  | { type: "active"; active: boolean }
  | { type: "interaction"; blocked: boolean }
  | { type: "scene"; scene: Exclude<JinxScene, "goal" | "halfTime" | "answer" | "cheer" | "doubt"> }
  | { type: "answer"; context: JinxMotionContext; verdict: JinxVerdict; current: boolean; lean?: JinxLeanMotion | null }
  | { type: "event"; context: JinxMotionContext; eventId: string; kind: "GOAL" | "HALF_TIME" | "SCORE_CORRECTION"; verified: boolean }
  | { type: "finish"; sequence: number };

export const sceneCopy: Record<JinxScene, { label: string; message: string; duration: number }> = {
  idle: { label: "Dinlenme", message: "Saha sakin. Ben buradayım.", duration: 1500 },
  greeting: { label: "Karşılama", message: "Hazırsan maça birlikte bakalım!", duration: 1400 },
  touch: { label: "Dokunma", message: "Buradayım! Top bende.", duration: 850 },
  drag: { label: "Sürükleme", message: "Dengemi buluyorum…", duration: 1100 },
  thinking: { label: "Jinx’e sor", message: "Havuzu, baskıyı ve oranı inceliyorum.", duration: 1800 },
  answer: { label: "Yanıt", message: "Yorum hazır.", duration: 1100 },
  cheer: { label: "Lehte", message: "Veriler bu seçimin lehine.", duration: 1600 },
  doubt: { label: "Aleyhte", message: "Veriler bu seçimin aleyhine.", duration: 1400 },
  goal: { label: "Gol olayı", message: "Gol kaydı geldi. Skorun güncel hâlini kontrol et.", duration: 1700 },
  halfTime: { label: "Devre arası", message: "Devre arası. Taktik tahtasına kısa bir bakış.", duration: 1600 },
  waiting: { label: "Veri bekleme", message: "Veri eksik veya güncel değil; yorum bekliyor.", duration: 1000 },
  guide: { label: "Rehber", message: "İpucu: seçim ve güncel oran ayrı zamanlara ait.", duration: 1450 }
};

export function createJinxMotionState(context: JinxMotionContext): JinxMotionState {
  return { context, scene: "idle", sequence: 0, seen: [], active: true, blocked: false, message: sceneCopy.idle.message };
}

function sameContext(a: JinxMotionContext, b: JinxMotionContext): boolean {
  return a.matchKey === b.matchKey && a.revision === b.revision;
}

function present(state: JinxMotionState, scene: JinxScene, message = sceneCopy[scene].message): JinxMotionState {
  return { ...state, scene, message, sequence: state.sequence + 1 };
}

/** Interrupted events are consumed, never queued for a surprising later celebration. */
export function jinxMotionReducer(state: JinxMotionState, action: JinxMotionAction): JinxMotionState {
  switch (action.type) {
    case "context":
      return sameContext(state.context, action.context) ? state : {
        ...present(state, "idle"), context: action.context, blocked: false,
        seen: state.context.matchKey === action.context.matchKey ? state.seen : []
      };
    case "active":
      return action.active === state.active ? state : { ...present(state, "idle"), active: action.active, blocked: false };
    case "interaction":
      return { ...present(state, "idle"), blocked: action.blocked };
    case "finish":
      return action.sequence === state.sequence && state.scene !== "idle" ? { ...state, scene: "idle" } : state;
    case "scene":
      return !state.active || state.blocked ? state : present(state, action.scene);
    case "answer":
      if (!state.active || state.blocked || !sameContext(state.context, action.context)) return state;
      if (!action.current) return present(state, "waiting");
      // The pilot lean picks the reaction; a reading without one stays neutral.
      if (action.lean === "FAVORABLE") return present(state, "cheer");
      if (action.lean === "UNFAVORABLE") return present(state, "doubt");
      if (action.lean === "NEUTRAL") return present(state, "answer", "Havuz ve piyasa dengede.");
      return present(state, "answer", action.verdict === "WAIT"
        ? "Maç yorumu hazır. Bahis önerisi yok."
        : "Değerlendirme hazır. Kararı ve kanıtını oku.");
    case "event": {
      if (!action.verified || !action.eventId.trim() || !sameContext(state.context, action.context)) return state;
      if (state.seen.includes(action.eventId)) return state;
      const consumed = { ...state, seen: [...state.seen, action.eventId].slice(-64) };
      if (action.kind === "SCORE_CORRECTION") return present(consumed, "waiting", "Skor kaydı düzeltildi. Önceki tepki iptal edildi.");
      if (!state.active || state.blocked) return consumed;
      return present(consumed, action.kind === "GOAL" ? "goal" : "halfTime");
    }
  }
}

export function resolveJinxMotion(mode: JinxMotionMode, reduceMotion: boolean, active: boolean) {
  const enabled = mode !== "OFF" && !reduceMotion && active;
  return { enabled, amplitude: enabled ? mode === "CALM" ? 0.45 : 1.35 : 0, ambient: enabled && mode === "LIVE" };
}

/** Renderer authority: direct scenes may own an interaction, decorative loops may not. */
export function resolveJinxRendererMotion({ mode, reduceMotion, forceReducedMotion, foreground, asleep, state }: {
  mode: JinxMotionMode;
  reduceMotion: boolean;
  forceReducedMotion: boolean;
  foreground: boolean;
  asleep: boolean;
  state: Pick<JinxMotionState, "active" | "blocked" | "scene">;
}) {
  const base = resolveJinxMotion(mode, reduceMotion || forceReducedMotion || asleep, state.active && foreground);
  const directScene = state.scene === "drag" || state.scene === "guide";
  const enabled = base.enabled && (!state.blocked || directScene);
  return {
    enabled,
    amplitude: enabled ? base.amplitude : 0,
    breathe: enabled && !state.blocked,
    ambient: enabled && base.ambient && !state.blocked && state.scene === "idle",
    blink: enabled && !state.blocked && state.scene !== "drag",
    spark: enabled && !state.blocked && state.scene !== "idle"
  };
}

export function designLabAvailable(config: { useMocks: boolean; authMode: string }): boolean {
  return config.useMocks && config.authMode === "preview";
}
