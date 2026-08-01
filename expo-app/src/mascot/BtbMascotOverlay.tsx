import {
  useEffect,
  useMemo,
  useState,
  type ComponentProps
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import {
  AccessibilityInfo,
  Animated,
  Image,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, shadows } from "@/src/theme/theme";
import { useMascotActions } from "./MascotActions";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type Position = { x: number; y: number };
type MenuItem = {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
};

const storageKey = "btb-mobile-next-bibi-position-v3";
const mascotSize = 58;
const edgeMargin = 10;
const bibiFrames = [
  require("../../assets/mascot/bibi-open.png"),
  require("../../assets/mascot/bibi-half.png"),
  require("../../assets/mascot/bibi-closed.png")
] as const;

function parseStoredPosition(value: string | null): Position | null {
  if (!value) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "x" in parsed &&
      "y" in parsed &&
      typeof parsed.x === "number" &&
      typeof parsed.y === "number" &&
      Number.isFinite(parsed.x) &&
      Number.isFinite(parsed.y)
    ) {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    return null;
  }
  return null;
}

function clampPosition(
  position: Position,
  bounds: {
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  }
): Position {
  return {
    x: Math.min(
      Math.max(edgeMargin + bounds.left, position.x),
      Math.max(
        edgeMargin + bounds.left,
        bounds.width - bounds.right - mascotSize - edgeMargin
      )
    ),
    y: Math.min(
      Math.max(edgeMargin + bounds.top, position.y),
      Math.max(
        edgeMargin + bounds.top,
        bounds.height - bounds.bottom - mascotSize - edgeMargin
      )
    )
  };
}

export function BtbMascotOverlay() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const { pageActions } = useMascotActions();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [blinkFrame, setBlinkFrame] = useState<0 | 1 | 2>(0);
  const [showGreeting, setShowGreeting] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [floatY] = useState(() => new Animated.Value(0));
  const [pressScale] = useState(() => new Animated.Value(1));
  const [openTilt] = useState(() => new Animated.Value(0));
  const [dragTilt] = useState(() => new Animated.Value(0));
  const [dragTranslation] = useState(
    () => new Animated.ValueXY({ x: 0, y: 0 })
  );
  const [halo] = useState(() => new Animated.Value(0.2));
  const defaultPosition = useMemo(
    () => ({
      x: Math.max(
        edgeMargin + insets.left,
        width - insets.right - mascotSize - edgeMargin
      ),
      y: edgeMargin + insets.top
    }),
    [insets.left, insets.right, insets.top, width]
  );
  const [position, setPosition] = useState<Position>(defaultPosition);
  const bounds = useMemo(
    () => ({
      width,
      height,
      top: insets.top,
      right: insets.right,
      bottom: insets.bottom,
      left: insets.left
    }),
    [height, insets.bottom, insets.left, insets.right, insets.top, width]
  );
  const visiblePosition = useMemo(
    () => clampPosition(position, bounds),
    [bounds, position]
  );
  const open = openPath === pathname;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((stored) => {
        setPosition(
          clampPosition(parseStoredPosition(stored) ?? defaultPosition, bounds)
        );
      })
      .catch(() => undefined);
  }, [bounds, defaultPosition]);

  useEffect(() => {
    const greetingTimer = setTimeout(() => setShowGreeting(false), 2800);
    return () => clearTimeout(greetingTimer);
  }, []);

  useEffect(() => {
    floatY.stopAnimation();
    floatY.setValue(0);
    if (reduceMotion) {
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -2,
          duration: 1800,
          useNativeDriver: true
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [floatY, reduceMotion]);

  useEffect(() => {
    let disposed = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (callback: () => void, delay: number) => {
      const timer = setTimeout(callback, delay);
      timers.push(timer);
    };
    const schedule = () => {
      later(() => {
        if (disposed || open) {
          schedule();
          return;
        }
        setBlinkFrame(1);
        later(() => setBlinkFrame(2), 55);
        later(() => setBlinkFrame(1), 125);
        later(() => {
          setBlinkFrame(0);
          schedule();
        }, 190);
      }, 3800 + Math.round(Math.random() * 2400));
    };
    schedule();
    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
    };
  }, [open]);

  useEffect(() => {
    if (reduceMotion) {
      openTilt.setValue(0);
      halo.setValue(open ? 1 : 0.2);
      return;
    }
    Animated.parallel([
      Animated.spring(openTilt, {
        toValue: open ? 1 : 0,
        damping: 13,
        stiffness: 150,
        mass: 0.7,
        useNativeDriver: true
      }),
      Animated.timing(halo, {
        toValue: open ? 1 : 0.2,
        duration: 220,
        useNativeDriver: true
      })
    ]).start();
  }, [halo, open, openTilt, reduceMotion]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
        onPanResponderGrant: () => {
          setOpenPath(null);
          if (Platform.OS !== "web") {
            Haptics.selectionAsync().catch(() => undefined);
          }
        },
        onPanResponderMove: (_, gesture) => {
          const next = clampPosition(
            {
              x: visiblePosition.x + gesture.dx,
              y: visiblePosition.y + gesture.dy
            },
            bounds
          );
          dragTranslation.setValue({
            x: next.x - visiblePosition.x,
            y: next.y - visiblePosition.y
          });
          if (!reduceMotion) {
            dragTilt.setValue(Math.max(-1, Math.min(1, gesture.dx / 36)));
          }
        },
        onPanResponderRelease: (_, gesture) => {
          const next = clampPosition(
            {
              x: visiblePosition.x + gesture.dx,
              y: visiblePosition.y + gesture.dy
            },
            bounds
          );
          dragTranslation.setValue({ x: 0, y: 0 });
          setPosition(next);
          AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(
            () => undefined
          );
          Animated.spring(dragTilt, {
            toValue: 0,
            damping: 14,
            stiffness: 180,
            useNativeDriver: true
          }).start();
        },
        onPanResponderTerminate: () => {
          dragTranslation.setValue({ x: 0, y: 0 });
          dragTilt.setValue(0);
        }
      }),
    [bounds, dragTilt, dragTranslation, reduceMotion, visiblePosition]
  );

  const menuItems = useMemo<MenuItem[]>(() => {
    const items: MenuItem[] = [];
    if (pageActions) {
      items.push(
        { key: "page-back", icon: "arrow-left", label: "Sayfada geri", onPress: pageActions.back },
        { key: "page-refresh", icon: "reload", label: "Yenile", onPress: pageActions.refresh },
        { key: "page-external", icon: "open-in-new", label: "Tarayıcıda aç", onPress: pageActions.openExternal }
      );
    }
    items.push(
      { key: "home", icon: "view-dashboard-outline", label: "Özet", onPress: () => router.replace("/") },
      { key: "live", icon: "soccer", label: "Canlı", onPress: () => router.replace("/live") },
      { key: "super", icon: "star-outline", label: "Super", onPress: () => router.replace("/super") },
      { key: "toto", icon: "ticket-confirmation-outline", label: "Toto", onPress: () => router.replace("/toto") }
    );
    if (pathname !== "/fiori") {
      items.push({
        key: "fiori",
        icon: "view-dashboard-variant-outline",
        label: "Fiori",
        onPress: () =>
          router.push({ pathname: "/fiori", params: { target: "launchpad" } })
      });
    }
    return items;
  }, [pageActions, pathname, router]);

  const menuDown = visiblePosition.y < height / 2;
  const menuRight = visiblePosition.x > width / 2;
  const rotation = Animated.add(
    openTilt.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }),
    dragTilt
  ).interpolate({ inputRange: [-1, 1], outputRange: ["-8deg", "8deg"] });

  const animatePress = (toValue: number) => {
    Animated.spring(pressScale, {
      toValue,
      damping: 15,
      stiffness: 240,
      useNativeDriver: true
    }).start();
  };

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.anchor,
          {
            left: visiblePosition.x,
            top: visiblePosition.y,
            transform: [
              { translateX: dragTranslation.x },
              { translateY: dragTranslation.y }
            ]
          }
        ]}
      >
        {open ? (
          <View
            style={[
              styles.menu,
              menuDown ? styles.menuDown : styles.menuUp,
              menuRight ? styles.menuRight : styles.menuLeft
            ]}
          >
            {menuItems.map((item) => (
              <Pressable
                accessibilityLabel={item.label}
                key={item.key}
                onPress={() => {
                  setOpenPath(null);
                  item.onPress();
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  menuRight && styles.menuItemRight,
                  pressed && styles.menuItemPressed
                ]}
              >
                <View style={styles.menuIcon}>
                  <MaterialCommunityIcons color={colors.text} name={item.icon} size={19} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {showGreeting ? (
          <View
            pointerEvents="none"
            style={[
              styles.greeting,
              menuRight ? styles.greetingRight : styles.greetingLeft
            ]}
          >
            <Text style={styles.greetingText}>Bibi hazır</Text>
          </View>
        ) : null}

        <Animated.View
          style={{
            transform: [
              { translateY: reduceMotion ? 0 : floatY },
              { scale: pressScale },
              { rotate: reduceMotion ? "0deg" : rotation }
            ]
          }}
        >
          <Pressable
            accessibilityLabel="Bibi hızlı menü"
            accessibilityRole="button"
            onPress={() => {
              setOpenPath(open ? null : pathname);
              if (Platform.OS !== "web") {
                Haptics.selectionAsync().catch(() => undefined);
              }
            }}
            onPressIn={() => animatePress(0.92)}
            onPressOut={() => animatePress(1)}
            style={styles.toggle}
          >
            <Animated.View pointerEvents="none" style={[styles.halo, { opacity: halo }]} />
            <Image
              resizeMode="contain"
              source={bibiFrames[open ? 2 : blinkFrame]}
              style={styles.bibi}
            />
            <Text style={styles.sparkle}>✦</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    width: mascotSize,
    height: mascotSize,
    zIndex: 1000,
    elevation: 30
  },
  toggle: {
    width: mascotSize,
    height: mascotSize,
    alignItems: "center",
    justifyContent: "center"
  },
  halo: {
    position: "absolute",
    top: 2,
    right: 2,
    bottom: 2,
    left: 2,
    borderRadius: radii.round,
    borderWidth: 2,
    borderColor: colors.green,
    backgroundColor: colors.blueSoft,
    ...shadows.card
  },
  bibi: { width: mascotSize, height: mascotSize },
  sparkle: {
    position: "absolute",
    right: -1,
    top: -5,
    color: "#56C8FF",
    fontSize: 12,
    fontWeight: "900"
  },
  greeting: {
    position: "absolute",
    top: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.blue,
    backgroundColor: colors.white,
    ...shadows.card
  },
  greetingLeft: { left: mascotSize + 8 },
  greetingRight: { right: mascotSize + 8 },
  greetingText: { color: colors.background, fontSize: 12, fontWeight: "900" },
  menu: { position: "absolute", gap: 6, minWidth: 150 },
  menuUp: { bottom: mascotSize + 8 },
  menuDown: { top: mascotSize + 8 },
  menuLeft: { left: 0 },
  menuRight: { right: 0 },
  menuItem: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.round,
    backgroundColor: "rgba(4, 16, 30, 0.96)",
    ...shadows.card
  },
  menuItemRight: { flexDirection: "row-reverse" },
  menuItemPressed: { backgroundColor: colors.surfaceStrong },
  menuIcon: {
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.blueSoft
  },
  menuLabel: { color: colors.text, fontSize: 12, fontWeight: "800" }
});
