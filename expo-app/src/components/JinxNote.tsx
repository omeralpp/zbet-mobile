import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";
import { pickJinxNote } from "@/src/api/jinx-notes-schema";
import { jinxNotesQuery } from "@/src/api/queries";
import { colors, iconSizes, radii, semantic, spacing, typeScale } from "@/src/theme/theme";

const LABEL = { PRE: "Maç öncesi", DECISION: "Karar anı", POST: "Maç sonu" } as const;

/**
 * Jinx's note (owner 2026-11-26): one stored sentence for the match moment
 * that matters now. Written by the BFF from its own facts; display only, so it
 * never changes or explains away a BTB decision. Hidden when there is none.
 */
export function JinxNote({ matchKey, decisionId }: { matchKey: string; decisionId?: string | null | undefined }) {
  const query = useQuery(jinxNotesQuery(matchKey));
  const note = query.isError ? null : pickJinxNote(query.data, decisionId);
  if (!note) return null;
  return (
    <View accessible accessibilityLabel={`Jinx notu, ${LABEL[note.kind]}: ${note.text}`} style={styles.note}>
      <View style={styles.head}>
        <MaterialCommunityIcons accessible={false} color={semantic.intelligence} name="comment-quote-outline" size={iconSizes.inline} />
        <Text style={styles.label}>Jinx notu · {LABEL[note.kind]}</Text>
      </View>
      <Text style={styles.text}>{note.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: { gap: 4, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.sm,
    borderLeftWidth: 3, borderLeftColor: semantic.intelligence, backgroundColor: colors.surfaceStrong },
  head: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { color: semantic.intelligence, ...typeScale.label, letterSpacing: 0, fontWeight: "700" },
  text: { color: colors.text, ...typeScale.bodyCompact }
});
