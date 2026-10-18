import { useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { SuperLog } from "@/src/api/schemas";
import { RatingStars } from "@/src/components/RatingStars";
import { colors, iconSizes, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import {
  formatDecisionReason,
  formatMatchKeyDateTime,
  formatRate,
  formatSelection,
  formatSigned,
  formatSuperResult,
  formatTimestamp
} from "@/src/utils/format";
import {
  defaultSuperSort,
  nextSuperSort,
  sortSuperLogs,
  type SuperColumn,
  type SuperSort
} from "./super-table";

type Column = { id: SuperColumn; label: string; flex: number; align?: "right" | "center" };

const columns: readonly Column[] = [
  { id: "createdAt", label: "Karar", flex: 1.1 },
  { id: "match", label: "Maç", flex: 2.6 },
  { id: "elapsed", label: "Dk", flex: 0.5, align: "right" },
  { id: "market", label: "Market", flex: 1 },
  { id: "rating", label: "Yıldız", flex: 0.9 },
  { id: "rate", label: "Seçim oranı", flex: 0.9, align: "right" },
  { id: "reason", label: "Gerekçe", flex: 1.6 },
  { id: "result", label: "Sonuç", flex: 0.9, align: "center" },
  { id: "profit", label: "Kâr", flex: 0.7, align: "right" }
];

function resultColor(result: SuperLog["result"]): string {
  if (result === "WON") return colors.green;
  if (result === "LOST") return colors.red;
  if (result === "VOID") return colors.textSubtle;
  return colors.blue;
}

/**
 * Desktop Super decision log (platform exception: wide web layout of the same
 * rows the phone shows as cards). Sortable by every column; a row opens the
 * same decision detail as a card does.
 */
export function SuperLogTable({ logs }: { logs: readonly SuperLog[] }) {
  const [sort, setSort] = useState<SuperSort>(defaultSuperSort);
  const rows = useMemo(() => sortSuperLogs(logs, sort), [logs, sort]);

  return (
    <View role="table" aria-label="Super karar günlüğü" style={styles.table}>
      <View role="row" style={[styles.row, styles.headerRow]}>
        {columns.map((column) => {
          const active = sort.column === column.id;
          return (
            <View
              aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              key={column.id}
              role="columnheader"
              style={[
                styles.cell,
                { flex: column.flex },
                column.align === "right" && styles.right,
                column.align === "center" && styles.center
              ]}
            >
              <Pressable accessibilityRole="button" accessibilityLabel={`${column.label} sütununa göre sırala`}
                onPress={() => setSort((current) => nextSuperSort(current, column.id))}
                style={({ hovered }) => [styles.headerAction, column.align === "right" && styles.right, column.align === "center" && styles.center, hovered && styles.headerHover]}>
              <Text style={[styles.headerText, active && styles.headerActive]}>{column.label}</Text>
              {active ? (
                <MaterialCommunityIcons
                  color={semantic.intelligence}
                  name={sort.direction === "asc" ? "arrow-up" : "arrow-down"}
                  size={iconSizes.micro}
                />
              ) : null}
              </Pressable>
            </View>
          );
        })}
      </View>
      <ScrollView showsVerticalScrollIndicator style={styles.body}>
        {rows.map((log, index) => {
          const color = resultColor(log.result);
          return (
            <View
              key={log.key}
              role="row"
              style={[
                styles.row,
                index % 2 === 1 && styles.zebra
              ]}
            >
              <View role="cell" style={[styles.cell, { flex: 1.1 }]}>
                <Text style={styles.text}>{formatTimestamp(log.createdAt)}</Text>
              </View>
              <View role="cell" style={[styles.cell, { flex: 2.6 }]}>
                <Link href={{ pathname: "/super/[key]", params: { key: log.key } }} asChild>
                  <Pressable accessibilityRole="link" accessibilityLabel={`${log.matchName}, ${log.rating} yıldız, ${formatSuperResult(log.result)}; karar detayını aç`}
                    style={({ hovered }) => [styles.matchAction, hovered && styles.rowHover]}>
                    <Text numberOfLines={1} style={styles.match}>{log.matchName}</Text>
                    <Text numberOfLines={1} style={styles.meta}>{formatMatchKeyDateTime(log.matchKey)}</Text>
                  </Pressable>
                </Link>
              </View>
              <View role="cell" style={[styles.cell, styles.right, { flex: 0.5 }]}>
                <Text style={styles.text}>{log.elapsed}&apos;</Text>
              </View>
              <View role="cell" style={[styles.cell, { flex: 1 }]}>
                <Text numberOfLines={2} style={styles.market}>{formatSelection(log.selectedOdd)}</Text>
              </View>
              <View role="cell" style={[styles.cell, { flex: 0.9 }]}>
                <RatingStars rating={log.rating} size={12} />
              </View>
              <View role="cell" style={[styles.cell, styles.right, { flex: 0.9 }]}>
                <Text style={styles.number}>{formatRate(log.liveRate)}</Text>
              </View>
              <View role="cell" style={[styles.cell, { flex: 1.6 }]}>
                <Text numberOfLines={1} style={styles.meta}>{formatDecisionReason(log.reason)}</Text>
              </View>
              <View role="cell" style={[styles.cell, styles.center, { flex: 0.9 }]}>
                <View style={[styles.pill, { backgroundColor: `${color}1F` }]}>
                  <Text style={[styles.pillText, { color }]}>{formatSuperResult(log.result)}</Text>
                </View>
              </View>
              <View role="cell" style={[styles.cell, styles.right, { flex: 0.7 }]}>
                <Text style={[styles.number, { color }]}>
                  {log.profit === null ? "—" : formatSigned(log.profit)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    marginBottom: spacing.lg,
    overflow: "hidden"
  },
  body: {
    flex: 1
  },
  row: {
    alignItems: "center",
    borderBottomColor: colors.borderSoft,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: spacing.md
  },
  headerRow: {
    backgroundColor: colors.background,
    minHeight: 48
  },
  headerAction: { flex: 1, minHeight: 48, flexDirection: "row", alignItems: "center", gap: 4 },
  matchAction: { width: "100%", minHeight: 48, justifyContent: "center", borderRadius: radii.sm },
  zebra: {
    backgroundColor: `${colors.surface}40`
  },
  rowHover: {
    backgroundColor: colors.surface
  },
  pressed: {
    opacity: 0.8
  },
  cell: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    minWidth: 0,
    paddingHorizontal: spacing.xs
  },
  stack: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 0
  },
  right: {
    justifyContent: "flex-end"
  },
  center: {
    justifyContent: "center"
  },
  headerHover: {
    backgroundColor: colors.borderSoft
  },
  headerText: {
    ...typeScale.micro,
    color: colors.textSubtle,
    textTransform: "uppercase"
  },
  headerActive: {
    color: colors.text
  },
  text: {
    ...typeScale.meta,
    color: colors.textMuted
  },
  match: {
    ...typeScale.identityCompact,
    color: colors.text
  },
  meta: {
    ...typeScale.meta,
    color: colors.textSubtle
  },
  market: {
    ...typeScale.bodyCompact,
    color: colors.text,
    fontWeight: "700"
  },
  number: {
    ...typeScale.metricCompact,
    color: colors.text
  },
  pill: {
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  pillText: {
    ...typeScale.micro
  }
});
