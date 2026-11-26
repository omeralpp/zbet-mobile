import { useState, type ReactNode } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, iconSizes, interaction, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { formatRatio } from "@/src/utils/rebuild-display";
import { breakdownView, MIN_RESULTS, type BreakdownGroup, type BreakdownSort } from "@/src/utils/report-breakdown";
import { SegmentedControl } from "./FilterControls";
import { SurfaceMaterial } from "./SurfaceMaterial";

/**
 * Rapor ayrıntısı, shared by the three Karar günlüğü views (owner
 * 2026-11-25): aligned columns (group, results, hit rate, value) and a
 * zero-centred impact bar, sorted by impact by default; groups with fewer
 * than three results fold into one "Az örnek" row. The summary tiles above
 * the list already show the totals, so nothing here repeats them.
 */

export type ValueFormat = { label: string; format: (value: number) => string; signed: boolean };

export const unitsValue: ValueFormat = {
  label: "Net",
  signed: true,
  format: (value) => {
    const text = Math.abs(value).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value > 0 ? `+${text}` : value < 0 ? `-${text}` : text;
  }
};

export const lostCouponsValue: ValueFormat = { label: "Kaybettirdi", signed: false, format: (value) => `${value} kupon` };

function Bar({ impact, scale }: { impact: number; scale: number }) {
  const share = Math.min(1, Math.abs(impact) / scale) * 50;
  const color = impact >= 0 ? semantic.positive : semantic.negative;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.bar}>
      <View style={styles.barMid} />
      {impact !== 0 ? <View style={[styles.barFill, impact > 0 ? { left: "50%" } : { right: "50%" }, { width: `${share}%`, backgroundColor: color }]} /> : null}
    </View>
  );
}

function valueColor(group: BreakdownGroup, value: ValueFormat) {
  if (group.value === null) return colors.textMuted;
  if (!value.signed) return group.value > 0 ? semantic.negative : colors.text;
  return group.value > 0 ? semantic.positive : group.value < 0 ? semantic.negative : colors.text;
}

function Row({ group, scale, value, wide, label }: { group: BreakdownGroup; scale: number; value: ValueFormat; wide: boolean; label?: ReactNode }) {
  const valueText = group.value === null ? "—" : value.format(group.value);
  const meta = [`${group.results} sonuç`, group.open ? `${group.open} açık` : null].filter(Boolean).join(" · ");
  const a11y = `${group.label}: ${meta}, isabet ${formatRatio(group.hitRate)}, ${value.label.toLowerCase()} ${valueText}`;
  if (wide) {
    return (
      <View accessible accessibilityLabel={a11y} style={styles.row}>
        <View style={styles.cellLabel}>{label ?? <Text numberOfLines={1} style={styles.label}>{group.label}</Text>}</View>
        <Text style={[styles.cellNum, styles.num]}>{group.results}{group.open ? <Text style={styles.open}> +{group.open}</Text> : null}</Text>
        <Text style={[styles.cellNum, styles.num]}>{formatRatio(group.hitRate)}</Text>
        <Text style={[styles.cellValue, styles.value, { color: valueColor(group, value) }]}>{valueText}</Text>
        <View style={styles.cellBar}><Bar impact={group.impact} scale={scale} /></View>
      </View>
    );
  }
  return (
    <View accessible accessibilityLabel={a11y} style={styles.rowCompact}>
      <View style={styles.compactTop}>
        <View style={styles.cellLabel}>{label ?? <Text numberOfLines={1} style={styles.label}>{group.label}</Text>}</View>
        <Text style={[styles.value, { color: valueColor(group, value) }]}>{valueText}</Text>
      </View>
      <View style={styles.compactBottom}>
        <Text style={styles.meta}>{meta} · isabet {formatRatio(group.hitRate)}</Text>
        <View style={styles.compactBar}><Bar impact={group.impact} scale={scale} /></View>
      </View>
    </View>
  );
}

export function ReportTable({ title, groups, value, wide, sort, keepOrder = false, labelFor }: {
  title: string; groups: readonly BreakdownGroup[]; value: ValueFormat; wide: boolean; sort: BreakdownSort; keepOrder?: boolean;
  /** Optional rich label (stars) for a group key. */
  labelFor?: (group: BreakdownGroup) => ReactNode;
}) {
  const [showFew, setShowFew] = useState(false);
  const view = breakdownView(groups, sort, keepOrder);
  if (!view.rows.length && !view.few.groups.length) return null;
  const fewText = `Az örnek (<${MIN_RESULTS} sonuç) · ${view.few.groups.length} grup · ${view.few.results} sonuç`
    + (view.few.value !== null && value.signed ? ` · toplam ${value.format(view.few.value)}` : "");
  return (
    <View style={styles.table}>
      <Text accessibilityRole="header" aria-level={3} style={styles.eyebrow}>{title}</Text>
      {view.allFew ? <Text style={styles.caution}>{view.rows.some((row) => row.results > 0)
        ? `Her grupta ${MIN_RESULTS}'ten az sonuç var; oranlar henüz yön göstermez.` : "Henüz sonuçlanan yok; açık kayıtlar sonuçlandıkça dolar."}</Text> : null}
      {wide ? (
        <View style={[styles.row, styles.headRow]}>
          <Text style={[styles.cellLabel, styles.head, styles.headLabel]}>Grup</Text>
          <Text style={[styles.cellNum, styles.head]}>Sonuç</Text>
          <Text style={[styles.cellNum, styles.head]}>İsabet</Text>
          <Text style={[styles.cellValue, styles.head]}>{value.label}</Text>
          <Text style={[styles.cellBar, styles.head, styles.headBar]}>Etki</Text>
        </View>
      ) : null}
      {view.rows.map((group) => <Row group={group} key={group.key} label={labelFor?.(group)} scale={view.scale} value={value} wide={wide} />)}
      {view.few.groups.length ? (
        <>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showFew }} aria-expanded={showFew}
            onPress={() => setShowFew(!showFew)} style={({ pressed, hovered }) => [styles.fewToggle, hovered && styles.hover, pressed && styles.pressed]}>
            <Text style={styles.fewText}>{fewText}</Text>
            <MaterialCommunityIcons accessible={false} color={semantic.intelligence} name={showFew ? "chevron-up" : "chevron-down"} size={iconSizes.inline} />
          </Pressable>
          {showFew ? view.few.groups.map((group) => <Row group={group} key={group.key} label={labelFor?.(group)} scale={view.scale} value={value} wide={wide} />) : null}
        </>
      ) : null}
    </View>
  );
}

/** The collapsible card every Karar günlüğü view shares. */
export function ReportDetailsCard({ caption, scope, wide, children, notes }: {
  caption: string; scope: string; wide: boolean; notes?: ReactNode;
  children: (sort: BreakdownSort) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<BreakdownSort>("IMPACT");
  return (
    <View style={styles.card}>
      <SurfaceMaterial radius={radii.lg} />
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} aria-expanded={open} onPress={() => setOpen(!open)}
        style={({ pressed, hovered }) => [styles.toggle, hovered && styles.hover, pressed && styles.pressed]}>
        <View style={styles.flexCopy}>
          <Text style={styles.title}>Rapor ayrıntısı</Text>
          <Text style={styles.caption}>{caption}</Text>
        </View>
        <MaterialCommunityIcons color={semantic.intelligence} name={open ? "chevron-up" : "chevron-down"} size={iconSizes.control} />
      </Pressable>
      {open ? (
        <View style={styles.body}>
          <View style={styles.bodyHead}>
            <Text style={styles.eyebrow}>{scope}</Text>
            <SegmentedControl label="Sıralama" onChange={setSort} options={[{ id: "IMPACT", label: "Net etki" }, { id: "COUNT", label: "Sonuç sayısı" }]} value={sort} />
          </View>
          <View style={[styles.columns, wide && styles.columnsWide]}>{children(sort)}</View>
          {notes ? <View style={styles.notes}>{notes}</View> : null}
        </View>
      ) : null}
    </View>
  );
}

/** Left (narrow) and right (wide) column wrappers for the two tables. */
export function ReportColumn({ children, main = false, wide }: { children: ReactNode; main?: boolean; wide: boolean }) {
  return <View style={wide ? (main ? styles.columnMain : styles.columnSide) : styles.columnStack}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, padding: spacing.lg, gap: spacing.md, overflow: "hidden" },
  toggle: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: interaction.minTouchTarget, borderRadius: radii.md,
    marginHorizontal: -spacing.sm, paddingHorizontal: spacing.sm },
  flexCopy: { flex: 1, minWidth: 0 },
  title: { color: colors.text, ...typeScale.identity, fontWeight: "700" },
  caption: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  body: { gap: spacing.lg },
  bodyHead: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  columns: { gap: spacing.xl },
  columnsWide: { flexDirection: "row", alignItems: "flex-start" },
  columnSide: { flex: 2, minWidth: 0, gap: spacing.lg },
  columnMain: { flex: 3, minWidth: 0, gap: spacing.lg },
  columnStack: { gap: spacing.lg },
  notes: { gap: spacing.xs, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderSoft },
  table: { gap: 2 },
  eyebrow: { color: colors.textMuted, ...typeScale.eyebrow },
  caution: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 36, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSoft },
  headRow: { minHeight: 28, marginTop: spacing.xs },
  head: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0, textAlign: "right" },
  headBar: { textAlign: "center" },
  headLabel: { textAlign: "left" },
  cellLabel: { flex: 1, minWidth: 0 },
  cellNum: { width: 58, textAlign: "right" },
  cellValue: { width: 92, textAlign: "right" },
  cellBar: { width: 120, paddingLeft: spacing.sm },
  label: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "600" },
  num: { color: colors.text, ...typeScale.bodyCompact, fontVariant: ["tabular-nums"] },
  open: { color: colors.textMuted, ...typeScale.label },
  value: { ...typeScale.bodyCompact, fontWeight: "800", fontVariant: ["tabular-nums"] },
  meta: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0, flexShrink: 1 },
  rowCompact: { gap: 4, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSoft },
  compactTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  compactBottom: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  compactBar: { width: 96, marginLeft: "auto" },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceStrong, overflow: "hidden", position: "relative" },
  barMid: { position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, backgroundColor: colors.border },
  barFill: { position: "absolute", top: 0, bottom: 0, borderRadius: 4 },
  fewToggle: { flexDirection: "row", alignItems: "center", gap: spacing.xs, minHeight: interaction.minTouchTarget, borderRadius: radii.sm },
  fewText: { color: semantic.intelligence, ...typeScale.label, letterSpacing: 0, flexShrink: 1 },
  hover: { backgroundColor: colors.surfaceStrong },
  pressed: { opacity: 0.72 }
});
