import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { typeScale } from "@/src/theme/typography";
import {
  exactFractionWidth,
  formatFractionPercent,
  formatMetricDate,
  formatSampleDenominator
} from "./statistical-display";

export interface StatisticalReadoutProps {
  /** Explicit proposal appearance; independent of the active application's theme. */
  dark?: boolean;
}

interface ProposalPalette {
  surface: string;
  inset: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentSoft: string;
  notice: string;
}

// Local proposal colors: this lab does not alter the application's palette.
const proposalPalettes: Record<"dark" | "light", ProposalPalette> = {
  dark: {
    surface: "#15232A", inset: "#0D191F", text: "#F1F6F7", muted: "#B6C7CD",
    border: "#40555F", accent: "#7CE3CC", accentSoft: "#203E3A", notice: "#F5D89A"
  },
  light: {
    surface: "#FFFFFF", inset: "#EDF4F4", text: "#152C35", muted: "#475F69",
    border: "#B7CACE", accent: "#086852", accentSoft: "#DDF3EC", notice: "#77521B"
  }
};

const historicalFixture = [
  { score: "0–0", count: 0, fraction: 0 },
  { score: "1–0", count: 4, fraction: 0.01 },
  { score: "2–1", count: 10, fraction: 0.025 },
  { score: "Diğer skorlar", count: 386, fraction: 0.965 }
] as const;

function ReadoutCard({ title, children, palette, gridItem = false }: {
  title: string;
  children: ReactNode;
  palette: ProposalPalette;
  gridItem?: boolean;
}) {
  return <View style={[styles.card, gridItem && styles.gridCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
    <Text accessibilityRole="header" style={[styles.title, { color: palette.text }]}>{title}</Text>
    {children}
  </View>;
}

/** Static, synthetic comparison fixtures for the shared Android/web design lab. */
export function StatisticalReadout({ dark = true }: StatisticalReadoutProps) {
  const palette = proposalPalettes[dark ? "dark" : "light"];
  const text = { color: palette.text };
  const muted = { color: palette.muted };
  return <View style={styles.root}>
    <View style={[styles.fixtureNotice, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
      <Text style={[styles.eyebrow, { color: palette.accent }]}>TAMAMI SENTETİK · TASARIM ÖNERİSİ</Text>
      <Text style={[styles.body, text]}>Sayılar nasıl okunur?</Text>
      <Text style={[styles.caption, muted]}>Bu örnekler gerçek maç, performans veya bahis önerisi değildir.</Text>
    </View>

    <View style={styles.grid}>
      <ReadoutCard title="Günlük Super · örnek kapsam" palette={palette} gridItem>
        <Text style={[styles.caption, muted]}>{formatMetricDate("2026-10-18")} · maç tarihi · 3+ yıldız</Text>
        <View style={styles.metricRow}>
          <View style={styles.metricCell}>
            <Text style={[styles.largeValue, text]}>+1,40</Text>
            <Text style={[styles.body, text]}>simüle net birim</Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={[styles.largeValue, text]}>6 / 4</Text>
            <Text style={[styles.body, text]}>kazandı / kaybetti</Text>
          </View>
        </View>
        <Text style={[styles.body, text]}>10 sonuçlanan karar kaydı</Text>
        <Text style={[styles.caption, muted]}>Birim bahisli kurgu: her kayıt 1 örnek birim. Açık ve geçersiz kayıtlar bu örneğe dahil değil.</Text>
        <Text style={[styles.caption, { color: palette.notice }]}>Canlı kârın para ve bahis tutarı tanımı bu örnekten çıkarılamaz. Kâr, isabet sayısı ve ROI ayrı ölçülerdir.</Text>
      </ReadoutCard>

      <ReadoutCard title="Kaydedilen oran ≠ güncel oran" palette={palette} gridItem>
        <Text style={[styles.caption, muted]}>Sentetik aynı seçim · toplam gol 2,5 altı</Text>
        <View style={styles.metricRow}>
          <View style={styles.metricCell}>
            <Text style={[styles.largeValue, text]}>1,90</Text>
            <Text style={[styles.body, text]}>Karar kaydı · 62′</Text>
            <Text style={[styles.caption, muted]}>18 Eki 2026 · 20:42 TRT</Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={[styles.largeValue, text]}>1,74</Text>
            <Text style={[styles.body, text]}>Güncel örnek · 68′</Text>
            <Text style={[styles.caption, muted]}>18 Eki 2026 · 20:48 TRT</Text>
          </View>
        </View>
        <Text style={[styles.caption, muted]}>Fiyat hareketi bir sonuç değildir; tek başına ekonomik avantaj göstermez.</Text>
        <View style={[styles.inset, { backgroundColor: palette.inset }]}>
          <Text style={[styles.metric, text]}>BTB rating · 4/5</Text>
          <Text style={[styles.body, text]}>Bu, %80 kazanma olasılığı değildir.</Text>
          <Text style={[styles.caption, muted]}>Rating ve model skoru, onaylı kalibre olasılıkla aynı ölçü değildir.</Text>
        </View>
      </ReadoutCard>
    </View>

    <ReadoutCard title="Tarihsel dağılım · küçük pay da küçük çizilir" palette={palette}>
      <Text style={[styles.caption, muted]}>Sentetik sabit referans: {formatSampleDenominator(400)} · {formatMetricDate("2026-09-01")} – {formatMetricDate("2026-09-30")}</Text>
      <Text style={[styles.caption, muted]}>Örnek kohort: aynı devre skoru. Paylar bu geçmiş havuza aittir; gelecek maçın tahmini değildir.</Text>
      {historicalFixture.map(row => {
        const width = exactFractionWidth(row.fraction);
        return <View key={row.score} accessible
        accessibilityLabel={`${row.score}: ${formatFractionPercent(row.fraction)}, 400 maçtan ${row.count}. Tarihsel havuz payı.`}
        style={styles.distributionRow}>
        <View style={styles.rowLabels}>
          <Text style={[styles.body, text]}>{row.score}</Text>
          <Text style={[styles.metric, text]}>{formatFractionPercent(row.fraction)} · {row.count}/400 maç</Text>
        </View>
        {width === null ? <Text style={[styles.caption, muted]}>Ölçüm yok</Text> : <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
          style={[styles.track, { backgroundColor: palette.inset }]}>
          <View style={[styles.fill, { backgroundColor: palette.accent, width }]} />
        </View>}
      </View>;
      })}
      <Text style={[styles.caption, muted]}>Sıfır çizgi üretmez. %1 ve %2,5 büyütülmez; etiketleri değeri açıkça gösterir.</Text>
      <View style={[styles.inset, { backgroundColor: palette.inset, borderColor: palette.border, borderWidth: 1 }]}>
        <Text style={[styles.body, text]}>Ayrı sentetik kaynak örneği</Text>
        <Text style={[styles.metric, text]}>{formatFractionPercent(0.325)} · {formatSampleDenominator(null)} · {formatMetricDate(null)}</Text>
        <Text style={[styles.caption, { color: palette.notice }]}>Örneklem dönemi ve büyüklüğü sağlanmadı. Bu sayıya güven aralığı veya yeterlilik rozeti eklenmedi.</Text>
      </View>
    </ReadoutCard>

    <ReadoutCard title="Toto · ana isabet ve kapsama ayrı" palette={palette}>
      <Text style={[styles.caption, muted]}>Sentetik Program 999 · sürüm 2 · {formatMetricDate("2026-10-18")}</Text>
      <View style={styles.metricRow}>
        <View style={styles.metricCell}>
          <Text style={[styles.largeValue, text]}>5 / 8</Text>
          <Text style={[styles.body, text]}>ana isabet / sonuçlanan</Text>
        </View>
        <View style={styles.metricCell}>
          <Text style={[styles.largeValue, text]}>7 / 8</Text>
          <Text style={[styles.body, text]}>kapsama isabeti / sonuçlanan</Text>
        </View>
      </View>
      <Text style={[styles.body, text]}>8/15 maç sonuçlandı · 7 sonuç bekleniyor</Text>
      <Text style={[styles.caption, muted]}>7 kapsama isabeti = 5 ana isabet + yalnız kapsamda tutan 2 sonuç. Bütün kuponun veya tek kolonun kazandığı anlamına gelmez.</Text>
      <View style={[styles.inset, { backgroundColor: palette.inset }]}>
        <Text style={[styles.metric, text]}>Kaynak alanı: Güven {formatFractionPercent(0.72)}</Text>
        <Text style={[styles.body, { color: palette.notice }]}>Anlamı ve kalibrasyonu doğrulanmadı.</Text>
        <Text style={[styles.caption, muted]}>Sentetik değer; ana seçimin, kapsamın veya kuponun kazanma olasılığı olarak yorumlanamaz. Kaynak alanının tanımı değiştirilmedi.</Text>
      </View>
    </ReadoutCard>
  </View>;
}

const styles = StyleSheet.create({
  root: { gap: 16, minWidth: 0, alignSelf: "stretch" },
  fixtureNotice: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 6, minWidth: 0 },
  eyebrow: { ...typeScale.eyebrow, flexShrink: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, minWidth: 0 },
  card: { minWidth: 0, borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  gridCard: { flexGrow: 1, flexShrink: 1, flexBasis: 280 },
  title: { ...typeScale.moduleTitle, flexShrink: 1 },
  body: { ...typeScale.body, flexShrink: 1, minWidth: 0 },
  caption: { ...typeScale.bodyCompact, flexShrink: 1, minWidth: 0 },
  metric: { ...typeScale.metricCompact, flexShrink: 1, minWidth: 0 },
  largeValue: { ...typeScale.score },
  metricRow: { flexDirection: "row", flexWrap: "wrap", gap: 16, minWidth: 0 },
  metricCell: { flexGrow: 1, flexShrink: 1, flexBasis: 130, minWidth: 0, gap: 4 },
  inset: { borderRadius: 12, padding: 12, gap: 6, minWidth: 0 },
  distributionRow: { gap: 6, minWidth: 0 },
  rowLabels: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8, minWidth: 0 },
  track: { height: 8, overflow: "hidden", minWidth: 0 },
  fill: { height: "100%" }
});
