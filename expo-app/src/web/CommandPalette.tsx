import { useId, useLayoutEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { matchesQuery, rebuildCohortsReportQuery, totoProgramsQuery } from "@/src/api/queries";
import { colors, iconSizes, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { buildPaletteItems, searchPalette, type PaletteItem, type PaletteKind } from "./command-palette";
import { paletteScrollOffset } from "./palette-visibility";

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
  const listId = useId();
  const resultsRef = useRef<HTMLDivElement>(null);
  const { height: windowHeight } = useWindowDimensions();
  const topSpace = Math.min(48, windowHeight * 0.12);

  const items = useMemo(
    () =>
      buildPaletteItems({
        matches: queryClient.getQueryData(matchesQuery.queryKey) ?? [],
        recommendations: queryClient.getQueryData(rebuildCohortsReportQuery.queryKey)?.recommendations ?? [],
        totoPrograms: queryClient.getQueryData(totoProgramsQuery.queryKey) ?? []
      }),
    [queryClient]
  );
  const results = useMemo(() => searchPalette(items, query), [items, query]);
  const current = results.length ? Math.max(0, Math.min(selected, results.length - 1)) : -1;
  const optionId = (index: number) => `${listId}-option-${index}`;
  // RN Web supports the full combobox ARIA attributes; the shared native
  // TextInput types intentionally describe only their native subset.
  const inputAria = {
    "aria-autocomplete": "list" as const,
    "aria-controls": listId,
    "aria-haspopup": "listbox" as const,
    "aria-activedescendant": current >= 0 ? optionId(current) : undefined
  };

  useLayoutEffect(() => {
    const list = resultsRef.current;
    if (!list || current < 0) return;
    const reveal = () => {
      const option = list.children.item(current);
      if (!(option instanceof HTMLElement)) return;
      const listRect = list.getBoundingClientRect(), optionRect = option.getBoundingClientRect();
      list.scrollTop = paletteScrollOffset({ scrollTop: list.scrollTop, viewportHeight: list.clientHeight,
        itemTop: optionRect.top - listRect.top + list.scrollTop, itemHeight: optionRect.height });
    };
    reveal();
    const observer = new ResizeObserver(reveal);
    observer.observe(list);
    return () => observer.disconnect();
  }, [current, results]);

  const open = (entry: PaletteItem | undefined) => {
    if (!entry) {
      return;
    }
    onClose();
    router.navigate(entry.href as never);
  };

  return (
    <View style={[styles.backdrop, { paddingTop: topSpace }]}>
      <Pressable accessible={false} focusable={false} tabIndex={-1} onPress={onClose} style={StyleSheet.absoluteFill} />
      <View accessibilityRole="search" style={[styles.panel, { maxHeight: Math.max(0, windowHeight - topSpace - spacing.lg) }]}>
        <View style={styles.inputRow}>
          <MaterialCommunityIcons color={colors.textMuted} name="magnify" size={iconSizes.navigation} />
          <TextInput
            {...inputAria}
            role="combobox"
            aria-expanded
            accessibilityLabel="Maç, Super kararı veya Toto programı ara"
            autoFocus
            onChangeText={(text) => {
              setQuery(text);
              setSelected(0);
            }}
            onKeyPress={(event) => {
              const key = event.nativeEvent.key;
              if ((event.nativeEvent as typeof event.nativeEvent & { isComposing?: boolean }).isComposing) return;
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
        {results.length === 0 ? (
            <Text role="status" accessibilityLiveRegion="polite" style={styles.empty}>
              Sonuç yok. Yalnız ekranların yüklediği maçlar, Super kararları ve Toto programları aranır.
            </Text>
        ) : null}
        <div ref={resultsRef} id={listId} role="listbox" aria-label="Arama sonuçları" style={resultsStyle}>
          {results.map((entry, index) => (
              <Pressable
                role="option"
                nativeID={optionId(index)}
                accessibilityLabel={`${entry.title}, ${entry.subtitle}, ${kindLabels[entry.kind]}`}
                accessibilityState={{ selected: index === current }}
                aria-selected={index === current}
                tabIndex={-1}
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
          ))}
        </div>
        <View style={styles.footer}>
          <Text style={styles.hint}>Yalnız ekranların yüklediği veriler aranır.</Text>
          <Text style={styles.hint}>↑ ↓ seç · Enter aç · Esc kapat</Text>
        </View>
      </View>
    </View>
  );
}

const resultsStyle = { maxHeight: 420, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", flexShrink: 1 } as const;

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(1, 6, 12, 0.66)",
    bottom: 0,
    left: 0,
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
    flexShrink: 0,
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
    flexShrink: 0,
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
