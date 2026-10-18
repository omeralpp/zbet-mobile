import type { SystemStateKind } from "./system-state";

export type UiErrorCategory = "NETWORK" | "SESSION" | "FORBIDDEN" | "NOT_FOUND" | "SERVICE" | "UNKNOWN";
type ErrorPresentation = { kind: SystemStateKind; title: string; message: string; retryable: boolean };
const presentations: Record<UiErrorCategory, ErrorPresentation> = {
  NETWORK: { kind: "OFFLINE", title: "Bağlantı kurulamadı", message: "Bağlantını kontrol edip yeniden deneyebilirsin.", retryable: true },
  SESSION: { kind: "REFRESH_FAILED", title: "Oturum gerekli", message: "Devam etmek için oturumunu yeniden aç.", retryable: false },
  FORBIDDEN: { kind: "UNAVAILABLE", title: "Erişim izni yok", message: "Bu kayıt mevcut oturumunla gösterilemiyor.", retryable: false },
  NOT_FOUND: { kind: "UNAVAILABLE", title: "Kayıt bulunamadı", message: "Listeye dönüp başka bir kayıt açabilirsin.", retryable: false },
  SERVICE: { kind: "REFRESH_FAILED", title: "Veri şu anda alınamıyor", message: "Bir süre sonra yeniden deneyebilirsin.", retryable: true },
  UNKNOWN: { kind: "REFRESH_FAILED", title: "Veri alınamadı", message: "Veriler şu anda gösterilemiyor. Yeniden deneyebilirsin.", retryable: true }
};

/** Only structured evidence identifies a cause; arbitrary server text is not UI copy. */
export function classifyUiError(error: unknown): UiErrorCategory {
  if (!error || typeof error !== "object") return "UNKNOWN";
  const candidate = error as { status?: unknown; code?: unknown; offline?: unknown };
  const code = typeof candidate.code === "string" ? candidate.code.toUpperCase() : "";
  if (candidate.status === 401 || ["UNAUTHENTICATED", "EDGE_SESSION_EXPIRED"].includes(code)) return "SESSION";
  if (candidate.status === 403) return "FORBIDDEN";
  if (candidate.status === 404) return "NOT_FOUND";
  if (candidate.offline === true || ["OFFLINE", "NETWORK_ERROR", "NETWORK_UNAVAILABLE"].includes(code)) return "NETWORK";
  if (candidate.status === 408 || candidate.status === 429 || code === "REQUEST_TIMEOUT" ||
      (typeof candidate.status === "number" && candidate.status >= 500 && candidate.status <= 599)) return "SERVICE";
  return "UNKNOWN";
}
export function describeUiError(error: unknown, category?: UiErrorCategory): ErrorPresentation {
  return presentations[category ?? classifyUiError(error)];
}
