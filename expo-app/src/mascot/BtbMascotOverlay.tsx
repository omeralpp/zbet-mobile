import {
  useEffect,
  useMemo,
  useState,
  type ComponentProps
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import {
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

type Position = {
  x: number;
  y: number;
};

type MenuItem = {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
};

const storageKey = "btb-mobile-next-mascot-position-v1";
const mascotSize = 52;
const edgeMargin = 10;

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
  const [blink, setBlink] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const defaultPosition = useMemo(
    () => ({
      x: edgeMargin + insets.left,
      y: Math.max(
        edgeMargin + insets.top,
        height - insets.bottom - mascotSize - 105
      )
    }),
    [height, insets.bottom, insets.left, insets.top]
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
    [
      height,
      insets.bottom,
      insets.left,
      insets.right,
      insets.top,
      width
    ]
  );
  const visiblePosition = useMemo(
    () => clampPosition(position, bounds),
    [bounds, position]
  );
  const open = openPath === pathname;

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((stored) => {
        const restored = clampPosition(
          parseStoredPosition(stored) ?? defaultPosition,
          bounds
        );
        setPosition(restored);
      })
      .catch(() => undefined);
  }, [bounds, defaultPosition]);

  useEffect(() => {
    const greetingTimer = setTimeout(() => {
      setShowGreeting(false);
    }, 2800);
    return () => clearTimeout(greetingTimer);
  }, []);

  useEffect(() => {
    let disposed = false;
    let blinkTimer: ReturnType<typeof setTimeout> | null = null;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      blinkTimer = setTimeout(
        () => {
          if (disposed) {
            return;
          }
          setBlink(true);
          resetTimer = setTimeout(() => {
            if (!disposed) {
              setBlink(false);
              schedule();
            }
          }, 150);
        },
        3800 + Math.round(Math.random() * 2200)
      );
    };
    schedule();

    return () => {
      disposed = true;
      if (blinkTimer) {
        clearTimeout(blinkTimer);
      }
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
    };
  }, []);

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
          setPosition(
            clampPosition(
              {
                x: visiblePosition.x + gesture.dx,
                y: visiblePosition.y + gesture.dy
              },
              bounds
            )
          );
        },
        onPanResponderRelease: (_, gesture) => {
          const next = clampPosition(
            {
              x: visiblePosition.x + gesture.dx,
              y: visiblePosition.y + gesture.dy
            },
            bounds
          );
          setPosition(next);
          AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(
            () => undefined
          );
        },
        onPanResponderTerminate: (_, gesture) => {
          setPosition(
            clampPosition(
              {
                x: visiblePosition.x + gesture.dx,
                y: visiblePosition.y + gesture.dy
              },
              bounds
            )
          );
        }
      }),
    [bounds, visiblePosition]
  );

  const menuItems = useMemo<MenuItem[]>(() => {
    const items: MenuItem[] = [];
    if (pageActions) {
      items.push(
        {
          key: "page-back",
          icon: "arrow-left",
          label: "Sayfada geri",
          onPress: pageActions.back
        },
        {
          key: "page-refresh",
          icon: "reload",
          label: "Yenile",
          onPress: pageActions.refresh
        },
        {
          key: "page-external",
          icon: "open-in-new",
          label: "Tarayıcıda aç",
          onPress: pageActions.openExternal
        }
      );
    }

    items.push(
      {
        key: "home",
        icon: "view-dashboard-outline",
        label: "Özet",
        onPress: () => router.replace("/")
      },
      {
        key: "live",
        icon: "soccer",
        label: "Canlı",
        onPress: () => router.replace("/live")
      },
      {
        key: "super",
        icon: "star-outline",
        label: "Super",
        onPress: () => router.replace("/super")
      },
      {
        key: "toto",
        icon: "ticket-confirmation-outline",
        label: "Toto",
        onPress: () => router.replace("/toto")
      }
    );

    if (pathname !== "/fiori") {
      items.push({
        key: "fiori",
        icon: "view-dashboard-variant-outline",
        label: "Fiori",
        onPress: () =>
          router.push({
            pathname: "/fiori",
            params: { target: "launchpad" }
          })
      });
    }
    return items;
  }, [pageActions, pathname, router]);

  const menuDown = visiblePosition.y < height / 2;
  const menuRight = visiblePosition.x > width / 2;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        {...panResponder.panHandlers}
        style={[
          styles.anchor,
          {
            left: visiblePosition.x,
            top: visiblePosition.y
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
                  <MaterialCommunityIcons
                    color={colors.text}
                    name={item.icon}
                    size={19}
                  />
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
            <Text style={styles.greetingText}>Hi!</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityLabel="BTB maskotu hızlı menü"
          accessibilityRole="button"
          onPress={() => {
            setOpenPath(open ? null : pathname);
            if (Platform.OS !== "web") {
              Haptics.selectionAsync().catch(() => undefined);
            }
          }}
          style={({ pressed }) => [
            styles.toggle,
            open && styles.toggleOpen,
            pressed && styles.togglePressed
          ]}
        >
          <View style={styles.legLeft} />
          <View style={styles.legRight} />
          <LinearGradient
            colors={
              open
                ? ["#FFFFFF", "#E8FBF5", "#9EE5CF"]
                : ["#FFFFFF", "#EEF9FD", "#B9E4F4"]
            }
            style={styles.ball}
          >
            <View
              style={[
                styles.eye,
                styles.eyeLeft,
                (blink || open) && styles.eyeBlink
              ]}
            />
            <View
              style={[
                styles.eye,
                styles.eyeRight,
                (blink || open) && styles.eyeBlink
              ]}
            />
            <View style={[styles.mouth, open && styles.mouthHappy]} />
          </LinearGradient>
          <Text style={styles.sparkle}>✦</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    left: 0,
    top: 0,
    width: mascotSize,
    height: mascotSize,
    zIndex: 1000,
    elevation: 30
  },
  toggle: {
    width: mascotSize,
    height: mascotSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.blue,
    backgroundColor: colors.background,
    ...shadows.card
  },
  toggleOpen: {
    backgroundColor: colors.surfaceStrong,
    transform: [{ rotate: "10deg" }]
  },
  togglePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }]
  },
  ball: {
    width: 39,
    height: 39,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#56C8FF"
  },
  eye: {
    position: "absolute",
    top: 11,
    width: 5,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.background,
    transform: [{ scaleY: 1 }]
  },
  eyeLeft: {
    left: 8
  },
  eyeRight: {
    right: 8
  },
  eyeBlink: {
    height: 2,
    top: 14
  },
  mouth: {
    position: "absolute",
    left: 12,
    top: 23,
    width: 11,
    height: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.background,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8
  },
  mouthHappy: {
    left: 9,
    top: 21,
    width: 17,
    height: 9
  },
  legLeft: {
    position: "absolute",
    left: 15,
    bottom: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#56C8FF",
    transform: [{ rotate: "-55deg" }]
  },
  legRight: {
    position: "absolute",
    right: 15,
    bottom: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#56C8FF",
    transform: [{ rotate: "55deg" }]
  },
  sparkle: {
    position: "absolute",
    right: 0,
    top: -4,
    color: "#56C8FF",
    fontSize: 11,
    fontWeight: "900"
  },
  greeting: {
    position: "absolute",
    top: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#56C8FF",
    backgroundColor: colors.white,
    ...shadows.card
  },
  greetingLeft: {
    left: mascotSize + 8
  },
  greetingRight: {
    right: mascotSize + 8
  },
  greetingText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: "900"
  },
  menu: {
    position: "absolute",
    gap: 6,
    minWidth: 150
  },
  menuUp: {
    bottom: mascotSize + 8
  },
  menuDown: {
    top: mascotSize + 8
  },
  menuLeft: {
    left: 0
  },
  menuRight: {
    right: 0
  },
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
  menuItemRight: {
    flexDirection: "row-reverse"
  },
  menuItemPressed: {
    backgroundColor: colors.surfaceStrong
  },
  menuIcon: {
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.blueSoft
  },
  menuLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800"
  }
});
