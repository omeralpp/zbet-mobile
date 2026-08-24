import type { StarDecisionFilter } from "@/src/utils/decision-filters";
import { starMetricLabel } from "@/src/utils/decision-filters";
import { formatSigned } from "@/src/utils/format";

export type JinxMoodKind =
  | "POSITIVE"
  | "NEGATIVE"
  | "EVEN"
  | "EMPTY"
  | "UNKNOWN";

export interface JinxDailyMood {
  kind: JinxMoodKind;
  metricDate: string | null;
  filter: StarDecisionFilter;
  won: number;
  lost: number;
  profit: number;
}

export interface JinxMoodQuip {
  title: string;
  body: string;
  index: number;
}

type SuperBucket = { won: number; lost: number; profit: number };

export function deriveJinxDailyMood({
  ready,
  metricDate,
  filter,
  bucket
}: {
  ready: boolean;
  metricDate?: string | null | undefined;
  filter: StarDecisionFilter;
  bucket?: SuperBucket | null | undefined;
}): JinxDailyMood {
  if (!ready || !metricDate || !bucket || !Number.isFinite(bucket.profit)) {
    return {
      kind: "UNKNOWN",
      metricDate: null,
      filter,
      won: 0,
      lost: 0,
      profit: 0
    };
  }
  const settled = bucket.won + bucket.lost;
  const kind: JinxMoodKind =
    settled === 0
      ? "EMPTY"
      : bucket.profit > 0
        ? "POSITIVE"
        : bucket.profit < 0
          ? "NEGATIVE"
          : "EVEN";
  return { kind, metricDate, filter, ...bucket };
}

export function jinxMoodSignature(mood: JinxDailyMood): string | null {
  return mood.kind === "UNKNOWN" || !mood.metricDate
    ? null
    : `${mood.metricDate}:${mood.filter}:${mood.kind}`;
}

const quips: Record<Exclude<JinxMoodKind, "UNKNOWN">, readonly ((mood: JinxDailyMood) => string)[]> = {
  POSITIVE: [
    (mood) =>
      `Kravatı taktım: ${formatSigned(mood.profit)}. ${mood.won} galibiyet iş yaptı.`,
    (mood) =>
      `Cüzdan bugün pres yapıyor: ${formatSigned(mood.profit)} · ${mood.won} kazandı.`,
    (mood) =>
      `Altın topu buldum: ${formatSigned(mood.profit)}. Sakın normal davrandığımı söyleme.`
  ],
  NEGATIVE: [
    (mood) =>
      `Cebimde yankı var: ${formatSigned(mood.profit)}. Bugün top benden zengin.`,
    (mood) =>
      `Son bozukluk da ofsayta düştü: ${formatSigned(mood.profit)} · ${mood.lost} kayıp.`,
    (mood) =>
      `Kâğıt tacım biraz eğildi: ${formatSigned(mood.profit)}. Ben hâlâ buradayım.`
  ],
  EVEN: [
    () => "Cüzdanla ateşkes: 0,00. İkimiz de birbirimize bakıyoruz.",
    (mood) =>
      `Skor cüzdanda berabere: 0,00 · ${mood.won} kazandı, ${mood.lost} kaybetti.`
  ],
  EMPTY: [
    () => "Hesap kapanmadı; ben çayı koydum.",
    () => "Henüz sonuçlanan Super yok. Cüzdan ısınma hareketinde."
  ]
};

const titles: Record<Exclude<JinxMoodKind, "UNKNOWN">, string> = {
  POSITIVE: "JINX ZENGİN MODDA",
  NEGATIVE: "JINX'İN CEBİ HAFİF",
  EVEN: "CÜZDANLA ATEŞKES",
  EMPTY: "HESAP BEKLİYOR"
};

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function selectJinxMoodQuip(
  mood: JinxDailyMood,
  previousIndex: number | null = null
): JinxMoodQuip | null {
  const signature = jinxMoodSignature(mood);
  if (!signature || mood.kind === "UNKNOWN") {
    return null;
  }
  const pool = quips[mood.kind];
  let index = stableHash(
    `${signature}:${mood.won}:${mood.lost}:${mood.profit}`
  ) % pool.length;
  if (pool.length > 1 && index === previousIndex) {
    index = (index + 1) % pool.length;
  }
  return {
    title: `${titles[mood.kind]} · ${starMetricLabel(mood.filter)}`,
    body: pool[index]!(mood),
    index
  };
}
