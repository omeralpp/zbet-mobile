import { useMemo, useState, type ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { matchesQuery, rebuildReportQuery, totoProgramsQuery } from "@/src/api/queries";
import { colors, iconSizes, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { buildPaletteItems, searchPalette, type PaletteItem, type PaletteKind } from "./command-palette";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const kindIcons: Record<PaletteKind, IconName> = {
  page: "arrow-right-circle-outline",
  match: "soccer",
  super: "star-outline",
  toto: "ticket-confirmation-outline"
};

const kindLabels: Record<PaletteKind, string> = {
  page: "Sayfa",
  match: "Maç",
  super: "Super",
  toto: "Toto"
};

/**
 * Ctrl+K search over what the screens already loaded. Reads the shared query
 * cache only, so opening the palette sends no request; data a screen has not
 * fetched yet is simply not listed.
 */
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const items = useMemo(
    () =>
      buildPaletteItems({
        matches: queryClient.getQueryData(matchesQuery.queryKey) ?? [],
        recommendations: queryClient.getQueryData(rebuildReportQuery.queryKey)?.recommendations ?? [],
        totoPrograms: queryClient.getQueryData(totoProgramsQuery.queryKey) ?? []
      }),
    [queryClient]
  );
  const results = useMemo(() => searchPalette(items, query), [items, query]);
  const current = Math.min(selected, Math.max(0, results.length - 1));

  const open = (entry: PaletteItem | undefined) => {
    if (!entry) {
      return;
    }
    onClose();
    router.navigate(entry.href as never);
  };

  return (
    <View style={styles.backdrop}>
      <Pressable accessible={false} focusable={false} tabIndex={-1} onPress={onClose} style={StyleSheet.absoluteFill} />
      <View accessibilityRole="search" style={styles.panel}>
        <View style={styles.inputRow}>
          <MaterialCommunityIcons color={colors.textMuted} name="magnify" size={iconSizes.navigation} />
          <TextInput
            accessibilityLabel="Maç, Super kararı veya Toto programı ara"
            autoFocus
            onChangeText={(text) => {
              setQuery(text);
              setSelected(0);
            }}
            onKeyPress={(event) => {
              const key = event.nativeEvent.key;
              if (key === "ArrowDown") {
                event.preventDefault();
                setSelected(Math.min(current + 1, results.length - 1));
              } else if (key === "ArrowUp") {
                event.preventDefault();
                setSelected(Math.max(current - 1, 0));
              } else if (key === "Enter") {
                event.preventDefault();
                open(results[current]);
              } else if (key === "Escape") {
                onClose();
              }
            }}
            placeholder="Takım, lig, market veya program ara…"
            placeholderTextColor={colors.textSubtle}
            style={styles.input}
            value={query}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Aramayı kapat" onPress={onClose} style={styles.close}><Text style={styles.closeText}>Kapat</Text></Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.results}>
          {results.length === 0 ? (
            <Text style={styles.empty}>
              Sonuç yok. Yalnız ekranların yüklediği maçlar, Super kararları ve Toto programları aranır.
            </Text>
          ) : (
            results.map((entry, index) => (
              <Pressable
                accessibilityRole="link"
                accessibilityState={{ selected: index === current }}
                key={entry.id}
                onHoverIn={() => setSelected(index)}
                onPress={() => open(entry)}
                style={[styles.row, index === current && styles.rowSelected]}
              >
                <MaterialCommunityIcons
                  color={entry.live ? semantic.live : colors.textMuted}
                  name={kindIcons[entry.kind]}
                  size={iconSizes.control}
                />
                <View style={styles.rowCopy}>
                  <Text numberOfLines={1} style={styles.rowTitle}>
                    {entry.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.rowSubtitle}>
                    {entry.subtitle}
                  </Text>
                </View>
                <Text style={styles.kind}>{kindLabels[entry.kind]}</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
        <View style={styles.footer}>
          <Text style={styles.hint}>Yalnız ekranların yüklediği veriler aranır.</Text>
          <Text style={styles.hint}>↑ ↓ seç · Enter aç · Esc kapat</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(1, 6, 12, 0.66)",
    bottom: 0,
    left: 0,
    paddingTop: "12vh" as unknown as number,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 50
  },
  panel: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    maxWidth: 640,
    overflow: "hidden",
    width: "92%"
  },
  inputRow: {
    alignItems: "center",
    borderBottomColor: colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  input: {
    ...typeScale.identity,
    color: colors.text,
    flex: 1,
    minHeight: 48
  },
  close: { minHeight: 48, minWidth: 48, paddingHorizontal: spacing.sm, justifyContent: "center" },
  closeText: { ...typeScale.bodyCompact, color: colors.text },
  kbd: {
    ...typeScale.micro,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.textSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1
  },
  results: {
    maxHeight: 420
  },
  empty: {
    ...typeScale.bodyCompact,
    color: colors.textMuted,
    padding: spacing.xl,
    textAlign: "center"
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg
  },
  rowSelected: {
    backgroundColor: colors.surface
  },
  rowCopy: {
    flex: 1,
    minWidth: 0
  },
  rowTitle: {
    ...typeScale.identity,
    color: colors.text
  },
  rowSubtitle: {
    ...typeScale.meta,
    color: colors.textMuted
  },
  kind: {
    ...typeScale.micro,
    color: colors.textSubtle
  },
  footer: {
    borderTopColor: colors.borderSoft,
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  hint: {
    ...typeScale.micro,
    color: colors.textSubtle
  }
});
