import { useState, type ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Screen } from "@/src/components/Screen";
import { useAuth } from "@/src/auth/AuthProvider";
import { runtimeConfig } from "@/src/config/runtime";
import { openDeveloperMenu } from "@/src/devtools/developer-menu";
import {
  registerPushDevice,
  unregisterPushDevice
} from "@/src/notifications/register";
import { colors, radii, spacing } from "@/src/theme/theme";
import { useTutorial } from "@/src/tutorial/TutorialProvider";
import {
  getWidgetStatus,
  seedWidgetPreview
} from "@/src/widgets/btb-widget";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

function SettingsRow({
  icon,
  title,
  detail,
  onPress
}: {
  icon: IconName;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons color={colors.blue} name={icon} size={22} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <MaterialCommunityIcons
        color={colors.textSubtle}
        name="chevron-right"
        size={22}
      />
    </Pressable>
  );
}

export default function MoreScreen() {
  const [registering, setRegistering] = useState(false);
  const [updatingWidgets, setUpdatingWidgets] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const tutorial = useTutorial();

  const registerNotifications = async () => {
    setRegistering(true);
    try {
      await registerPushDevice();
      Alert.alert("Bildirimler hazır", "Bu cihaz BTB bildirimlerine kaydedildi.");
    } catch (error) {
      Alert.alert(
        "Bildirim kaydı tamamlanamadı",
        error instanceof Error ? error.message : "Bilinmeyen hata."
      );
    } finally {
      setRegistering(false);
    }
  };

  const refreshWidgetPreview = async () => {
    setUpdatingWidgets(true);
    try {
      await seedWidgetPreview();
      const status = await getWidgetStatus();
      Alert.alert(
        "Widgetlar güncellendi",
        `Son Super: ${status.notificationWidgetCount} · Performans: ${status.performanceWidgetCount}`
      );
    } catch (error) {
      Alert.alert(
        "Widget güncellemesi tamamlanamadı",
        error instanceof Error ? error.message : "Bilinmeyen hata."
      );
    } finally {
      setUpdatingWidgets(false);
    }
  };

  return (
    <Screen eyebrow="BTB MOBILE" title="Daha fazla">
      <View style={styles.modeCard}>
        <View style={styles.modeHeader}>
          <View
            style={[
              styles.modeDot,
              {
                backgroundColor: runtimeConfig.useMocks
                  ? colors.gold
                  : colors.green
              }
            ]}
          />
          <Text style={styles.modeTitle}>
            {runtimeConfig.useMocks ? "Preview veri modu" : "Canlı mobil API"}
          </Text>
        </View>
        <Text style={styles.modeDetail}>
          {runtimeConfig.useMocks
            ? "Native deneyim gerçek SAP bağlantısı açılmadan güvenli örnek verilerle çalışıyor."
            : runtimeConfig.mobileApiUrl}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Bağlantılar</Text>
      <View style={styles.group}>
        <SettingsRow
          detail="Gelişmiş işlemler ve tam Fiori ekranları"
          icon="view-dashboard-variant-outline"
          onPress={() =>
            router.push({
              pathname: "/fiori",
              params: { target: "launchpad" }
            })
          }
          title="Fiori Launchpad"
        />
        <SettingsRow
          detail="Bilyoner uygulaması veya web sitesi"
          icon="open-in-new"
          onPress={() => Linking.openURL("https://www.bilyoner.com/")}
          title="Bilyoner"
        />
      </View>

      <Text style={styles.sectionTitle}>Cihaz</Text>
      <View style={styles.group}>
        <SettingsRow
          detail={
            tutorial.enabled
              ? "Ekranlar açıldıkça kısa anlatımları gösterir"
              : "İlerleme saklandı; istediğinde kaldığın yerden aç"
          }
          icon="school-outline"
          onPress={() => tutorial.setEnabled(!tutorial.enabled)}
          title={`Bibi rehberi ${tutorial.enabled ? "açık" : "kapalı"}`}
        />
        <SettingsRow
          detail="Tamamlanan adımları temizler ve rehberi yeniden açar"
          icon="restart"
          onPress={() => {
            tutorial.restart();
            Alert.alert(
              "Bibi rehberi baştan başladı",
              "Ekranları açtıkça kısa anlatımlar yeniden gösterilecek."
            );
          }}
          title="Bibi rehberini baştan başlat"
        />
        <SettingsRow
          detail={
            registering
              ? "Cihaz kaydediliyor…"
              : "BTB topic, widget ve uygulama bildirimlerini etkinleştir"
          }
          icon="bell-ring-outline"
          onPress={registerNotifications}
          title="Bildirimleri etkinleştir"
        />
        {Platform.OS === "android" && __DEV__ ? (
          <SettingsRow
            detail={
              updatingWidgets
                ? "İki widget güncelleniyor…"
                : "Son Super ve Performans widgetlarını test verisiyle yenile"
            }
            icon="widgets-outline"
            onPress={refreshWidgetPreview}
            title="Widget önizlemesini yenile"
          />
        ) : null}
        <SettingsRow
          detail="Android/iOS uygulama izinlerini yönet"
          icon="cog-outline"
          onPress={() => Linking.openSettings()}
          title="Sistem ayarları"
        />
        {__DEV__ ? (
          <SettingsRow
            detail="Gizlendikten sonra Expo geliştirme araçlarını yeniden aç"
            icon="tools"
            onPress={() => {
              openDeveloperMenu().catch((error: unknown) => {
                Alert.alert(
                  "Geliştirici araçları açılamadı",
                  error instanceof Error ? error.message : "Bilinmeyen hata."
                );
              });
            }}
            title="Geliştirici araçları"
          />
        ) : null}
      </View>

      {!runtimeConfig.useMocks && !runtimeConfig.pilotAccessKey ? (
        <>
          <Text style={styles.sectionTitle}>Oturum</Text>
          <View style={styles.group}>
            <SettingsRow
              detail="Bu cihazdaki güvenli oturum verisini temizle"
              icon="logout"
              onPress={() => {
                unregisterPushDevice()
                  .catch(() => undefined)
                  .then(() => auth.signOut())
                  .catch((error: unknown) => {
                    Alert.alert(
                      "Oturum kapatılamadı",
                      error instanceof Error
                        ? error.message
                        : "Bilinmeyen hata."
                    );
                  });
              }}
              title="Oturumu kapat"
            />
          </View>
        </>
      ) : null}

      <Text style={styles.boundary}>
        BTB ve Toto aynı native kabuğu paylaşır; model kararları ve performans
        metrikleri birbirine karıştırılmaz.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  modeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg
  },
  modeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  modeDot: {
    width: 9,
    height: 9,
    borderRadius: 5
  },
  modeTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  modeDetail: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: spacing.xxl,
    marginBottom: spacing.sm
  },
  group: {
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSoft
  },
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  pressed: {
    opacity: 0.7
  },
  rowIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.surfaceStrong
  },
  rowCopy: {
    flex: 1
  },
  rowTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  rowDetail: {
    color: colors.textSubtle,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2
  },
  boundary: {
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: spacing.xxxl,
    paddingHorizontal: spacing.lg
  }
});
