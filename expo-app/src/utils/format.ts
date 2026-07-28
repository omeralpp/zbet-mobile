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

export function formatSigned(value: number, digits = 2): string {
  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(Math.abs(value));
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted;
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "percent",
    maximumFractionDigits: 0
  }).format(value);
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
