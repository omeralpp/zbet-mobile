import type {
  MatchStatus,
  TotoProgram
} from "@/src/api/schemas";

/** Readable market names; unknown legacy selections keep their original code. */
export function formatSelection(code: string): string {
  const names: Record<string, string> = { Ms1: "Ev sahibi kazanır", MsX: "Beraberlik", Ms2: "Deplasman kazanır",
    Ms1X: "Ev sahibi / beraberlik", MsX2: "Beraberlik / deplasman", Ms12: "Ev sahibi / deplasman",
    Kgvar: "Karşılıklı gol var", Kgyok: "Karşılıklı gol yok" };
  const goals = /^Ms([0-4])5([au])$/.exec(code);
  return names[code] ?? (goals ? `Toplam gol ${goals[1]},5 ${goals[2] === "a" ? "altı" : "üstü"}` : code);
}

export function formatRate(value: number | null): string {
  return value === null
    ? "—"
    : new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
}

export function formatCurrentMarketRate(
  value: number | null,
  selectedOdd: string,
  availableLabel: "canlı oran" | "güncel oran"
): { value: string; label: string } {
  if (value !== null) {
    return {
      value: formatRate(value),
      label: availableLabel
    };
  }
  return {
    value: "—",
    label: selectedOdd ? "oran yok" : "oran bekleniyor"
  };
}

export function formatSigned(value: number, digits = 2): string {
  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(Math.abs(value));
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted;
}

export function formatAbsolute(value: number, digits = 2): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(Math.abs(value));
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "percent",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatElapsed(status: MatchStatus, elapsed: number, clock?: {label:string|null;period:string}): string {
  if (status === "LIVE") {
    if (clock?.period === "PENALTIES") return "PENALTILAR";
    if (!clock) return `${elapsed}'`;
    const parts = /^(\d{1,3})(?:\+(\d{1,2})?)?$/.exec(clock.label?.trim().replace(/\s*\+\s*/g,"+") ?? "");
    return parts ? `${Number(parts[1]) + Number(parts[2] || 0)}'` : "—";
  }
  if (status === "HALF_TIME") {
    return "DEVRE";
  }
  if (status === "FINISHED") {
    return "MS";
  }
  // Without its own wording a not-played match would read "BAŞLAMADI", which
  // says the game is still ahead of the user when SAP has already decided it
  // will not be played.
  if (status === "NOT_PLAYED") {
    return "OYNANMADI";
  }
  return "BAŞLAMADI";
}

export function formatFixtureDateTime(
  matchDate: string,
  matchTime: string
): string {
  if (!matchDate && !matchTime) {
    return "Tarih ve saat bekleniyor";
  }
  if (!matchDate) {
    return `Saat ${matchTime}`;
  }
  const parsed = new Date(`${matchDate}T${matchTime}:00+03:00`);
  if (!Number.isFinite(parsed.getTime())) {
    return matchTime || `${matchDate} · saat bekleniyor`;
  }
  const date = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/Istanbul"
  }).format(parsed);
  return `${date} · ${matchTime}`;
}

/**
 * Today's date as a screen kicker: "28 TEMMUZ · SALI", Istanbul calendar.
 * Upper-cased here with the Turkish locale rather than by `textTransform`, so
 * PAZARTESİ keeps its dotted capital on a device set to another language.
 */
export function formatTodayEyebrow(now: Date = new Date()): string {
  const timeZone = "Europe/Istanbul";
  const day = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", timeZone }).format(now);
  const weekday = new Intl.DateTimeFormat("tr-TR", { weekday: "long", timeZone }).format(now);
  return `${day} · ${weekday}`.toLocaleUpperCase("tr-TR");
}

export function formatTimestamp(value: string): string {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    return "Güncelleme zamanı bilinmiyor";
  }
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Istanbul"
  })
    .format(parsed)
    .replace(",", " ·");
}

/**
 * An amount in the unit its source carried. A missing unit falls back to TRY
 * only because every BFF that predates the carried currency served TRY.
 */
export function formatCurrencyAmount(value: number, currencyCode: string | null): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currencyCode ?? "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function matchDateFromKey(matchKey: string): string {
  return /^(\d{4}-\d{2}-\d{2}):/.exec(matchKey)?.[1] ?? "";
}

export function formatMatchKeyDateTime(matchKey: string): string {
  const match =
    /^(\d{4}-\d{2}-\d{2}):\d+:(\d{2}):(\d{2})/.exec(matchKey);
  if (!match) {
    return "";
  }
  const date = match[1]!;
  const time = `${match[2]!}:${match[3]!}`;
  if (time === "00:00") {
    const dateOnly = formatFixtureDateTime(date, "12:00").split(" · ")[0];
    return `${dateOnly} · saat bilgisi yok`;
  }
  return formatFixtureDateTime(date, time);
}

export function formatProgramStatus(status: TotoProgram["status"]): string {
  const labels: Record<TotoProgram["status"], string> = {
    ACTIVE: "Aktif",
    WAITING_RESULT: "Sonuç Bekliyor",
    RESULTED: "Sonuçlandı",
    ERROR: "Hata"
  };
  return labels[status];
}
