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
import { SurfaceMaterial } from "@/src/components/SurfaceMaterial";
import { useAuth } from "@/src/auth/AuthProvider";
import { runtimeConfig } from "@/src/config/runtime";
import { expandAllModules } from "@/src/layout/module-collapse-store";
import { resetModuleOrder } from "@/src/layout/module-layout-store";
import type { ModuleLayoutSurface } from "@/src/layout/module-layout";
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
  iconSizes,
  radii,
  semantic,
  spacing,
  themeMode,
  typeScale
} from "@/src/theme/theme";
import { useDiscovery } from "@/src/mascot/DiscoveryProvider";
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
        <MaterialCommunityIcons
          color={colors.blue}
          name={icon}
          size={iconSizes.control}
        />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <MaterialCommunityIcons
        color={colors.textSubtle}
        name="chevron-right"
        size={iconSizes.control}
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
          size={iconSizes.control}
        />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>Koyu tema</Text>
        <Text style={styles.rowDetail}>
          {dark ? "Koyu" : "Açık"} görünüm etkin · uygulama ve widget’lar birlikte değişir
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
      return "Bildirim bağlantısı hazırlanıyor…";
    case "device_registration":
      return "Cihaz bildirimlere bağlanıyor…";
    default:
      return "BTB maç ve karar bildirimlerini etkinleştir";
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
      return "Bildirim bağlantısı zaman aşımına uğradı.";
    case "PUSH_TOKEN_FAILED":
      return "Bildirim bağlantısı kurulamadı.";
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
  const discovery = useDiscovery();

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

  // Order and collapse are stored independently, but this control is the user's
  // one way back to the default layout, so it has to undo both. A reset that
  // restored the order and left the panels shut would leave someone who closed
  // several modules with no way to find them again short of reopening each.
  const restoreLayout = (surface: ModuleLayoutSurface, label: string) => {
    Promise.all([resetModuleOrder(surface), expandAllModules(surface)])
      .then(() =>
        Alert.alert(
          "Düzen sıfırlandı",
          `${label} BTB varsayılan sırasına döndü ve tüm modüller açıldı.`
        )
      )
      .catch((error: unknown) => {
        Alert.alert(
          "Düzen sıfırlanamadı",
          error instanceof Error ? error.message : "Bilinmeyen hata."
        );
      });
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
    <Screen eyebrow="BTB MOBILE" tabSwipe title="Daha fazla">
      <View style={styles.modeCard}>
        <SurfaceMaterial
          accent={
            runtimeConfig.useMocks ? semantic.warning : semantic.positive
          }
          radius={radii.lg}
        />
        <View style={styles.modeHeader}>
          <View
            style={[
              styles.modeDot,
              {
                backgroundColor: runtimeConfig.useMocks
                  ? semantic.warning
                  : semantic.positive
              }
            ]}
          />
          <Text style={styles.modeTitle}>
            {runtimeConfig.useMocks ? "Önizleme modu" : "Canlı veriler bağlı"}
          </Text>
        </View>
        <Text style={styles.modeDetail}>
          {runtimeConfig.useMocks
            ? "Uygulama güvenli örnek veriler gösteriyor."
            : "Maç ve karar verileri güvenli bağlantı üzerinden güncelleniyor."}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Bağlantılar</Text>
      <View style={styles.group}>
        <SettingsRow
          detail="Gelişmiş BTB ekranlarını web üzerinde aç"
          icon="view-dashboard-variant-outline"
          onPress={() =>
            router.push({
              pathname: "/fiori",
              params: { target: "launchpad" }
            })
          }
          title="BTB Web Uygulamaları"
        />
        <SettingsRow
          detail="Bilyoner uygulaması veya web sitesi"
          icon="open-in-new"
          onPress={() => Linking.openURL("https://www.bilyoner.com/")}
          title="Bilyoner"
        />
      </View>

      <Text style={styles.sectionTitle}>Düzen</Text>
      <View style={styles.group}>
        <View style={styles.note}>
          <Text style={styles.noteText}>
            Özet, canlı maç detayı ve Super karar detayındaki analiz
            modüllerini uzun basıp sürükleyerek kendi sıranıza taşıyabilirsiniz.
            Sıralama bu cihazda saklanır; yeni modüller otomatik eklenir.
          </Text>
        </View>
        <SettingsRow
          detail="Panodaki bölümleri BTB varsayılan sırasına döndür"
          icon="view-dashboard-outline"
          onPress={() => restoreLayout("overview", "Özet düzeni")}
          title="Özet düzenini sıfırla"
        />
        <SettingsRow
          detail="Canlı maç detayı modüllerini varsayılan sıraya döndür"
          icon="soccer"
          onPress={() => restoreLayout("liveDetail", "Canlı detay düzeni")}
          title="Canlı detay düzenini sıfırla"
        />
        <SettingsRow
          detail="Super karar detayı modüllerini varsayılan sıraya döndür"
          icon="star-outline"
          onPress={() => restoreLayout("superDetail", "Super detay düzeni")}
          title="Super detay düzenini sıfırla"
        />
      </View>

      <Text style={styles.sectionTitle}>Cihaz</Text>
      <View style={styles.group}>
        <ThemeSwitchRow
          changing={themeChanging}
          onChange={changeTheme}
        />
        <SettingsRow
          detail={
            discovery.pace === "QUIET"
              ? "Jinx kendiliğinden ipucu vermiyor; rehber açıldığında yine çalışır"
              : "Jinx ara sıra bilinmeyen bir özelliği hatırlatır; rehber ayrı çalışır"
          }
          icon={
            discovery.pace === "QUIET" ? "bell-sleep-outline" : "lightbulb-on-outline"
          }
          onPress={() =>
            discovery.setPace(discovery.pace === "QUIET" ? "NORMAL" : "QUIET")
          }
          title={
            discovery.pace === "QUIET" ? "Jinx ipuçları: Sessiz" : "Jinx ipuçları: Normal"
          }
        />
        <TutorialTarget id="more-tutorial-restart" radius={0}>
          <SettingsRow
            detail="Tamamlanan adımları temizler ve rehberi yeniden açar"
            icon="restart"
            onPress={() => {
              tutorial.restart();
              Alert.alert(
                "Jinx rehberi baştan başladı",
                "Ekranları açtıkça kısa anlatımlar yeniden gösterilecek."
              );
            }}
            title="Jinx rehberini baştan başlat"
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
            <MaterialCommunityIcons
              color={colors.gold}
              name="star-outline"
              size={iconSizes.control}
            />
          </View>
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>Super bildirim eşiği</Text>
            <Text style={styles.rowDetail}>
              Yalnız {notificationMinimum}+ yıldız Super kararları görünür bildirim gönderir
            </Text>
          </View>
          <MaterialCommunityIcons
            color={colors.textSubtle}
            name={notificationMinimumOpen ? "chevron-up" : "chevron-down"}
            size={iconSizes.control}
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
                    <MaterialCommunityIcons
                      color={colors.white}
                      name="check"
                      size={iconSizes.inline}
                    />
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
        BTB canlı maçları ve Spor Toto programları aynı uygulamada sunulur;
        karar ve performans bilgileri kendi bağlamında değerlendirilir.
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
    ...typeScale.decision
  },
  modeDetail: {
    color: colors.textMuted,
    ...typeScale.body,
    marginTop: spacing.sm
  },
  // Section labels here are the same grammar as a module eyebrow elsewhere,
  // so they take the same role and the same structural bronze.
  sectionTitle: {
    color: colors.bronze,
    ...typeScale.eyebrow,
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
  note: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  noteText: {
    color: colors.textMuted,
    ...typeScale.bodyCompact
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
    ...typeScale.label
  },
  preferenceOptionText: {
    flex: 1,
    color: colors.textMuted,
    ...typeScale.bodyCompact
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
    ...typeScale.identity
  },
  rowDetail: {
    color: colors.textSubtle,
    ...typeScale.bodyCompact,
    marginTop: spacing.xs
  },
  boundary: {
    color: colors.textSubtle,
    ...typeScale.bodyCompact,
    textAlign: "center",
    marginTop: spacing.xxxl,
    paddingHorizontal: spacing.lg
  }
});
