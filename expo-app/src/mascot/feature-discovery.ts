import { allowsAmbientBibi, type BibiPresence } from "./bibi-presence";

export const featureDiscoveryVersion = 1;
export const featureDiscoveryStorageKey = "btb-mobile-next-bibi-discovery-v1";

/**
 * How often the product may volunteer something the user did not ask for.
 *
 * `QUIET` silences discovery entirely and does **not** touch the tutorial: one
 * is the product interrupting, the other is the user asking. Collapsing them
 * into a single "Bibi off" switch would mean a user who wants no interruptions
 * also loses the guide they can open on purpose.
 */
export type DiscoveryPace = "NORMAL" | "QUIET";

export interface DiscoveryHint {
  id: string;
  /** Exact tab route this hint makes sense on. */
  route: string;
  title: string;
  body: string;
}

/**
 * What the product knows it hides well.
 *
 * Every hint names a capability that exists today and that has no visible
 * affordance — a long press, a heading that is also a control, a reset buried
 * in a settings list. A hint for something with a button on screen would be
 * noise, and a hint for something unbuilt would be a lie.
 *
 * Hints live on tab routes only. Match Detail and Super Decision Detail are
 * `GUIDE_ONLY` surfaces where Bibi has no ambient presence at all, so a hint
 * about a detail-screen gesture is offered on the list that leads there.
 */
export const discoveryHints: readonly DiscoveryHint[] = [
  {
    id: "overview-reorder",
    route: "/",
    title: "Özet düzenini sen kur",
    body: "Bir modülü basılı tutup istediğin yere taşı. Sıralaman cihazda kalır."
  },
  {
    id: "detail-panels",
    route: "/live",
    title: "Kullanmadığın modülü kapat",
    body: "Maç detayında modül başlığına dokun; o bölüm kapanır ve kapalı kalır."
  },
  {
    id: "super-star-filter",
    route: "/super",
    title: "Yıldıza göre süz",
    body: "Karar günlüğünü yıldız eşiğine göre süzebilir, listeyi kendi eşiğinde tutabilirsin."
  },
  {
    id: "layout-reset",
    route: "/more",
    title: "Düzeni geri al",
    body: "Sıralamayı ve kapattığın modülleri BTB varsayılanına tek dokunuşla döndürebilirsin."
  }
];

/**
 * Pacing for the whole discovery surface.
 *
 * One cooldown governs both the hint and the micro-animation that introduces
 * it, because they are one event. A second timer for the motion would be a
 * second thing to tune, and the two could drift into a mascot that gestures at
 * nothing.
 */
export const discoveryPacing = {
  /** Quiet window after any hint, so discovery cannot cluster. */
  cooldownMs: 4 * 60 * 60 * 1000,
  /** Ceiling per calendar day, independent of how much the app is opened. */
  maxPerDay: 2
} as const;

export interface DiscoveryState {
  version: number;
  pace: DiscoveryPace;
  /**
   * Hints already offered. A hint is retired when it is *shown*, not when it is
   * acknowledged: the user cannot un-see it, so offering it again would be
   * repetition whatever they did with it.
   */
  seenHintIds: string[];
  lastShownAt: number | null;
  /** Local calendar day the counter belongs to. */
  dayStamp: string | null;
  shownOnDay: number;
}

export function defaultDiscoveryState(): DiscoveryState {
  return {
    version: featureDiscoveryVersion,
    pace: "NORMAL",
    seenHintIds: [],
    lastShownAt: null,
    dayStamp: null,
    shownOnDay: 0
  };
}

/**
 * The local calendar day a timestamp belongs to.
 *
 * Local rather than UTC: the cap is a promise about the user's day, and a user
 * in Türkiye would otherwise see the counter reset at 03:00.
 */
export function discoveryDayStamp(now: number): string {
  const date = new Date(now);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseDiscoveryState(raw: string | null): DiscoveryState {
  if (!raw) {
    return defaultDiscoveryState();
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      parsed.version !== featureDiscoveryVersion
    ) {
      return defaultDiscoveryState();
    }
    const known = new Set(discoveryHints.map((hint) => hint.id));
    const seen =
      "seenHintIds" in parsed && Array.isArray(parsed.seenHintIds)
        ? parsed.seenHintIds.filter(
            (id): id is string => typeof id === "string" && known.has(id)
          )
        : [];
    const lastShownAt =
      "lastShownAt" in parsed && typeof parsed.lastShownAt === "number"
        ? parsed.lastShownAt
        : null;
    const shownOnDay =
      "shownOnDay" in parsed &&
      typeof parsed.shownOnDay === "number" &&
      Number.isFinite(parsed.shownOnDay)
        ? Math.max(0, Math.floor(parsed.shownOnDay))
        : 0;
    return {
      version: featureDiscoveryVersion,
      // Anything other than a stored `QUIET` resolves to `NORMAL`, so a
      // corrupted store cannot silently disable a feature the user never
      // switched off.
      pace: "pace" in parsed && parsed.pace === "QUIET" ? "QUIET" : "NORMAL",
      seenHintIds: [...new Set(seen)],
      lastShownAt,
      dayStamp:
        "dayStamp" in parsed && typeof parsed.dayStamp === "string"
          ? parsed.dayStamp
          : null,
      shownOnDay
    };
  } catch {
    return defaultDiscoveryState();
  }
}

/** How many hints have been shown on the day `now` falls in. */
export function shownToday(state: DiscoveryState, now: number): number {
  return state.dayStamp === discoveryDayStamp(now) ? state.shownOnDay : 0;
}

/**
 * The hint the product may offer right now, or `null`.
 *
 * Order matters. The tutorial and presence checks come before pacing so that a
 * suppressed hint never spends a slot: a user reading Match Detail should find
 * their two hints intact when they return to a surface that can carry one.
 */
export function nextDiscoveryHint(
  pathname: string,
  state: DiscoveryState,
  now: number,
  context: { presence: BibiPresence; tutorialActive: boolean }
): DiscoveryHint | null {
  if (state.pace === "QUIET") {
    return null;
  }
  // A guide the user opened always outranks something the product volunteered.
  if (context.tutorialActive) {
    return null;
  }
  // The dense analytical surfaces carry no ambient Bibi, and a discovery hint
  // is ambient by definition. This is checked here rather than left to the
  // route list so the rule survives a future hint pointed at the wrong route.
  if (!allowsAmbientBibi(context.presence)) {
    return null;
  }
  if (shownToday(state, now) >= discoveryPacing.maxPerDay) {
    return null;
  }
  if (
    state.lastShownAt !== null &&
    now - state.lastShownAt < discoveryPacing.cooldownMs
  ) {
    return null;
  }
  const seen = new Set(state.seenHintIds);
  return (
    discoveryHints.find(
      (hint) => hint.route === pathname && !seen.has(hint.id)
    ) ?? null
  );
}

/** Retires a hint and charges it against the cooldown and the daily cap. */
export function recordDiscoveryShown(
  state: DiscoveryState,
  hintId: string,
  now: number
): DiscoveryState {
  const stamp = discoveryDayStamp(now);
  return {
    ...state,
    seenHintIds: state.seenHintIds.includes(hintId)
      ? state.seenHintIds
      : [...state.seenHintIds, hintId],
    lastShownAt: now,
    dayStamp: stamp,
    shownOnDay: shownToday(state, now) + 1
  };
}

export function setDiscoveryPace(
  state: DiscoveryState,
  pace: DiscoveryPace
): DiscoveryState {
  return { ...state, pace };
}
