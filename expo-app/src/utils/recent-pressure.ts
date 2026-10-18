import type { z } from "zod";
import type { decisionContextSchema } from "../api/schemas";

/** A rejected record is not evidence that the producer never measured pressure. */
export function unavailablePressureMessage(reason: string | null | undefined) {
  if (["CAPTURE_REGIME_MISMATCH", "CAPTURE_MODEL_REGIME_MISMATCH", "CAPTURE_PARAMETER_REGIME_MISMATCH"].includes(reason ?? ""))
    return { label: "Baskı gösterilemiyor · sürüm uyuşmazlığı", detail: "Baskı kaydının sürümü ile uygulamanın kabul ettiği sürüm uyuşmuyor. Değer gösterilemiyor; bu durum baskının hesaplanmadığı anlamına gelmez." };
  if (reason === "PRODUCER_NOT_ACCEPTED")
    return { label: "Baskı kaydı doğrulanamadı", detail: "Bu kayıt için kabul edilmiş baskı verisi alınamadı. Bu durum baskının hesaplanmadığı anlamına gelmez." };
  if (reason === "STATE_EPOCH_CHANGED")
    return { label: "Baskı için yeni aralık bekleniyor", detail: "Skor, kart veya devre değişti. Baskı için aynı maç durumunda yeni bir karşılaştırma aralığı gerekiyor." };
  if (reason === "OBS_ACTIVITY_UNPROVEN")
    return { label: "Aralık hareketliliği doğrulanamadı", detail: "Kaynak sayaçlarında ilerleme doğrulanamadığı için bu aralığın baskısı gösterilemiyor. Eksik veri sıfır baskı sayılmaz." };
  if (["COUNTER_COVERAGE_MISSING", "COUNTER_DECREASE"].includes(reason ?? ""))
    return { label: "Baskı sayaçları doğrulanamadı", detail: "Şut veya korner sayaçları eksik ya da tutarsız; bu aralığın baskısı gösterilemiyor." };
  if (["CAPTURE_ENDPOINT_STALE", "INTERVAL_INVALID", "CAPTURE_BASELINE_INVALID"].includes(reason ?? ""))
    return { label: "Baskı aralığı doğrulanamadı", detail: "Baskı kaydının zaman aralığı veya güncelliği doğrulanamadı; eski değer kullanılmıyor." };
  return { label: "Baskı verisi doğrulanamadı", detail: "Bu kaydın yakın aralık baskısı doğrulanamadı. Eksik veri sıfır baskı sayılmaz." };
}

export function currentIntervalPressure(
  context: z.infer<typeof decisionContextSchema> | undefined,
  now = Date.now()
) {
  const pressure = context?.recentPressure;
  const age = pressure?.observedAt ? now - Date.parse(pressure.observedAt) : NaN;
  if (!pressure || pressure.availability !== "AVAILABLE" || !Number.isFinite(age) || age < 0 || age > 240_000)
    return { total: null, difference: null, measured: false };
  return { total: pressure.total, difference: pressure.difference, measured: true };
}

export function capturedIntervalPressure(
  context: z.infer<typeof decisionContextSchema> | undefined,
  capturedAt: string | null
) {
  return currentIntervalPressure(context, capturedAt ? Date.parse(capturedAt) : NaN);
}
