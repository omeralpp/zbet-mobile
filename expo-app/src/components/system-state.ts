/**
 * BTB's system-state vocabulary.
 *
 * The product distinguishes eight situations. The UI offered three — loading,
 * empty and error — so five of them arrived at the user wearing the wrong
 * clothes: a market that closed looked like a crash, an empty filter looked like
 * a failure, and stale data looked like current data.
 *
 * Honest state is already this codebase's strongest habit at the data layer.
 * This module carries the same discipline into presentation, and the rules that
 * matter are enforced by tests rather than left to each screen:
 *
 * **Only a genuine problem is allowed to look alarming.** A closed market, an
 * empty filter and a provider that did not answer are all situations where the
 * rest of the screen still works and the user has nothing to do. Dressing them
 * in error styling teaches people to ignore the styling, which costs the one
 * case that really did need them.
 *
 * **Retry is offered only where retrying can change the answer.** A retry button
 * on an empty list is theatre: it re-fetches the same emptiness and implies the
 * user did something wrong.
 *
 * **Stale never claims to be current.** It is the one tone that says the screen
 * is showing something real but unconfirmed, and it must not be silently
 * upgraded to a normal state.
 */

export type SystemStateKind =
  | "LOADING"
  | "EMPTY"
  | "NO_LIVE_MATCH"
  | "NO_DECISION"
  | "STALE"
  | "REFRESH_FAILED"
  | "UNAVAILABLE"
  | "OFFLINE";

/**
 * How loudly a state is allowed to present itself.
 *
 * - `WAITING`  something is in flight; nothing is wrong.
 * - `NEUTRAL`  there is genuinely nothing here, and that is a normal answer.
 * - `CAUTION`  what is shown is real but unconfirmed, or a source is quiet.
 * - `PROBLEM`  the user has to act before anything can improve.
 */
export type SystemStateTone = "WAITING" | "NEUTRAL" | "CAUTION" | "PROBLEM";

export interface SystemStateSpec {
  tone: SystemStateTone;
  icon: string;
  title: string;
  body: string;
  /** Whether a retry control may be shown. See the module note. */
  retryable: boolean;
}

const specs: Record<SystemStateKind, SystemStateSpec> = {
  LOADING: {
    tone: "WAITING",
    icon: "progress-clock",
    title: "Veriler hazırlanıyor",
    body: "Birkaç saniye sürebilir.",
    retryable: false
  },
  EMPTY: {
    tone: "NEUTRAL",
    icon: "tray",
    title: "Burada bir şey yok",
    body: "Bu görünüm için gösterilecek kayıt bulunmuyor.",
    retryable: false
  },
  NO_LIVE_MATCH: {
    tone: "NEUTRAL",
    icon: "soccer-field",
    title: "Şu anda canlı maç yok",
    body: "Yeni maçlar başladığında burada görünür.",
    retryable: false
  },
  NO_DECISION: {
    tone: "NEUTRAL",
    icon: "star-outline",
    title: "Super kararı yok",
    body: "BTB bu görünümde bir seçim yapmadı.",
    retryable: false
  },
  STALE: {
    tone: "CAUTION",
    icon: "clock-alert-outline",
    title: "Veri güncellenemedi",
    body: "Gösterilen bilgi son alınan haliyle duruyor.",
    retryable: true
  },
  // `REFRESH_FAILED` and `UNAVAILABLE` differ only to telemetry. To the user
  // both mean "nothing new to show right now", and neither names a third party,
  // an HTTP status or an error code.
  REFRESH_FAILED: {
    tone: "CAUTION",
    icon: "cloud-off-outline",
    title: "Şu anda yenilenemiyor",
    body: "Ekranın geri kalanı etkilenmez.",
    retryable: true
  },
  UNAVAILABLE: {
    tone: "CAUTION",
    icon: "cloud-off-outline",
    title: "Şu anda gösterilemiyor",
    body: "Ekranın geri kalanı etkilenmez.",
    retryable: false
  },
  OFFLINE: {
    tone: "PROBLEM",
    icon: "wifi-off",
    title: "Bağlantı yok",
    body: "Cihaz çevrimdışı görünüyor.",
    retryable: true
  }
};

export function resolveSystemState(kind: SystemStateKind): SystemStateSpec {
  return specs[kind];
}

/** Whether a tone may use problem styling. Exactly one tone may. */
export function isAlarming(tone: SystemStateTone): boolean {
  return tone === "PROBLEM";
}

/**
 * Whether the state still shows real data underneath it.
 *
 * A stale surface keeps its content and adds a caution; an unavailable one has
 * nothing to keep. The distinction decides whether a screen renders the state
 * inline beside its data or in place of it.
 */
export function retainsContent(kind: SystemStateKind): boolean {
  return kind === "STALE";
}
