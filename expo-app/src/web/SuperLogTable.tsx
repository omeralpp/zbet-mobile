import { useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { SuperLog } from "@/src/api/schemas";
import { RatingStars } from "@/src/components/RatingStars";
import { colors, iconSizes, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import {
  formatDecisionReason,
  formatMatchKeyDateTime,
  formatRate,
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
  { id: "rate", label: "Oran", flex: 0.7, align: "right" },
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
  const router = useRouter();
  const [sort, setSort] = useState<SuperSort>(defaultSuperSort);
  const rows = useMemo(() => sortSuperLogs(logs, sort), [logs, sort]);

  return (
    <View role="table" aria-label="Super karar günlüğü" style={styles.table}>
      <View role="row" style={[styles.row, styles.headerRow]}>
        {columns.map((column) => {
          const active = sort.column === column.id;
          return (
            <Pressable
              aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              accessibilityLabel={`${column.label} sütununa göre sırala`}
              key={column.id}
              onPress={() => setSort((current) => nextSuperSort(current, column.id))}
              role="columnheader"
              style={({ hovered }) => [
                styles.cell,
                { flex: column.flex },
                column.align === "right" && styles.right,
                column.align === "center" && styles.center,
                hovered && styles.headerHover
              ]}
            >
              <Text style={[styles.headerText, active && styles.headerActive]}>{column.label}</Text>
              {active ? (
                <MaterialCommunityIcons
                  color={semantic.intelligence}
                  name={sort.direction === "asc" ? "arrow-up" : "arrow-down"}
                  size={iconSizes.micro}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <ScrollView showsVerticalScrollIndicator style={styles.body}>
        {rows.map((log, index) => {
          const color = resultColor(log.result);
          return (
            <Pressable
              accessibilityHint="Super kararının detayını açar"
              accessibilityLabel={`${log.matchName}, ${log.rating} yıldız, ${formatSuperResult(log.result)}`}
              key={log.key}
              onPress={() => router.push({ pathname: "/super/[key]", params: { key: log.key } } as never)}
              role="row"
              style={({ hovered, pressed }) => [
                styles.row,
                index % 2 === 1 && styles.zebra,
                hovered && styles.rowHover,
                pressed && styles.pressed
              ]}
            >
              <View style={[styles.cell, { flex: 1.1 }]}>
                <Text style={styles.text}>{formatTimestamp(log.createdAt)}</Text>
              </View>
              <View style={[styles.cell, styles.stack, { flex: 2.6 }]}>
                <Text numberOfLines={1} style={styles.match}>{log.matchName}</Text>
                <Text numberOfLines={1} style={styles.meta}>{formatMatchKeyDateTime(log.matchKey)}</Text>
              </View>
              <View style={[styles.cell, styles.right, { flex: 0.5 }]}>
                <Text style={styles.text}>{log.elapsed}&apos;</Text>
              </View>
              <View style={[styles.cell, { flex: 1 }]}>
                <Text numberOfLines={1} style={styles.market}>{log.selectedOdd}</Text>
              </View>
              <View style={[styles.cell, { flex: 0.9 }]}>
                <RatingStars rating={log.rating} size={12} />
              </View>
              <View style={[styles.cell, styles.right, { flex: 0.7 }]}>
                <Text style={styles.number}>{formatRate(log.liveRate)}</Text>
              </View>
              <View style={[styles.cell, { flex: 1.6 }]}>
                <Text numberOfLines={1} style={styles.meta}>{formatDecisionReason(log.reason)}</Text>
              </View>
              <View style={[styles.cell, styles.center, { flex: 0.9 }]}>
                <View style={[styles.pill, { backgroundColor: `${color}1F` }]}>
                  <Text style={[styles.pillText, { color }]}>{formatSuperResult(log.result)}</Text>
                </View>
              </View>
              <View style={[styles.cell, styles.right, { flex: 0.7 }]}>
                <Text style={[styles.number, { color }]}>
                  {log.profit === null ? "—" : formatSigned(log.profit)}
                </Text>
              </View>
            </Pressable>
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
    minHeight: 40
  },
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
