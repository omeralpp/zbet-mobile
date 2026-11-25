import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { mobileApi } from "@/src/api";
import { adaptationDeviationsQuery, queryKeys } from "@/src/api/queries";
import type { AdaptationDeviations, DeviationBand, DeviationBandChange } from "@/src/api/adaptations-schema";
import { Screen } from "@/src/components/Screen";
import { ErrorState, LoadingState } from "@/src/components/StateView";
import { colors, iconSizes, radii, semantic, spacing, typeScale } from "@/src/theme/theme";

/**
 * Uyarlamalar (owner decision 2026-11-24). The deviation bands decide which
 * fixtures the daily load keeps (the first band whose similar-game count
 * reaches its counter) and which of them get predictions (active bands).
 * Changes are made only from the web client; the phone shows the same values.
 */
const isWeb = Platform.OS === "web";

function formatChange(at: string) {
  const date = new Date(at);
  return Number.isFinite(date.getTime())
    ? date.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : at;
}

function BandRow({ band, editable, onSave, saving }: {
  band: DeviationBand;
  editable: boolean;
  onSave: (change: DeviationBandChange) => void;
  saving: boolean;
}) {
  const [counter, setCounter] = useState(band.counter === null ? "" : String(band.counter));
  const [active, setActive] = useState(band.active);
  const parsed = Number(counter);
  const counterValid = /^\d{1,6}$/.test(counter) && parsed >= 1 && parsed <= 100000;
  const change: DeviationBandChange = {
    ...(counterValid && parsed !== band.counter ? { counter: parsed } : {}),
    ...(active !== band.active ? { active } : {})
  };
  const dirty = Object.keys(change).length > 0;
  const label = `±${band.deviation.replace(".", ",")}`;
  return (
    <View style={styles.row}>
      <View style={styles.bandCopy}>
        <Text style={styles.bandTitle}>{label} bandı</Text>
        <Text style={styles.rowDetail}>
          {band.active ? "Aktif · bu banttaki maçlar tahmin alır" : "Pasif · maç yüklenir, tahmin almaz"}
        </Text>
      </View>
      {editable ? (
        <View style={styles.controls}>
          <View style={styles.counterField}>
            <Text style={styles.fieldLabel}>Sayaç</Text>
            <TextInput accessibilityLabel={`${label} bandının sayacı`} inputMode="numeric" keyboardType="number-pad" maxLength={6}
              onChangeText={(text) => setCounter(text.replace(/[^0-9]/g, ""))} style={[styles.counterInput, !counterValid && styles.inputInvalid]}
              value={counter} />
          </View>
          <Switch accessibilityLabel={`${label} bandı aktif`} accessibilityRole="switch" accessibilityState={{ checked: active }}
            ios_backgroundColor={colors.surfaceStrong} onValueChange={setActive} thumbColor={active ? colors.onAction : colors.textMuted}
            trackColor={{ false: colors.surfaceStrong, true: colors.actionFill }} value={active} />
          <Pressable accessibilityRole="button" accessibilityLabel={`${label} bandını kaydet`} accessibilityState={{ disabled: !dirty || !counterValid || saving }}
            disabled={!dirty || !counterValid || saving} onPress={() => onSave(change)}
            style={({ pressed }) => [styles.save, (!dirty || !counterValid || saving) && styles.saveDisabled, pressed && styles.pressed]}>
            <Text style={styles.saveText}>{saving ? "Kaydediliyor" : "Kaydet"}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.readOnly}>
          <Text style={styles.readOnlyValue}>{band.counter === null ? "—" : band.counter}</Text>
          <Text style={styles.fieldLabel}>sayaç</Text>
        </View>
      )}
    </View>
  );
}

export default function AdaptationsScreen() {
  const queryClient = useQueryClient();
  const query = useQuery(adaptationDeviationsQuery);
  const [savingBand, setSavingBand] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: ({ deviation, change }: { deviation: string; change: DeviationBandChange }) => mobileApi.updateAdaptationDeviation(deviation, change),
    onMutate: ({ deviation }) => setSavingBand(deviation),
    onSettled: () => setSavingBand(null),
    onSuccess: (data: AdaptationDeviations) => queryClient.setQueryData(queryKeys.adaptationDeviations, data)
  });
  const data = query.data;
  const editable = isWeb && Boolean(data?.editable);

  return (
    <Screen eyebrow="Daha Fazla" title="Uyarlamalar">
      <Text accessibilityRole="header" aria-level={2} style={styles.sectionTitle}>Sapma bantları</Text>
      <View style={styles.note}>
        <Text style={styles.noteText}>
          Günlük yükleme her maçı benzer oranlı geçmiş maçlarla karşılaştırır; sayacına ilk ulaşılan bant maçın bandı olur, hiçbir
          banda ulaşamayan maç yüklenmez. Yalnız aktif bantlardaki maçlar tahmin alır. Sayaç değişikliği bir sonraki yüklemede ve maç
          öncesi oran kontrolünde, aktiflik değişikliği canlı tahminde hemen geçerli olur.
        </Text>
      </View>
      {!isWeb ? (
        <View style={styles.banner}>
          <MaterialCommunityIcons accessible={false} color={colors.blue} name="monitor" size={iconSizes.inline} />
          <Text style={styles.bannerText}>Bu ayarlar yalnızca web üzerinden değiştirilebilir.</Text>
        </View>
      ) : data && !data.editable && data.readOnlyReason ? (
        <View style={styles.banner}>
          <MaterialCommunityIcons accessible={false} color={semantic.warning} name="lock-outline" size={iconSizes.inline} />
          <Text style={styles.bannerText}>{data.readOnlyReason}</Text>
        </View>
      ) : null}
      {mutation.isError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {mutation.error instanceof Error ? mutation.error.message : "Değişiklik kaydedilemedi."}
        </Text>
      ) : null}

      {query.isLoading ? <LoadingState label="Bantlar yükleniyor" /> : query.isError ? (
        <ErrorState error={query.error} message={query.error instanceof Error ? query.error.message : "Bantlar alınamadı."}
          onRetry={() => void query.refetch()} />
      ) : data ? (
        <>
          <View style={styles.group}>
            {data.bands.map((band) => (
              <BandRow band={band} editable={editable} key={`${band.deviation}:${band.counter}:${band.active}`} saving={savingBand === band.deviation}
                onSave={(change) => mutation.mutate({ deviation: band.deviation, change })} />
            ))}
          </View>
          {data.changes.length ? (
            <>
              <Text accessibilityRole="header" aria-level={2} style={styles.sectionTitle}>Son değişiklikler</Text>
              <View style={styles.group}>
                {data.changes.map((item) => (
                  <View key={`${item.changedAt}:${item.deviation}`} style={styles.changeRow}>
                    <Text style={styles.rowDetail}>{formatChange(item.changedAt)} · ±{item.deviation.replace(".", ",")}</Text>
                    <Text style={styles.changeText}>
                      {item.counter.from !== item.counter.to ? `Sayaç ${item.counter.from ?? "—"} → ${item.counter.to ?? "—"}` : ""}
                      {item.counter.from !== item.counter.to && item.active.from !== item.active.to ? " · " : ""}
                      {item.active.from !== item.active.to ? (item.active.to ? "Aktif edildi" : "Pasif edildi") : ""}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.textMuted, ...typeScale.eyebrow, marginTop: spacing.xl, marginBottom: 10, paddingHorizontal: spacing.xs },
  note: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md },
  noteText: { color: colors.textMuted, ...typeScale.bodyCompact },
  banner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, marginBottom: spacing.md, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.borderSoft },
  bannerText: { flex: 1, color: colors.text, ...typeScale.bodyCompact },
  error: { color: semantic.warning, ...typeScale.bodyCompact, marginBottom: spacing.md },
  group: { borderRadius: radii.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.borderSoft },
  row: { minHeight: 76, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.md, backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  bandCopy: { flex: 1, minWidth: 160 },
  bandTitle: { color: colors.text, ...typeScale.identity, fontWeight: "700" },
  rowDetail: { color: colors.textSubtle, ...typeScale.bodyCompact, marginTop: spacing.xs },
  controls: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  counterField: { alignItems: "flex-start", gap: 2 },
  fieldLabel: { color: colors.textMuted, ...typeScale.label },
  counterInput: { width: 88, minHeight: 40, paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md,
    color: colors.text, backgroundColor: colors.background, ...typeScale.body },
  inputInvalid: { borderColor: semantic.warning },
  save: { minHeight: 40, paddingHorizontal: spacing.md, justifyContent: "center", borderRadius: radii.round, backgroundColor: colors.actionFill },
  saveDisabled: { opacity: 0.4 },
  saveText: { color: colors.onAction, ...typeScale.bodyCompact, fontWeight: "700" },
  pressed: { opacity: 0.7 },
  readOnly: { alignItems: "flex-end" },
  readOnlyValue: { color: colors.text, ...typeScale.identity, fontWeight: "700" },
  changeRow: { backgroundColor: colors.backgroundElevated, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  changeText: { color: colors.text, ...typeScale.bodyCompact, marginTop: 2 }
});
