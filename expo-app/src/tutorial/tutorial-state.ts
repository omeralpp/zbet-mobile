export const tutorialVersion = 1;
export const tutorialStorageKey = "btb-mobile-next-bibi-tutorial-v1";

export type TutorialTip = {
  id: string;
  title: string;
  body: string;
  route: string;
  match: "EXACT" | "PREFIX";
  target: { x: number; y: number };
};

export type TutorialState = {
  version: number;
  enabled: boolean;
  completedTipIds: string[];
};

export const tutorialTips: readonly TutorialTip[] = [
  {
    id: "home-summary",
    title: "Kısa özet burada",
    body: "Canlı maç, Super ve Toto durumunu tek bakışta bu ekrandan izleyebilirsin.",
    route: "/",
    match: "EXACT",
    target: { x: 0.82, y: 0.14 }
  },
  {
    id: "live-rate",
    title: "Canlı oran hareketi",
    body: "Ok, güncel oranın seçim anındaki orana göre yönünü gösterir.",
    route: "/live",
    match: "EXACT",
    target: { x: 0.58, y: 0.48 }
  },
  {
    id: "live-pressure",
    title: "Baskı tarafı",
    body: "Ev simgesi ev sahibini, uçak simgesi deplasmanın baskıda olduğunu anlatır.",
    route: "/live",
    match: "EXACT",
    target: { x: 0.86, y: 0.48 }
  },
  {
    id: "match-score",
    title: "Canlı maç merkezi",
    body: "Skor, dakika, devre skoru ve oranlar burada güncel maç durumunu gösterir.",
    route: "/match/",
    match: "PREFIX",
    target: { x: 0.5, y: 0.18 }
  },
  {
    id: "match-league",
    title: "Lig bağlamı",
    body: "SAP’ta doğrulanan iki takımın sıra ve puanını bu kompakt tabloda görebilirsin.",
    route: "/match/",
    match: "PREFIX",
    target: { x: 0.5, y: 0.66 }
  },
  {
    id: "super-list",
    title: "Super kararları",
    body: "Yıldız filtresiyle kararları daraltabilir, bir karta dokunarak tarihsel kaydı açabilirsin.",
    route: "/super",
    match: "EXACT",
    target: { x: 0.72, y: 0.32 }
  },
  {
    id: "super-result",
    title: "Karar ve biten skor",
    body: "Karar anı skoru ayrıdır; maç sonuçlandığında biten skor da burada gösterilir.",
    route: "/super/",
    match: "PREFIX",
    target: { x: 0.76, y: 0.2 }
  },
  {
    id: "toto-program",
    title: "Toto programı",
    body: "Program, kolon ve kapsama bilgileri Toto’ya özeldir; BTB Super sonuçlarıyla karıştırılmaz.",
    route: "/toto",
    match: "PREFIX",
    target: { x: 0.7, y: 0.3 }
  },
  {
    id: "more-tutorial",
    title: "Rehber senin kontrolünde",
    body: "Bibi rehberini buradan kapatabilir, kaldığın yerden açabilir veya baştan başlatabilirsin.",
    route: "/more",
    match: "EXACT",
    target: { x: 0.78, y: 0.62 }
  }
] as const;

export function defaultTutorialState(): TutorialState {
  return {
    version: tutorialVersion,
    enabled: true,
    completedTipIds: []
  };
}

export function parseTutorialState(value: string | null): TutorialState {
  if (!value) {
    return defaultTutorialState();
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      parsed.version !== tutorialVersion
    ) {
      return defaultTutorialState();
    }
    const knownTipIds = new Set(tutorialTips.map((tip) => tip.id));
    const completed =
      "completedTipIds" in parsed && Array.isArray(parsed.completedTipIds)
        ? parsed.completedTipIds.filter(
            (id): id is string => typeof id === "string" && knownTipIds.has(id)
          )
        : [];
    return {
      version: tutorialVersion,
      enabled: "enabled" in parsed && parsed.enabled === false ? false : true,
      completedTipIds: [...new Set(completed)]
    };
  } catch {
    return defaultTutorialState();
  }
}

function tipMatchesPath(tip: TutorialTip, pathname: string): boolean {
  if (tip.match === "EXACT") {
    return pathname === tip.route;
  }
  const prefix = tip.route.endsWith("/") ? tip.route : `${tip.route}/`;
  return pathname === prefix.slice(0, -1) || pathname.startsWith(prefix);
}

export function tipsForPath(pathname: string): TutorialTip[] {
  return tutorialTips.filter((tip) => tipMatchesPath(tip, pathname));
}

export function activeTutorialTip(
  pathname: string,
  state: TutorialState
): TutorialTip | null {
  if (!state.enabled) {
    return null;
  }
  const completed = new Set(state.completedTipIds);
  return tipsForPath(pathname).find((tip) => !completed.has(tip.id)) ?? null;
}
