import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import { AppState, Animated, PanResponder, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLiveMatchCount } from "@/src/api/use-live-match-count";
import { colors, iconSizes, numericFont, radii, semantic, shadows, themeMode, typeScale, textFont } from "@/src/theme/theme";
import { useTutorial } from "@/src/tutorial/TutorialProvider";
import { jinxSleepDelayMs } from "./idle-behavior";
import { subscribeMascotInteraction } from "./interaction-activity";
import { allowsAmbientBibi, bibiPresence } from "./bibi-presence";
import { resolveBubblePosition } from "./bubble-position";
import { useDiscovery } from "./DiscoveryProvider";
import { useJinxMotion } from "./use-jinx-motion";
import { useJinxDailyQuip } from "./use-jinx-daily-quip";
import { JinxAnimator } from "./JinxAnimator";

/** How long the daily-result bubble stays before Jinx tidies it away. */
const moodBubbleMs = 7000;

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type Position = { x: number; y: number };
type MenuItem = {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
  /** The tab this item opens; marks the item when that tab is showing. */
  path?: string;
  badge?: number;
  /** The daily comment wears the gold of its bubble. */
  gold?: boolean;
};

const storageKey = "btb-mobile-next-bibi-position-v3";
const mascotSize = 68;
/** Quiet moment after arriving on a surface before discovery may speak. */
const discoverySettleMs = 1600;
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
  const tutorial = useTutorial();
  const discovery = useDiscovery();
  const presence = bibiPresence(pathname);
  const { state: character, dispatch, finish, preferences, reduceMotion } = useJinxMotion({ matchKey: "navigation:" + pathname, revision: "navigation" }, true);
  const ambient = allowsAmbientBibi(presence) && !preferences.hidden && !preferences.denseSurface;
  const considerDiscovery = discovery.consider;
  const dismissDiscovery = discovery.dismissActiveHint;
  useEffect(() => dismissDiscovery(), [dismissDiscovery, pathname]);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [showGreeting, setShowGreeting] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [tutorialHeight, setTutorialHeight] = useState(176);
  const [discoveryHeight, setDiscoveryHeight] = useState(148);
  const sleepingRef = useRef(false);
  const [activityVersion, setActivityVersion] = useState(0);
  const [appActive, setAppActive] = useState(() => AppState.currentState === "active");
  const [pressScale] = useState(() => new Animated.Value(1));
  const [dragTilt] = useState(() => new Animated.Value(0));
  const [dragTranslation] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));
  const [guideTranslation] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));
  // The daily comment reads the RB1 seven-day report in neutral words (owner
  // decision 2026-10-21); there is no mood and no reaction show any more.
  const { signature: dailyMoodSignature, quip: dailyQuip } = useJinxDailyQuip();
  const liveCount = useLiveMatchCount();
  const [moodBubble, setMoodBubble] = useState(false);
  const [presentedMoodSignature, setPresentedMoodSignature] = useState<string | null>(null);
  const moodPending = dailyMoodSignature !== null && dailyMoodSignature !== presentedMoodSignature;
  const defaultPosition = useMemo(() => ({ x: Math.max(edgeMargin + insets.left, width - insets.right - mascotSize - edgeMargin), y: edgeMargin + insets.top }), [insets.left, insets.right, insets.top, width]);
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
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setAppActive(state === "active");
    });
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    sleepingRef.current = sleeping;
  }, [sleeping]);
  useEffect(() => {
    if (appActive && !reduceMotion && !sleeping) return;
    pressScale.stopAnimation();
    dragTilt.stopAnimation();
    pressScale.setValue(1);
    dragTilt.setValue(0);
  }, [appActive, dragTilt, pressScale, reduceMotion, sleeping]);
  useEffect(() => subscribeMascotInteraction(() => {
    const wasSleeping = sleepingRef.current;
    sleepingRef.current = false;
    setSleeping(false);
    setActivityVersion(current => current + 1);
    if (wasSleeping) dispatch({ type: "scene", scene: "greeting" });
  }), [dispatch]);
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
  useEffect(() => {
    // The daily comment speaks first; a discovery hint never talks over it.
    if (!ambient || !appActive || moodPending || moodBubble) return;
    const timer = setTimeout(() => considerDiscovery(pathname, { presence, tutorialActive: Boolean(tutorial.activeTip) }), discoverySettleMs);
    return () => clearTimeout(timer);
  }, [ambient, appActive, considerDiscovery, moodBubble, moodPending, pathname, presence, tutorial.activeTip]);

  const displayPosition = tutorial.activeTip ? tutorialPosition : visiblePosition;
  const open = !tutorial.activeTip && openPath === pathname;
  const guideActive = Boolean(tutorial.activeTip || discovery.activeHint);
  const interactionBlocked = !ambient || dragging || open || guideActive || sleeping;
  useEffect(() => {
    dispatch({ type: "interaction", blocked: interactionBlocked });
  }, [dispatch, interactionBlocked]);
  useEffect(() => {
    if (!ambient || !appActive || dragging || open || guideActive || sleeping || moodBubble) return;
    const timer = setTimeout(() => { sleepingRef.current = true; setSleeping(true); }, jinxSleepDelayMs);
    return () => clearTimeout(timer);
  }, [activityVersion, ambient, appActive, dragging, guideActive, moodBubble, open, pathname, sleeping]);
  // The Overview already shows daily figures inline. Automatic changes stay
  // quiet so the floating comment cannot cover filters; open it from the menu.
  useEffect(() => {
    if (!dailyMoodSignature || !dailyQuip || dailyMoodSignature === presentedMoodSignature || showGreeting || sleeping
      || dragging || open || guideActive || !appActive || !ambient) return;
    const timer = setTimeout(() => {
      setPresentedMoodSignature(dailyMoodSignature);
      setActivityVersion(current => current + 1);
    }, 360);
    return () => clearTimeout(timer);
  }, [ambient, appActive, dailyMoodSignature, dailyQuip, dragging, guideActive, open, presentedMoodSignature, showGreeting, sleeping]);
  useEffect(() => {
    if (!moodBubble) return;
    const timer = setTimeout(() => setMoodBubble(false), moodBubbleMs);
    return () => clearTimeout(timer);
  }, [moodBubble]);
  useEffect(() => {
    if (showGreeting && ambient && appActive && preferences.ready) dispatch({ type: "scene", scene: "greeting" });
  }, [ambient, appActive, dispatch, preferences.ready, showGreeting]);

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
    const next = {
      x: displayPosition.x - visiblePosition.x,
      y: displayPosition.y - visiblePosition.y
    };
    guideTranslation.stopAnimation();
    if (reduceMotion || !appActive || sleeping) {
      guideTranslation.setValue(next);
      return;
    }
    const animation = Animated.spring(guideTranslation, {
      toValue: next,
      damping: 17,
      stiffness: 120,
      mass: 0.8,
      useNativeDriver: Platform.OS !== "web"
    });
    animation.start();
    return () => animation.stop();
  }, [
    appActive,
    displayPosition.x,
    displayPosition.y,
    guideTranslation,
    reduceMotion,
    sleeping,
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
          if (!reduceMotion) {
            pressScale.stopAnimation();
            Animated.spring(pressScale, {
              toValue: 1.035,
              damping: 13,
              stiffness: 260,
              mass: 0.65,
              useNativeDriver: Platform.OS !== "web"
            }).start();
          }
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
          if (reduceMotion) { dragTilt.setValue(0); pressScale.setValue(1); }
          else Animated.parallel([
            Animated.spring(dragTilt, { toValue: 0, damping: 14, stiffness: 180, useNativeDriver: Platform.OS !== "web" }),
            Animated.spring(pressScale, { toValue: 1, damping: 10, stiffness: 210, mass: .65, useNativeDriver: Platform.OS !== "web" })
          ]).start();
        },
        onPanResponderTerminate: () => {
          setDragging(false);
          dragTranslation.setValue({ x: 0, y: 0 });
          dragTilt.setValue(0);
          pressScale.setValue(1);
        }
      }),
    [
      bounds,
      dragTilt,
      dragTranslation,
      pressScale,
      reduceMotion,
      setOpenPath,
      visiblePosition
    ]
  );

  const menuItems = useMemo<MenuItem[]>(
    () => [
      { key: "home", icon: "view-grid-outline", label: "Özet", path: "/", onPress: () => router.replace("/") },
      { key: "live", icon: "radar", label: "Canlı", path: "/live", ...(liveCount === null ? {} : { badge: liveCount }), onPress: () => router.replace("/live") },
      { key: "super", icon: "star-outline", label: "Super", path: "/super", onPress: () => router.replace("/super") },
      { key: "toto", icon: "ticket-outline", label: "Toto", path: "/toto", onPress: () => router.replace("/toto") },
      // Replays the daily comment on demand; the presentation effect does the rest.
      { key: "daily", icon: "message-text-outline", label: "Günlük yorum", gold: true, onPress: () => setMoodBubble(true) }
    ],
    [liveCount, router]
  );

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
        estimatedHeight: tutorialHeight,
        target: tutorial.activeTargetRect
      }),
    [bubbleFrame, displayPosition.x, displayPosition.y, tutorial.activeTargetRect, tutorialHeight]
  );
  // A discovery hint has no measured element to point at, so it sits against
  // Bibi and relies on the same clamp to stay on screen.
  const discoveryBubblePosition = useMemo(
    () =>
      resolveBubblePosition({
        ...bubbleFrame,
        anchorX: displayPosition.x,
        anchorY: displayPosition.y,
        estimatedHeight: discoveryHeight,
        target: null
      }),
    [bubbleFrame, displayPosition.x, displayPosition.y, discoveryHeight]
  );
  const animatePress = (toValue: number) => {
    pressScale.stopAnimation();
    if (reduceMotion) { pressScale.setValue(1); return; }
    Animated.spring(pressScale, { toValue, damping: 15, stiffness: 240, useNativeDriver: Platform.OS !== "web" }).start();
  };
  // Render current interaction ownership immediately, before reducer effects
  // settle. Drag/guide retain their explicit scene; the menu freezes idle.
  const characterState = { ...character, blocked: interactionBlocked,
    scene: dragging ? "drag" as const : guideActive ? "guide" as const : character.scene };

  // Presence is acted on after every hook so the early return never changes the
  // hook order. On a dense analytical surface Jinx is absent until the tutorial
  // actually needs her, and arrives with the menu and greeting suppressed.
  if (!preferences.ready || (!ambient && !tutorial.activeTip)) {
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
            onLayout={event => { const measured = event.nativeEvent.layout.height; if (measured > 0) setTutorialHeight(previous => Math.abs(previous - measured) > 1 ? measured : previous); }}
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
                accessibilityRole="button"
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
                accessibilityRole="button"
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
            onLayout={event => { const measured = event.nativeEvent.layout.height; if (measured > 0) setDiscoveryHeight(previous => Math.abs(previous - measured) > 1 ? measured : previous); }}
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
                accessibilityRole="button"
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
                accessibilityRole="button"
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

        {moodBubble && dailyQuip && !discovery.activeHint && !tutorial.activeTip && !open && ambient ? (
          <Pressable
            accessibilityLiveRegion="polite"
            accessibilityRole="button"
            accessibilityLabel={`Jinx günlük yorum: ${dailyQuip.title}. ${dailyQuip.body} Kapatmak için dokun.`}
            onPress={() => setMoodBubble(false)}
            style={[
              styles.tutorialBubble,
              styles.moodBubble,
              {
                left: discoveryBubblePosition.left,
                top: discoveryBubblePosition.top,
                width: tutorialBubbleWidth
              }
            ]}
          >
            <View style={styles.moodHead}>
              <Text style={styles.moodEyebrow}>BTB · BUGÜN</Text>
              <MaterialCommunityIcons color={colors.textMuted} name="close" size={iconSizes.small} />
            </View>
            <Text style={styles.tutorialTitle}>{dailyQuip.title}</Text>
            <Text style={styles.moodBody}>{dailyQuip.body}</Text>
          </Pressable>
        ) : null}

        {open && ambient ? (
          <View
            style={[
              styles.menu,
              menuDown ? styles.menuDown : styles.menuUp,
              menuRight ? styles.menuRight : styles.menuLeft
            ]}
          >
            {menuItems.map((item) => {
              const current = item.path !== undefined && pathname === item.path;
              const ink = item.gold ? colors.gold : current ? colors.actionFill : colors.text;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={item.badge ? `${item.label}, ${item.badge} canlı maç` : item.label}
                  accessibilityState={{ selected: current }}
                  key={item.key}
                  onPress={() => {
                    setOpenPath(null);
                    item.onPress();
                  }}
                  style={({ pressed }) => [
                    styles.menuItem,
                    menuRight && styles.menuItemRight,
                    current && styles.menuItemCurrent,
                    item.gold && styles.menuItemGold,
                    pressed && styles.menuItemPressed
                  ]}
                >
                  <MaterialCommunityIcons color={ink} name={item.icon} size={iconSizes.control} />
                  <Text style={[styles.menuLabel, { color: ink }]}>{item.label}</Text>
                  {item.badge ? (
                    <View style={styles.menuBadge}>
                      <Text style={styles.menuBadgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {showGreeting &&
        !tutorial.activeTip &&
        !discovery.activeHint &&
        !moodBubble &&
        ambient ? (
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

        <Animated.View style={{ transform: [
          { scale: reduceMotion ? 1 : pressScale },
          { rotate: reduceMotion ? "0deg" : dragTilt.interpolate({ inputRange: [-1, 1], outputRange: ["-8deg", "8deg"] }) }] }}>
          <Pressable accessibilityRole="button"
            accessibilityLabel={tutorial.activeTip ? "Jinx rehber anlatımı" : sleeping ? "Jinx uyuyor; dokununca uyanır ve hızlı menüyü açar" : "Jinx hızlı menü"}
            accessibilityState={{ expanded: open }} aria-expanded={open}
            disabled={Boolean(tutorial.activeTip) || !ambient}
            onPress={() => { sleepingRef.current = false; setSleeping(false); setActivityVersion(current => current + 1); setOpenPath(open ? null : pathname); if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => undefined); }}
            onPressIn={() => animatePress(0.92)} onPressOut={() => animatePress(1)} style={styles.toggle}>
            <JinxAnimator candidate="orb" compact size={mascotSize} dark={themeMode === "dark"} asleep={sleeping}
              state={characterState} mode={preferences.mode} forceReducedMotion={reduceMotion} onComplete={finish} />
            {sleeping ? <Text pointerEvents="none" style={styles.sleepMark}>zZ</Text> : null}
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
  sleepMark: {
    ...typeScale.meta,
    color: colors.blue,
    position: "absolute",
    right: -5,
    top: -8
  },
  moodBubble: { minHeight: 92 },
  moodHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  moodEyebrow: { ...typeScale.eyebrow, color: colors.gold },
  moodBody: { ...textFont("400"), color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: 4 },
  greeting: {
    position: "absolute",
    top: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadows.card
  },
  greetingLeft: { left: mascotSize + 8 },
  greetingRight: { right: mascotSize + 8 },
  greetingText: { ...textFont("800"), color: colors.text, fontSize: 12 },
  // The v40 board's dark bubble (owner decision 2026-10-21), in both themes'
  // own surface tokens so it always reads as part of the app.
  tutorialBubble: {
    position: "absolute",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...shadows.card
  },
  discoveryEyebrow: {
    // Names the bubble as something the product volunteered, so it is never
    // mistaken for a guide step the user opened.
    ...typeScale.eyebrow,
    color: colors.textMuted,
    marginBottom: 4
  },
  tutorialTitle: {
    ...textFont("700"),
    color: colors.text,
    fontSize: 15,
    lineHeight: 20
  },
  tutorialBody: {
    ...textFont("400"),
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4
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
    color: colors.textMuted,
    ...typeScale.meta,
    fontWeight: "700"
  },
  tutorialPrimary: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.actionFill,
    borderRadius: radii.round,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  tutorialPrimaryText: {
    color: colors.onAction,
    ...typeScale.meta,
    fontWeight: "700"
  },
  menu: { position: "absolute", gap: 8, minWidth: 150 },
  menuUp: { bottom: mascotSize + 8 },
  menuDown: { top: mascotSize + 8 },
  menuLeft: { left: 0, alignItems: "flex-start" },
  menuRight: { right: 0, alignItems: "flex-end" },
  menuItem: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 14,
    paddingRight: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.round,
    backgroundColor: colors.surface,
    ...shadows.card
  },
  menuItemRight: { flexDirection: "row" },
  menuItemCurrent: { backgroundColor: colors.greenSoft, borderColor: colors.actionFill },
  menuItemGold: { backgroundColor: colors.goldSoft, borderColor: colors.gold },
  menuItemPressed: { backgroundColor: colors.surfaceStrong },
  menuLabel: { ...textFont("700"), color: colors.text, fontSize: 15 },
  menuBadge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: "center", justifyContent: "center", backgroundColor: semantic.live },
  menuBadgeText: { ...numericFont("800"), color: colors.background, fontSize: 14, lineHeight: 16 }
});
