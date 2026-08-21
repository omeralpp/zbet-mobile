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
import { colors, iconSizes, radii, shadows } from "@/src/theme/theme";
import { useTutorial } from "@/src/tutorial/TutorialProvider";
import {
  bibiIdleDurations,
  nextIdleDelayMs,
  pickIdleBehavior,
  type BibiIdleBehavior
} from "./idle-behavior";
import {
  allowsAmbientBibi,
  bibiPresence,
  shouldRenderBibi
} from "./bibi-presence";
import { resolveBubblePosition } from "./bubble-position";
import { useDiscovery } from "./DiscoveryProvider";
import { gestureSpring } from "@/src/theme/motion";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";
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
/** Quiet moment after arriving on a surface before discovery may speak. */
const discoverySettleMs = 1600;
const edgeMargin = 10;
const bibiFrames = [
  require("../../assets/mascot/jinx-open.png"),
  require("../../assets/mascot/jinx-half.png"),
  require("../../assets/mascot/jinx-closed.png")
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
  const tutorial = useTutorial();
  const discovery = useDiscovery();
  // Pulled out so the settle effect depends on the stable callback rather than
  // on the provider value, which changes whenever a hint opens or closes.
  const considerDiscovery = discovery.consider;
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [blinkFrame, setBlinkFrame] = useState<0 | 1 | 2>(0);
  const [showGreeting, setShowGreeting] = useState(true);
  // Shared with every other animated surface, so the device preference cannot
  // be honoured here and quietly ignored elsewhere.
  const reduceMotion = useReducedMotion();
  const [dragging, setDragging] = useState(false);
  const [idleX] = useState(() => new Animated.Value(0));
  const [idleY] = useState(() => new Animated.Value(0));
  const [idleTilt] = useState(() => new Animated.Value(0));
  const [pressScale] = useState(() => new Animated.Value(1));
  const [openTilt] = useState(() => new Animated.Value(0));
  const [dragTilt] = useState(() => new Animated.Value(0));
  const [dragTranslation] = useState(
    () => new Animated.ValueXY({ x: 0, y: 0 })
  );
  const [guideTranslation] = useState(
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
  const tutorialPosition = useMemo(() => {
    if (!tutorial.activeTip) {
      return visiblePosition;
    }
    const target = tutorial.activeTargetRect;
    if (!target) {
      return defaultPosition;
    }
    const targetRight = target.x + target.width;
    const rightCandidate = targetRight + edgeMargin;
    const leftCandidate = target.x - mascotSize - edgeMargin;
    const x =
      rightCandidate + mascotSize <= width - insets.right - edgeMargin
        ? rightCandidate
        : leftCandidate >= insets.left + edgeMargin
          ? leftCandidate
          : targetRight - mascotSize * 0.65;
    return clampPosition(
      {
        x,
        y: target.y - mascotSize * 0.45
      },
      bounds
    );
  }, [
    bounds,
    insets.left,
    insets.right,
    tutorial.activeTip,
    tutorial.activeTargetRect,
    defaultPosition,
    visiblePosition,
    width
  ]);
  // Discovery waits for the user to settle on a surface. A hint that appears in
  // the same frame as the screen reads as something the product pushed rather
  // than as something Bibi noticed, and it lands while the user is still
  // deciding where to look.
  useEffect(() => {
    const timer = setTimeout(
      () =>
        considerDiscovery(pathname, {
          presence: bibiPresence(pathname),
          tutorialActive: Boolean(tutorial.activeTip)
        }),
      discoverySettleMs
    );
    return () => clearTimeout(timer);
  }, [considerDiscovery, pathname, tutorial.activeTip]);

  // One short motion, once, when a hint arrives — never a loop. `LiveDot` stays
  // the product's only continuous ambient animation, because a second one would
  // compete with it for the single meaning ambient motion carries here:
  // something is happening right now.
  useEffect(() => {
    if (!discovery.activeHint || reduceMotion) {
      return undefined;
    }
    const nudge = Animated.sequence([
      Animated.spring(idleY, {
        toValue: -7,
        damping: 9,
        stiffness: 320,
        mass: 0.7,
        useNativeDriver: true
      }),
      Animated.spring(idleY, {
        toValue: 0,
        ...gestureSpring,
        useNativeDriver: true
      })
    ]);
    nudge.start();
    return () => {
      nudge.stop();
      idleY.setValue(0);
    };
  }, [discovery.activeHint, idleY, reduceMotion]);

  const displayPosition = tutorial.activeTip
    ? tutorialPosition
    : visiblePosition;
  const open = !tutorial.activeTip && openPath === pathname;
  // Idle expression is suppressed the moment another interaction owns Bibi, so
  // an interrupted blink can never freeze a half-closed frame on screen.
  const idleSuppressed =
    reduceMotion ||
    open ||
    dragging ||
    Boolean(tutorial.activeTip) ||
    Boolean(discovery.activeHint);

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

  // Bibi is still by default. A short micro-animation plays only after a long
  // quiet window, never repeats the previous one, and stands down completely
  // while the menu, the guide, a drag, or reduce-motion is active.
  useEffect(() => {
    idleX.setValue(0);
    idleY.setValue(0);
    idleTilt.setValue(0);
    if (
      reduceMotion ||
      open ||
      dragging ||
      tutorial.activeTip ||
      discovery.activeHint
    ) {
      return;
    }
    let disposed = false;
    let previous: BibiIdleBehavior | null = null;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (!disposed) {
          callback();
        }
      }, delay);
      timers.add(timer);
    };
    const tiltOnce = (toValue: number) => {
      Animated.sequence([
        Animated.spring(idleTilt, {
          toValue,
          damping: 11,
          stiffness: 220,
          useNativeDriver: true
        }),
        Animated.spring(idleTilt, {
          toValue: 0,
          damping: 14,
          stiffness: 190,
          useNativeDriver: true
        })
      ]).start();
    };
    const play = (behavior: BibiIdleBehavior) => {
      if (behavior === "blink") {
        setBlinkFrame(1);
        later(() => setBlinkFrame(2), 55);
        later(() => setBlinkFrame(1), 130);
        later(() => setBlinkFrame(0), 190);
        return;
      }
      if (behavior === "doubleBlink") {
        setBlinkFrame(2);
        later(() => setBlinkFrame(0), 80);
        later(() => setBlinkFrame(2), 210);
        later(() => setBlinkFrame(0), 300);
        return;
      }
      if (behavior === "wink") {
        setBlinkFrame(1);
        tiltOnce(0.3);
        later(() => setBlinkFrame(0), 210);
        return;
      }
      if (behavior === "bob") {
        Animated.sequence([
          Animated.spring(idleY, {
            toValue: -3,
            damping: 9,
            stiffness: 230,
            useNativeDriver: true
          }),
          Animated.spring(idleY, {
            toValue: 0,
            damping: 12,
            stiffness: 200,
            useNativeDriver: true
          })
        ]).start();
        return;
      }
      Animated.sequence([
        Animated.timing(idleX, {
          toValue: -2.5,
          duration: 260,
          useNativeDriver: true
        }),
        Animated.timing(idleX, {
          toValue: 2.5,
          duration: 340,
          useNativeDriver: true
        }),
        Animated.timing(idleX, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true
        })
      ]).start();
    };
    const schedule = () => {
      later(() => {
        const behavior = pickIdleBehavior(Math.random(), previous);
        previous = behavior;
        play(behavior);
        later(schedule, bibiIdleDurations[behavior]);
      }, nextIdleDelayMs(Math.random()));
    };
    schedule();
    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
      timers.clear();
      setBlinkFrame(0);
      idleX.stopAnimation();
      idleY.stopAnimation();
      idleTilt.stopAnimation();
    };
  }, [
    discovery.activeHint,
    dragging,
    idleTilt,
    idleX,
    idleY,
    open,
    reduceMotion,
    tutorial.activeTip
  ]);

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

  useEffect(() => {
    const next = {
      x: displayPosition.x - visiblePosition.x,
      y: displayPosition.y - visiblePosition.y
    };
    guideTranslation.stopAnimation();
    if (reduceMotion) {
      guideTranslation.setValue(next);
      return;
    }
    Animated.spring(guideTranslation, {
      toValue: next,
      damping: 17,
      stiffness: 120,
      mass: 0.8,
      useNativeDriver: true
    }).start();
  }, [
    displayPosition.x,
    displayPosition.y,
    guideTranslation,
    reduceMotion,
    tutorial.activeTip,
    visiblePosition.x,
    visiblePosition.y
  ]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
        onPanResponderGrant: () => {
          setOpenPath(null);
          setDragging(true);
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
          setDragging(false);
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
          setDragging(false);
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
        label: "BTB Web",
        onPress: () =>
          router.push({ pathname: "/fiori", params: { target: "launchpad" } })
      });
    }
    return items;
  }, [pageActions, pathname, router]);

  const menuDown = displayPosition.y < height / 2;
  const menuRight = displayPosition.x > width / 2;
  const tutorialBubbleWidth = Math.min(
    300,
    Math.max(220, width - insets.left - insets.right - 32)
  );
  const bubbleFrame = useMemo(
    () => ({
      anchorSize: mascotSize,
      bubbleWidth: tutorialBubbleWidth,
      viewportWidth: width,
      viewportHeight: height,
      insetTop: insets.top,
      insetBottom: insets.bottom,
      insetLeft: insets.left,
      insetRight: insets.right,
      edgeMargin
    }),
    [
      height,
      insets.bottom,
      insets.left,
      insets.right,
      insets.top,
      tutorialBubbleWidth,
      width
    ]
  );
  const tutorialBubblePosition = useMemo(
    () =>
      resolveBubblePosition({
        ...bubbleFrame,
        anchorX: displayPosition.x,
        anchorY: displayPosition.y,
        estimatedHeight: 176,
        target: tutorial.activeTargetRect
      }),
    [bubbleFrame, displayPosition.x, displayPosition.y, tutorial.activeTargetRect]
  );
  // A discovery hint has no measured element to point at, so it sits against
  // Bibi and relies on the same clamp to stay on screen.
  const discoveryBubblePosition = useMemo(
    () =>
      resolveBubblePosition({
        ...bubbleFrame,
        anchorX: displayPosition.x,
        anchorY: displayPosition.y,
        estimatedHeight: 148,
        target: null
      }),
    [bubbleFrame, displayPosition.x, displayPosition.y]
  );
  const rotation = Animated.add(
    Animated.add(
      openTilt.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }),
      dragTilt
    ),
    idleTilt
  ).interpolate({ inputRange: [-1, 1], outputRange: ["-8deg", "8deg"] });

  const animatePress = (toValue: number) => {
    Animated.spring(pressScale, {
      toValue,
      damping: 15,
      stiffness: 240,
      useNativeDriver: true
    }).start();
  };

  // Presence is resolved after every hook so the early return never changes the
  // hook order. On a dense analytical surface Bibi is absent until the tutorial
  // actually needs her, and arrives with the menu and greeting suppressed.
  const presence = bibiPresence(pathname);
  const ambient = allowsAmbientBibi(presence);
  if (!shouldRenderBibi(presence, Boolean(tutorial.activeTip))) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Animated.View
        {...(tutorial.activeTip || !ambient ? {} : panResponder.panHandlers)}
        style={[
          styles.anchor,
          {
            left: visiblePosition.x,
            top: visiblePosition.y,
            transform: [
              { translateX: guideTranslation.x },
              { translateY: guideTranslation.y },
              { translateX: dragTranslation.x },
              { translateY: dragTranslation.y }
            ]
          }
        ]}
      >
        {tutorial.activeTip ? (
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole="summary"
            style={[
              styles.tutorialBubble,
              {
                left: tutorialBubblePosition.left,
                top: tutorialBubblePosition.top,
                width: tutorialBubbleWidth
              }
            ]}
          >
            <Text style={styles.tutorialTitle}>
              {tutorial.activeTip.title}
            </Text>
            <Text style={styles.tutorialBody}>{tutorial.activeTip.body}</Text>
            <View style={styles.tutorialActions}>
              <Pressable
                accessibilityLabel="Jinx rehberini kapat"
                onPress={() => {
                  setOpenPath(null);
                  tutorial.setEnabled(false);
                }}
                style={({ pressed }) => [
                  styles.tutorialSecondary,
                  pressed && styles.menuItemPressed
                ]}
              >
                <Text style={styles.tutorialSecondaryText}>Rehberi kapat</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={
                  tutorial.hasNextOnPage
                    ? "Sonraki rehber adımı"
                    : "Bu rehber bilgisini tamamla"
                }
                onPress={() => {
                  setOpenPath(null);
                  tutorial.completeActiveTip();
                }}
                style={({ pressed }) => [
                  styles.tutorialPrimary,
                  pressed && styles.menuItemPressed
                ]}
              >
                <Text style={styles.tutorialPrimaryText}>
                  {tutorial.hasNextOnPage ? "Sonraki" : "Anladım"}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* A hint never shares the screen with a guide step or the menu: Bibi
            says one thing at a time, and the guide is the one the user asked
            for. `ambient` keeps it off the dense analytical surfaces. */}
        {discovery.activeHint && !tutorial.activeTip && !open && ambient ? (
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole="summary"
            style={[
              styles.tutorialBubble,
              {
                left: discoveryBubblePosition.left,
                top: discoveryBubblePosition.top,
                width: tutorialBubbleWidth
              }
            ]}
          >
            <Text style={styles.discoveryEyebrow}>BUNU BİLİYOR MUYDUN</Text>
            <Text style={styles.tutorialTitle}>
              {discovery.activeHint.title}
            </Text>
            <Text style={styles.tutorialBody}>{discovery.activeHint.body}</Text>
            <View style={styles.tutorialActions}>
              <Pressable
                accessibilityLabel="Jinx ipuçlarını sessize al"
                onPress={() => discovery.setPace("QUIET")}
                style={({ pressed }) => [
                  styles.tutorialSecondary,
                  pressed && styles.menuItemPressed
                ]}
              >
                <Text style={styles.tutorialSecondaryText}>Sessize al</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Bu ipucunu kapat"
                onPress={() => discovery.dismissActiveHint()}
                style={({ pressed }) => [
                  styles.tutorialPrimary,
                  pressed && styles.menuItemPressed
                ]}
              >
                <Text style={styles.tutorialPrimaryText}>Anladım</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {open && ambient ? (
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
                    size={iconSizes.control}
                  />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {showGreeting && !tutorial.activeTip && !discovery.activeHint && ambient ? (
          <View
            pointerEvents="none"
            style={[
              styles.greeting,
              menuRight ? styles.greetingRight : styles.greetingLeft
            ]}
          >
            <Text style={styles.greetingText}>Jinx hazır</Text>
          </View>
        ) : null}

        <Animated.View
          style={{
            transform: [
              { translateX: reduceMotion ? 0 : idleX },
              { translateY: reduceMotion ? 0 : idleY },
              { scale: pressScale },
              { rotate: reduceMotion ? "0deg" : rotation }
            ]
          }}
        >
          <Pressable
            accessibilityLabel={
              tutorial.activeTip ? "Jinx rehber anlatımı" : "Jinx hızlı menü"
            }
            accessibilityRole="button"
            disabled={Boolean(tutorial.activeTip) || !ambient}
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
              source={bibiFrames[open ? 2 : idleSuppressed ? 0 : blinkFrame]}
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
  greetingText: { color: "#102538", fontSize: 12, fontWeight: "900" },
  tutorialBubble: {
    position: "absolute",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.blue,
    backgroundColor: "rgba(244, 248, 252, 0.98)",
    padding: 14,
    ...shadows.card
  },
  discoveryEyebrow: {
    // Names the bubble as something the product volunteered, so it is never
    // mistaken for a guide step the user opened.
    color: "#6C8398",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 4
  },
  tutorialTitle: {
    color: "#102538",
    fontSize: 14,
    fontWeight: "900"
  },
  tutorialBody: {
    color: "#4D6577",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5
  },
  tutorialActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: 12
  },
  tutorialSecondary: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.round,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  tutorialSecondaryText: {
    color: "#617789",
    fontSize: 10,
    fontWeight: "900"
  },
  tutorialPrimary: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.blue,
    borderRadius: radii.round,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  tutorialPrimaryText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "900"
  },
  menu: { position: "absolute", gap: 6, minWidth: 150 },
  menuUp: { bottom: mascotSize + 8 },
  menuDown: { top: mascotSize + 8 },
  menuLeft: { left: 0 },
  menuRight: { right: 0 },
  menuItem: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.round,
    backgroundColor: colors.backgroundElevated,
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
