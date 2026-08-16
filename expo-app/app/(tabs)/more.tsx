import { useEffect, useState, type ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";
import { Screen } from "@/src/components/Screen";
import { useAuth } from "@/src/auth/AuthProvider";
import { runtimeConfig } from "@/src/config/runtime";
import { openDeveloperMenu } from "@/src/devtools/developer-menu";
import {
  isPushRegistrationActive,
  registerPushDevice,
  unregisterPushDevice,
  useRegistrationState
} from "@/src/notifications/register";
import type {
  RegistrationErrorCode,
  RegistrationStage
} from "@/src/notifications/registration-machine";
import {
  getSuperNotificationMinimum,
  setSuperNotificationMinimum,
  superNotificationMinimumOptions,
  type SuperNotificationMinimum
} from "@/src/notifications/super-notification-preference";
import {
  applyThemeMode,
  colors,
  radii,
  spacing,
  themeMode
} from "@/src/theme/theme";
import { useTutorial } from "@/src/tutorial/TutorialProvider";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
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
      accessibilityRole="button"
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

function ThemeSwitchRow({
  changing,
  onChange
}: {
  changing: boolean;
  onChange: (dark: boolean) => void;
}) {
  const dark = themeMode === "dark";
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons
          color={colors.blue}
          name={dark ? "weather-night" : "white-balance-sunny"}
          size={22}
        />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>Koyu tema</Text>
        <Text style={styles.rowDetail}>
          {dark ? "Koyu" : "Açık"} görünüm etkin · uygulama ve widgetlar birlikte değişir
        </Text>
      </View>
      <Switch
        accessibilityLabel="Koyu tema"
        accessibilityRole="switch"
        accessibilityState={{ checked: dark, disabled: changing }}
        disabled={changing}
        ios_backgroundColor={colors.surfaceStrong}
        onValueChange={onChange}
        thumbColor={dark ? colors.white : colors.textMuted}
        trackColor={{ false: colors.surfaceStrong, true: colors.blue }}
        value={dark}
      />
    </View>
  );
}

function registrationStageDetail(stage: RegistrationStage): string {
  switch (stage) {
    case "channels":
      return "Bildirim kanalları hazırlanıyor…";
    case "permission_check":
      return "Bildirim izni kontrol ediliyor…";
    case "permission_request":
      return "Bildirim izni isteniyor…";
    case "push_token":
      return "Cihaz kaydediliyor…";
    case "device_registration":
      return "Cihaz sunucuya kaydediliyor…";
    default:
      return "BTB topic, widget ve uygulama bildirimlerini etkinleştir";
  }
}

function registrationErrorDetail(code: RegistrationErrorCode | undefined): string {
  switch (code) {
    case "PUSH_CHANNEL_SETUP_TIMEOUT":
      return "Bildirim kanalları zaman aşımına uğradı.";
    case "PUSH_CHANNEL_SETUP_FAILED":
      return "Bildirim kanalları hazırlanamadı.";
    case "PUSH_PERMISSION_CHECK_TIMEOUT":
      return "Bildirim izni kontrolü zaman aşımına uğradı.";
    case "PUSH_PERMISSION_CHECK_FAILED":
      return "Bildirim izni kontrol edilemedi.";
    case "PUSH_PERMISSION_REQUEST_FAILED":
      return "Bildirim izni istemi başarısız oldu.";
    case "PUSH_PERMISSION_TIMEOUT":
      return "Bildirim izni zaman aşımına uğradı.";
    case "PUSH_PERMISSION_DENIED":
      return "Bildirim izni verilmedi.";
    case "PUSH_TOKEN_TIMEOUT":
      return "Push token zaman aşımına uğradı.";
    case "PUSH_TOKEN_FAILED":
      return "Push token alınamadı.";
    case "DEVICE_REGISTER_TIMEOUT":
      return "Cihaz kaydı zaman aşımına uğradı.";
    case "DEVICE_REGISTER_FAILED":
      return "Cihaz kaydı başarısız oldu.";
    case "REGISTRATION_WATCHDOG_TIMEOUT":
      return "Bildirim kaydı zaman aşımına uğradı.";
    default:
      return "Bilinmeyen hata.";
  }
}

export default function MoreScreen() {
  const registration = useRegistrationState();
  const [updatingWidgets, setUpdatingWidgets] = useState(false);
  const [themeChanging, setThemeChanging] = useState(false);
  const [notificationMinimumOpen, setNotificationMinimumOpen] = useState(false);
  const [notificationMinimum, setNotificationMinimumState] =
    useState<SuperNotificationMinimum>(1);
  const auth = useAuth();
  const router = useRouter();
  const tutorial = useTutorial();

  useEffect(() => {
    getSuperNotificationMinimum()
      .then(setNotificationMinimumState)
      .catch(() => setNotificationMinimumState(1));
  }, []);

  const changeTheme = (dark: boolean) => {
    setThemeChanging(true);
    applyThemeMode(dark ? "dark" : "light")
      .catch((error: unknown) => {
        Alert.alert(
          "Tema değiştirilemedi",
          error instanceof Error ? error.message : "Bilinmeyen hata."
        );
        setThemeChanging(false);
      });
  };

  const changeNotificationMinimum = async (
    minimum: SuperNotificationMinimum
  ) => {
    try {
      await setSuperNotificationMinimum(minimum);
      setNotificationMinimumState(minimum);
      setNotificationMinimumOpen(false);
    } catch (error: unknown) {
      Alert.alert(
        "Bildirim tercihi kaydedilemedi",
        error instanceof Error ? error.message : "Bilinmeyen hata."
      );
    }
  };

  const registerNotifications = async () => {
    if (isPushRegistrationActive()) {
      return;
    }
    try {
      const result = await registerPushDevice();
      if (result.ok) {
        Alert.alert("Bildirimler hazır", "Bu cihaz BTB bildirimlerine kaydedildi.");
      } else {
        Alert.alert("Bildirim kaydı tamamlanamadı", registrationErrorDetail(result.code));
      }
    } catch (error) {
      Alert.alert(
        "Bildirim kaydı tamamlanamadı",
        error instanceof Error ? error.message : "Bilinmeyen hata."
      );
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
        <ThemeSwitchRow
          changing={themeChanging}
          onChange={changeTheme}
        />
        <TutorialTarget id="more-tutorial-restart" radius={0}>
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
        </TutorialTarget>
        <SettingsRow
          detail={
            registration.stage === "failed"
              ? `Bildirim kaydı tamamlanamadı: ${registrationErrorDetail(registration.code)}`
              : registrationStageDetail(registration.stage)
          }
          icon="bell-ring-outline"
          onPress={registerNotifications}
          title="Bildirimleri etkinleştir"
        />
        <Pressable
          accessibilityLabel={`Super bildirim eşiği ${notificationMinimum} yıldız ve üzeri`}
          accessibilityRole="button"
          accessibilityState={{ expanded: notificationMinimumOpen }}
          onPress={() => setNotificationMinimumOpen((open) => !open)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <View style={styles.rowIcon}>
            <MaterialCommunityIcons color={colors.gold} name="star-outline" size={22} />
          </View>
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>Super bildirim eşiği</Text>
            <Text style={styles.rowDetail}>
              Yalnız {notificationMinimum}+ yıldız görünür bildirim gönderilir; widget verisi korunur
            </Text>
          </View>
          <MaterialCommunityIcons
            color={colors.textSubtle}
            name={notificationMinimumOpen ? "chevron-up" : "chevron-down"}
            size={22}
          />
        </Pressable>
        {notificationMinimumOpen ? (
          <View accessibilityRole="menu" style={styles.preferenceMenu}>
            {superNotificationMinimumOptions.map((minimum) => {
              const selected = minimum === notificationMinimum;
              return (
                <Pressable
                  accessibilityLabel={`${minimum} yıldız ve üzeri`}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected }}
                  key={minimum}
                  onPress={() => changeNotificationMinimum(minimum)}
                  style={({ pressed }) => [
                    styles.preferenceOption,
                    selected && styles.preferenceOptionSelected,
                    pressed && styles.pressed
                  ]}
                >
                  <Text
                    style={[
                      styles.preferenceStars,
                      selected && styles.preferenceOptionTextSelected
                    ]}
                  >
                    {"★".repeat(minimum)}
                  </Text>
                  <Text
                    style={[
                      styles.preferenceOptionText,
                      selected && styles.preferenceOptionTextSelected
                    ]}
                  >
                    {minimum === 5 ? "5 yıldız" : `${minimum}+ yıldız`}
                  </Text>
                  {selected ? (
                    <MaterialCommunityIcons color={colors.white} name="check" size={18} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
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
  preferenceMenu: {
    padding: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.surface
  },
  preferenceOption: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md
  },
  preferenceOptionSelected: {
    backgroundColor: colors.blueSoft
  },
  preferenceStars: {
    width: 72,
    color: colors.gold,
    fontSize: 12,
    fontWeight: "900"
  },
  preferenceOptionText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  preferenceOptionTextSelected: {
    color: colors.white
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
