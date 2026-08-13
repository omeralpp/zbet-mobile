export const tutorialVersion = 2;
export const tutorialStorageKey = "btb-mobile-next-bibi-tutorial-v2";

export type TutorialTip = {
  id: string;
  title: string;
  body: string;
  route: string;
  match: "EXACT" | "PREFIX";
  targetId: string;
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
    targetId: "home-hero"
  },
  {
    id: "live-rate",
    title: "Canlı oran hareketi",
    body: "Ok, güncel oranın seçim anındaki orana göre yönünü gösterir.",
    route: "/live",
    match: "EXACT",
    targetId: "live-first-card"
  },
  {
    id: "home-live-summary",
    title: "Takipteki canlı maçlar",
    body: "Bu maç kartı skor, canlı oran ve baskı yönünü birlikte gösterir; dokunarak maç detayını açabilirsin.",
    route: "/",
    match: "EXACT",
    targetId: "home-featured"
  },
  {
    id: "home-super-summary",
    title: "Günlük Super",
    body: "Bu metrik, seçili yıldız filtresindeki güncel Super sonuçlarını özetler; kazanç ve kayıp sayısını birlikte gösterir.",
    route: "/",
    match: "EXACT",
    targetId: "home-super-metric"
  },
  {
    id: "live-pressure",
    title: "Baskı tarafı",
    body: "Ev simgesi ev sahibini, uçak simgesi deplasmanın baskıda olduğunu anlatır.",
    route: "/live",
    match: "EXACT",
    targetId: "live-first-card"
  },
  {
    id: "match-score",
    title: "Canlı maç merkezi",
    body: "Skor, dakika, devre skoru ve oranlar burada güncel maç durumunu gösterir.",
    route: "/match/",
    match: "PREFIX",
    targetId: "match-summary"
  },
  {
    id: "match-league",
    title: "Lig bağlamı",
    body: "SAP’ta doğrulanan iki takımın sıra ve puanını bu kompakt tabloda görebilirsin.",
    route: "/match/",
    match: "PREFIX",
    targetId: "match-standings"
  },
  {
    id: "super-list",
    title: "Super kararları",
    body: "Yıldız filtresiyle kararları daraltabilir, bir karta dokunarak tarihsel kaydı açabilirsin.",
    route: "/super",
    match: "EXACT",
    targetId: "super-first-card"
  },
  {
    id: "live-filters",
    title: "Canlı filtreleri",
    body: "Canlı, Tümü ve yıldız filtresi arasında geçiş yaparak yalnızca görmek istediğin maçları listelersin.",
    route: "/live",
    match: "EXACT",
    targetId: "live-filters"
  },
  {
    id: "super-filters",
    title: "Super filtreleri",
    body: "Karar günlüğünde durum ve yıldız filtresi birlikte çalışır; yıldız menüsünü açarak 1+ ile 5 yıldız arasını seçebilirsin.",
    route: "/super",
    match: "EXACT",
    targetId: "super-filters"
  },
  {
    id: "super-result",
    title: "Karar ve biten skor",
    body: "Karar anı skoru ayrıdır; maç sonuçlandığında biten skor da burada gösterilir.",
    route: "/super/",
    match: "PREFIX",
    targetId: "super-summary"
  },
  {
    id: "toto-program",
    title: "Toto programı",
    body: "Program, kolon ve kapsama bilgileri Toto’ya özeldir; BTB Super sonuçlarıyla karıştırılmaz.",
    route: "/toto",
    match: "EXACT",
    targetId: "toto-first-card"
  },
  {
    id: "toto-status",
    title: "Toto program durumu",
    body: "Aktif, sonuç bekliyor ve sonuçlandı etiketleri programın hangi aşamada olduğunu gösterir.",
    route: "/toto",
    match: "EXACT",
    targetId: "toto-first-card"
  },
  {
    id: "more-tutorial",
    title: "Rehber senin kontrolünde",
    body: "Bibi rehberini buradan kapatabilir, kaldığın yerden açabilir veya baştan başlatabilirsin.",
    route: "/more",
    match: "EXACT",
    targetId: "more-tutorial-restart"
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
  const matching = tutorialTips.filter((tip) => tipMatchesPath(tip, pathname));
  const preferredOrder: Record<string, readonly string[]> = {
    "/": ["home-summary", "home-super-summary", "home-live-summary"],
    "/live": ["live-filters", "live-rate", "live-pressure"],
    "/super": ["super-filters", "super-list"],
    "/toto": ["toto-status", "toto-program"]
  };
  const order = preferredOrder[pathname];
  if (!order) {
    return matching;
  }
  return [...matching].sort((left, right) => {
    const leftIndex = order.indexOf(left.id);
    const rightIndex = order.indexOf(right.id);
    return (
      (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) -
      (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex)
    );
  });
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
