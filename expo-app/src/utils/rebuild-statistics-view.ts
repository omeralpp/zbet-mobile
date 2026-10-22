import type { RebuildStatistics } from "@/src/api/rebuild-statistics-schemas";

/**
 * The RB1 live statistics panel (btb-match-statistics.v1). Every value comes
 * from the one verified observation: null stays "—", a measured zero is "0",
 * and nothing is filled from the legacy match columns.
 */
type HomeField<Key> = Key extends `home${infer Name}` ? Name : never;
type Field = HomeField<keyof RebuildStatistics["statistics"]>;
type Format = "count" | "percent" | "xg";

export interface StatisticsRow {
  metric: string;
  label: string;
  home: number | null;
  away: number | null;
  homeText: string;
  awayText: string;
  note: string | null;
}

const rows: readonly { metric: string; field: Field; label: string; format: Format; note?: string }[] = [
  { metric: "possession", field: "BallPossession", label: "Topla oynama", format: "percent" },
  { metric: "totalShots", field: "TotalShots", label: "Toplam şut", format: "count" },
  { metric: "shotsOnTarget", field: "ShotsOnTarget", label: "İsabetli şut", format: "count" },
  { metric: "xg", field: "Xg", label: "xG", format: "xg" },
  { metric: "corners", field: "Corners", label: "Korner", format: "count" },
  { metric: "boxTouches", field: "BoxTouches", label: "Rakip ceza sahasında topla temas", format: "count" },
  { metric: "blockedShots", field: "BlockedShots", label: "Engellenen şut girişimi", format: "count" },
  { metric: "goalkeeperSaves", field: "GoalkeeperSaves", label: "Kaleci kurtarışı", format: "count",
    note: "Her takımın kendi kalecisinin kurtarışları." },
  { metric: "yellowCards", field: "YellowCards", label: "Sarı kart", format: "count" },
  { metric: "redCards", field: "RedCards", label: "Kırmızı kart", format: "count" }
];

const xgFormat = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatStatistic(value: number | null, format: Format): string {
  if (value === null) return "—";
  if (format === "percent") return `%${value}`;
  return format === "xg" ? xgFormat.format(value) : String(value);
}

export function statisticsRows(statistics: RebuildStatistics): StatisticsRow[] {
  const values = statistics.statistics;
  return rows.map((row) => {
    const home = values[`home${row.field}`];
    const away = values[`away${row.field}`];
    const xgUnscoped = row.metric === "xg" && (home !== null || away !== null) && !statistics.xgScopeVerified;
    return {
      metric: row.metric, label: row.label, home, away,
      homeText: formatStatistic(home, row.format), awayText: formatStatistic(away, row.format),
      note: xgUnscoped ? "xG kapsamı doğrulanmadı." : row.note ?? null
    };
  });
}

const timeFormat = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Europe/Istanbul" });

/** Measurement time and completeness, or why no current statistics are shown. */
export function statisticsStatus(statistics: RebuildStatistics): { tone: "live" | "partial" | "muted"; text: string; values: boolean } {
  if (statistics.availability === "AVAILABLE" || statistics.availability === "PARTIAL") {
    const at = statistics.observedAt ? timeFormat.format(new Date(statistics.observedAt)) : null;
    const when = [statistics.elapsed !== null ? `${statistics.elapsed}′` : null, at].filter(Boolean).join(" · ");
    return statistics.availability === "AVAILABLE"
      ? { tone: "live", text: `Doğrulanmış ölçüm · ${when}`, values: true }
      : { tone: "partial", text: `Doğrulanmış ölçüm · ${when} · bazı ölçümler eksik`, values: true };
  }
  if (statistics.availability === "NOT_STARTED") {
    return { tone: "muted", text: "Maç başlamadı; istatistikler ilk doğrulanmış ölçümle gelir.", values: false };
  }
  const text = statistics.reason === "STATISTICS_STALE"
    ? "Son doğrulanmış ölçüm iki dakikadan eski; güncel istatistik gösterilmiyor."
    : statistics.reason === "DUMMY_NOT_PUBLISHED"
      ? "Örnek veride doğrulanmış istatistik yok."
      : "Güncel istatistik doğrulanamadı; eski değer gösterilmiyor.";
  return { tone: "muted", text, values: false };
}
