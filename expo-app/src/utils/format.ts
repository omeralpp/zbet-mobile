import type {
  MatchStatus,
  SuperLog,
  TotoProgram
} from "@/src/api/schemas";

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
    label: selectedOdd ? "market kapalı" : "oran bekleniyor"
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

const decisionReasonLabels: Record<string, string> = {
  SCORE_CHANGED: "Skor değişti",
  SCORE_DECREASED: "Skor düzeltildi",
  ODDS_CHANGED: "Oran değişti",
  STATUS_CHANGED: "Maç durumu değişti",
  MANUAL_RECHECK: "Yeniden değerlendirildi",
  HOME: "Ev sahibi yönü",
  AWAY: "Deplasman yönü",
  DRAW: "Beraberlik yönü",
  GOAL: "Gol marketi",
  NOGO: "Gol olmama marketi"
};

export function formatDecisionReason(value: string): string {
  const parts = value
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) {
    return "Model değerlendirmesi";
  }
  return parts
    .map((part) => decisionReasonLabels[part.toUpperCase()] ?? part)
    .join(" · ");
}

export function formatElapsed(status: MatchStatus, elapsed: number): string {
  if (status === "LIVE") {
    return `${elapsed}'`;
  }
  if (status === "HALF_TIME") {
    return "DEVRE";
  }
  if (status === "FINISHED") {
    return "MS";
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

export function formatTryCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
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

export function formatSuperDateScope(values: string[]): string {
  const dates = values
    .map((value) => new Date(value))
    .filter((value) => Number.isFinite(value.getTime()))
    .sort((left, right) => left.getTime() - right.getTime());
  if (!dates.length) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/Istanbul"
  });
  const first = formatter.format(dates[0]);
  const last = formatter.format(dates[dates.length - 1]);
  const range = first === last ? first : `${first} – ${last}`;
  return `${range} · en yeni ${dates.length} karar`;
}

export function formatSuperResult(result: SuperLog["result"]): string {
  const labels: Record<SuperLog["result"], string> = {
    OPEN: "Açık",
    WON: "Kazandı",
    LOST: "Kaybetti",
    VOID: "Geçersiz"
  };
  return labels[result];
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
