import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import {
  AppState,
  Animated,
  Easing,
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
import { mobileApi } from "@/src/api";
import { superKpisQuery } from "@/src/api/queries";
import { useSuperStarFilter } from "@/src/preferences/SuperStarFilterProvider";
import { colors, iconSizes, radii, semantic, shadows } from "@/src/theme/theme";
import { useTutorial } from "@/src/tutorial/TutorialProvider";
import {
  bibiIdleDurations,
  jinxSleepDelayMs,
  nextIdleDelayMs,
  pickIdleBehavior,
  resolveMascotMotionState,
  type BibiIdleBehavior
} from "./idle-behavior";
import {
  deriveJinxDailyMood,
  jinxMoodSignature,
  selectJinxMoodQuip,
  type JinxMoodQuip
} from "./jinx-mood";
import { subscribeMascotInteraction } from "./interaction-activity";
import { acceptRemoteQuip, jinxQuipRequest } from "./jinx-quip-remote";
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
const mascotSize = 68;
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
  const { filter: superStarFilter } = useSuperStarFilter();
  const superKpis = useQuery(superKpisQuery);
  const { pageActions } = useMascotActions();
  const tutorial = useTutorial();
  const discovery = useDiscovery();
  const presence = bibiPresence(pathname);
  const ambient = allowsAmbientBibi(presence);
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
  const [sleeping, setSleeping] = useState(false);
  const sleepingRef = useRef(false);
  const [activityVersion, setActivityVersion] = useState(0);
  const [moodBubble, setMoodBubble] = useState<JinxMoodQuip | null>(null);
  const [moodReacting, setMoodReacting] = useState(false);
  const [presentedMoodSignature, setPresentedMoodSignature] = useState<
    string | null
  >(null);
  const previousMoodQuip = useRef<number | null>(null);
  const [appActive, setAppActive] = useState(
    () => AppState.currentState === "active"
  );
  const [breathPhase] = useState(() => new Animated.Value(0));
  const [sleepPhase] = useState(() => new Animated.Value(0));
  const [idleX] = useState(() => new Animated.Value(0));
  const [idleY] = useState(() => new Animated.Value(0));
  const [idleTilt] = useState(() => new Animated.Value(0));
  const [pressScale] = useState(() => new Animated.Value(1));
  const [openTilt] = useState(() => new Animated.Value(0));
  const [wakeScale] = useState(() => new Animated.Value(1));
  const [wakeTilt] = useState(() => new Animated.Value(0));
  const [wakeY] = useState(() => new Animated.Value(0));
  const [moodPhase] = useState(() => new Animated.Value(1));
  const [dragTilt] = useState(() => new Animated.Value(0));
  const [dragTranslation] = useState(
    () => new Animated.ValueXY({ x: 0, y: 0 })
  );
  const [guideTranslation] = useState(
    () => new Animated.ValueXY({ x: 0, y: 0 })
  );
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
  const dailyMood = useMemo(
    () =>
      deriveJinxDailyMood({
        ready: superKpis.isSuccess,
        metricDate: superKpis.data?.metricDate,
        filter: superStarFilter,
        bucket: superKpis.data?.buckets[superStarFilter]
      }),
    [superKpis.data, superKpis.isSuccess, superStarFilter]
  );
  const dailyMoodSignature = jinxMoodSignature(dailyMood);
  // Prefetched wording, keyed by the mood it was generated for. The bubble
  // never waits on it: if it has not arrived (or was refused) by the time the
  // bubble fires, the deterministic repertoire is used instead.
  const remoteQuip = useRef<{ signature: string; body: string } | null>(null);
  const moodPending =
    dailyMoodSignature !== null &&
    dailyMoodSignature !== presentedMoodSignature;
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
  useEffect(
    () =>
      subscribeMascotInteraction(() => {
        const wasSleeping = sleepingRef.current;
        sleepingRef.current = false;
        setSleeping(false);
        setActivityVersion((current) => current + 1);
        if (!wasSleeping || reduceMotion) {
          return;
        }
        wakeScale.stopAnimation();
        wakeTilt.stopAnimation();
        wakeY.stopAnimation();
        wakeScale.setValue(0.78);
        wakeTilt.setValue(-1);
        wakeY.setValue(4);
        Animated.parallel([
          Animated.spring(wakeScale, {
            toValue: 1,
            damping: 9,
            stiffness: 260,
            mass: 0.65,
            useNativeDriver: true
          }),
          Animated.spring(wakeTilt, {
            toValue: 0,
            damping: 8,
            stiffness: 220,
            useNativeDriver: true
          }),
          Animated.spring(wakeY, {
            toValue: 0,
            damping: 9,
            stiffness: 240,
            useNativeDriver: true
          })
        ]).start();
      }),
    [reduceMotion, wakeScale, wakeTilt, wakeY]
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
  // than as something Jinx noticed, and it lands while the user is still
  // deciding where to look.
  useEffect(() => {
    if (moodPending || moodBubble) {
      return undefined;
    }
    const timer = setTimeout(
      () =>
        considerDiscovery(pathname, {
          presence: bibiPresence(pathname),
          tutorialActive: Boolean(tutorial.activeTip)
        }),
      discoverySettleMs
    );
    return () => clearTimeout(timer);
  }, [considerDiscovery, moodBubble, moodPending, pathname, tutorial.activeTip]);

  // One short reaction when a hint arrives. It is separate from Jinx's single
  // restrained breathing phase and never becomes another repeating loop.
  useEffect(() => {
    if (!discovery.activeHint || reduceMotion || !appActive || !ambient) {
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
  }, [ambient, appActive, discovery.activeHint, idleY, reduceMotion]);

  const displayPosition = tutorial.activeTip
    ? tutorialPosition
    : visiblePosition;
  const open = !tutorial.activeTip && openPath === pathname;
  const guideActive = Boolean(tutorial.activeTip || discovery.activeHint);
  const motionState = resolveMascotMotionState({
    active: appActive,
    ambient,
    reduceMotion,
    dragging,
    menuOpen: open,
    guideActive,
    sleeping,
    reactionActive: moodReacting
  });
  // Idle expression is suppressed the moment another interaction owns Jinx, so
  // an interrupted blink can never freeze a half-closed frame on screen.
  const idleSuppressed = motionState !== "AMBIENT";

  useEffect(() => {
    if (
      !appActive ||
      !ambient ||
      dragging ||
      open ||
      guideActive ||
      moodReacting ||
      sleeping
    ) {
      return undefined;
    }
    const timer = setTimeout(() => {
      sleepingRef.current = true;
      setSleeping(true);
      setMoodBubble(null);
    }, jinxSleepDelayMs);
    return () => clearTimeout(timer);
  }, [
    activityVersion,
    ambient,
    appActive,
    dragging,
    guideActive,
    moodReacting,
    open,
    pathname,
    sleeping
  ]);

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

  // Wording is fetched once per mood boundary, never per render or refetch, and
  // never while Jinx is asleep. A failure here is silent by design: the bubble
  // simply keeps the deterministic line.
  useEffect(() => {
    if (!dailyMoodSignature || sleeping || !appActive) {
      return undefined;
    }
    if (remoteQuip.current?.signature === dailyMoodSignature) {
      return undefined;
    }
    const request = jinxQuipRequest(dailyMood);
    if (!request) {
      return undefined;
    }
    const controller = new AbortController();
    let cancelled = false;
    mobileApi
      .getJinxQuip(request, controller.signal)
      .then((response) => {
        if (cancelled || !response.enabled) {
          return;
        }
        const body = acceptRemoteQuip(response.body, dailyMood);
        if (body) {
          remoteQuip.current = { signature: dailyMoodSignature, body };
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [appActive, dailyMood, dailyMoodSignature, sleeping]);

  // A full mood sketch runs only at a day/filter/sign boundary. Profit changes
  // inside the same sign update the factual data but do not replay the show.
  useEffect(() => {
    if (
      !dailyMoodSignature ||
      dailyMoodSignature === presentedMoodSignature ||
      showGreeting ||
      sleeping ||
      dragging ||
      open ||
      guideActive ||
      !appActive ||
      !ambient
    ) {
      return undefined;
    }
    const timer = setTimeout(() => {
      const quip = selectJinxMoodQuip(
        dailyMood,
        previousMoodQuip.current
      );
      if (!quip) {
        return;
      }
      const remote =
        remoteQuip.current?.signature === dailyMoodSignature
          ? remoteQuip.current.body
          : null;
      setPresentedMoodSignature(dailyMoodSignature);
      previousMoodQuip.current = quip.index;
      setMoodBubble(remote ? { ...quip, body: remote } : quip);
      setMoodReacting(true);
      setActivityVersion((current) => current + 1);
      if (reduceMotion) {
        setMoodReacting(false);
        return;
      }
      moodPhase.stopAnimation();
      moodPhase.setValue(0);
      Animated.sequence([
        Animated.timing(moodPhase, {
          toValue: 0.18,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.spring(moodPhase, {
          toValue: 0.62,
          damping: 7,
          stiffness: 240,
          mass: 0.65,
          useNativeDriver: true
        }),
        Animated.timing(moodPhase, {
          toValue: 0.82,
          duration: 620,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.spring(moodPhase, {
          toValue: 1,
          damping: 12,
          stiffness: 170,
          mass: 0.75,
          useNativeDriver: true
        })
      ]).start(() => setMoodReacting(false));
    }, 360);
    return () => clearTimeout(timer);
  }, [
    ambient,
    appActive,
    dailyMood,
    dailyMoodSignature,
    dragging,
    guideActive,
    moodPhase,
    open,
    presentedMoodSignature,
    reduceMotion,
    showGreeting,
    sleeping
  ]);

  useEffect(() => {
    if (!moodBubble) {
      return undefined;
    }
    const timer = setTimeout(() => setMoodBubble(null), 5200);
    return () => clearTimeout(timer);
  }, [moodBubble]);

  // Jinx always carries one restrained breath while ambient. The same phase
  // drives position, scale, weight shift and the teal spark, so several loops
  // never drift apart or compete for the character.
  useEffect(() => {
    breathPhase.stopAnimation();
    breathPhase.setValue(0);
    if (motionState !== "AMBIENT") {
      return undefined;
    }
    const breath = Animated.loop(
      Animated.sequence([
        Animated.timing(breathPhase, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(breathPhase, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    breath.start();
    return () => {
      breath.stop();
      breathPhase.setValue(0);
    };
  }, [breathPhase, motionState]);

  // Sleeping is anchored and quiet. Only a tiny slow scale change remains,
  // enough to read as breathing without turning sleep into another hover loop.
  useEffect(() => {
    sleepPhase.stopAnimation();
    sleepPhase.setValue(0);
    if (motionState !== "SLEEPING" || reduceMotion) {
      return undefined;
    }
    const sleepBreath = Animated.loop(
      Animated.sequence([
        Animated.timing(sleepPhase, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(sleepPhase, {
          toValue: 0,
          duration: 3400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    sleepBreath.start();
    return () => {
      sleepBreath.stop();
      sleepPhase.setValue(0);
    };
  }, [motionState, reduceMotion, sleepPhase]);

  // A short micro-expression rides above the breath after an irregular quiet
  // window, never repeats the previous one, and yields to every interaction.
  useEffect(() => {
    idleX.setValue(0);
    idleY.setValue(0);
    idleTilt.setValue(0);
    if (motionState !== "AMBIENT") {
      return undefined;
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
    idleTilt,
    idleX,
    idleY,
    motionState
  ]);

  useEffect(() => {
    if (reduceMotion) {
      openTilt.setValue(0);
      return;
    }
    Animated.spring(openTilt, {
      toValue: open ? 1 : 0,
      damping: 13,
      stiffness: 150,
      mass: 0.7,
      useNativeDriver: true
    }).start();
  }, [open, openTilt, reduceMotion]);

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
          if (!reduceMotion) {
            pressScale.stopAnimation();
            Animated.spring(pressScale, {
              toValue: 1.035,
              damping: 13,
              stiffness: 260,
              mass: 0.65,
              useNativeDriver: true
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
          Animated.spring(dragTilt, {
            toValue: 0,
            damping: 14,
            stiffness: 180,
            useNativeDriver: true
          }).start();
          Animated.spring(pressScale, {
            toValue: 1,
            damping: 10,
            stiffness: 210,
            mass: 0.65,
            useNativeDriver: true
          }).start();
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
  const moodIcon: IconName | null =
    dailyMood.kind === "POSITIVE"
      ? "crown"
      : dailyMood.kind === "NEGATIVE"
        ? "wallet-outline"
        : dailyMood.kind === "EVEN"
          ? "scale-balance"
          : dailyMood.kind === "EMPTY"
            ? "clock-outline"
            : null;
  const moodColor =
    dailyMood.kind === "POSITIVE"
      ? colors.gold
      : dailyMood.kind === "NEGATIVE"
        ? semantic.negative
        : colors.bronze;
  const breathTilt = breathPhase.interpolate({
    inputRange: [0, 1],
    outputRange: [-0.07, 0.09]
  });
  const breathY = breathPhase.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, -1.8]
  });
  const breathScale = breathPhase.interpolate({
    inputRange: [0, 1],
    outputRange: [0.995, 1.018]
  });
  const sparkleOpacity = breathPhase.interpolate({
    inputRange: [0, 1],
    outputRange: [0.42, 0.96]
  });
  const sparkleScale = breathPhase.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1.18]
  });
  const sleepY = sleepPhase.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35]
  });
  const sleepScale = sleepPhase.interpolate({
    inputRange: [0, 1],
    outputRange: [0.996, 1.006]
  });
  const moodY = moodPhase.interpolate({
    inputRange: [0, 0.18, 0.62, 1],
    outputRange:
      dailyMood.kind === "NEGATIVE"
        ? [0, -1, 3.5, 0]
        : [0, 2.5, -7, 0]
  });
  const moodScale = moodPhase.interpolate({
    inputRange: [0, 0.18, 0.62, 1],
    outputRange: [0.86, 0.8, 1.14, 1]
  });
  const moodTilt = moodPhase.interpolate({
    inputRange: [0, 0.18, 0.62, 1],
    outputRange:
      dailyMood.kind === "NEGATIVE"
        ? [0, 0.45, -0.35, -0.12]
        : [0, -0.45, 0.35, 0]
  });
  const moodAccessoryY = moodPhase.interpolate({
    inputRange: [0, 0.18, 0.62, 1],
    outputRange: [8, 5, -4, 0]
  });
  const moodAccessoryScale = moodPhase.interpolate({
    inputRange: [0, 0.18, 0.62, 1],
    outputRange: [0.2, 0.45, 1.24, 1]
  });
  const moodCoinX = moodPhase.interpolate({
    inputRange: [0, 0.18, 0.62, 1],
    outputRange: [0, -3, 19, 7]
  });
  const moodCoinY = moodPhase.interpolate({
    inputRange: [0, 0.18, 0.62, 1],
    outputRange:
      dailyMood.kind === "NEGATIVE"
        ? [0, -8, 24, 18]
        : [0, -7, -24, -5]
  });
  const moodCoinRotation = moodPhase.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", dailyMood.kind === "NEGATIVE" ? "260deg" : "520deg"]
  });
  const activeMoodTilt = motionState === "REACTING" ? moodTilt : 0;
  const rotation = Animated.add(
    Animated.add(
      Animated.add(
        Animated.add(
          openTilt.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }),
          dragTilt
        ),
        Animated.add(idleTilt, breathTilt)
      ),
      wakeTilt
    ),
    activeMoodTilt
  ).interpolate({ inputRange: [-1, 1], outputRange: ["-8deg", "8deg"] });

  const animatePress = (toValue: number) => {
    Animated.spring(pressScale, {
      toValue,
      damping: 15,
      stiffness: 240,
      useNativeDriver: true
    }).start();
  };

  // Presence is acted on after every hook so the early return never changes the
  // hook order. On a dense analytical surface Jinx is absent until the tutorial
  // actually needs her, and arrives with the menu and greeting suppressed.
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

        {moodBubble &&
        !discovery.activeHint &&
        !tutorial.activeTip &&
        !open &&
        ambient ? (
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole="summary"
            pointerEvents="none"
            style={[
              styles.tutorialBubble,
              styles.moodBubble,
              {
                borderColor: moodColor,
                left: discoveryBubblePosition.left,
                top: discoveryBubblePosition.top,
                width: tutorialBubbleWidth
              }
            ]}
          >
            <Text style={[styles.moodEyebrow, { color: moodColor }]}>GÜNLÜK SUPER</Text>
            <Text style={styles.tutorialTitle}>{moodBubble.title}</Text>
            <Text style={styles.tutorialBody}>{moodBubble.body}</Text>
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

        <Animated.View
          style={{
            transform: [
              { translateX: reduceMotion ? 0 : idleX },
              {
                translateY: reduceMotion
                  ? 0
                  : motionState === "SLEEPING"
                    ? sleepY
                    : Animated.add(
                        Animated.add(idleY, breathY),
                        Animated.add(
                          wakeY,
                          motionState === "REACTING" ? moodY : 0
                        )
                      )
              },
              {
                scale:
                  reduceMotion
                    ? 1
                    : motionState === "SLEEPING"
                      ? sleepScale
                      : breathScale
              },
              { scale: reduceMotion ? 1 : wakeScale },
              {
                scale:
                  reduceMotion || motionState !== "REACTING" ? 1 : moodScale
              },
              { scale: pressScale },
              { rotate: reduceMotion ? "0deg" : rotation }
            ]
          }}
        >
          <Pressable
            accessibilityLabel={
              tutorial.activeTip
                ? "Jinx rehber anlatımı"
                : sleeping
                  ? "Jinx uyuyor; dokununca uyanır ve hızlı menüyü açar"
                  : `Jinx hızlı menü, günlük Super ruh hâli ${dailyMood.kind.toLocaleLowerCase("tr-TR")}`
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
            <Image
              resizeMode="contain"
              source={
                bibiFrames[
                  sleeping
                    ? 2
                    : open
                      ? 2
                      : motionState === "REACTING" && dailyMood.kind === "NEGATIVE"
                        ? 1
                        : idleSuppressed
                          ? 0
                          : blinkFrame
                ]
              }
              style={styles.bibi}
            />
            {moodIcon ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.moodAccessory,
                  dailyMood.kind === "NEGATIVE" && styles.moodAccessoryLow,
                  {
                    opacity: sleeping ? 0 : 1,
                    transform: [
                      {
                        translateY:
                          reduceMotion || motionState !== "REACTING"
                            ? 0
                            : moodAccessoryY
                      },
                      {
                        scale:
                          reduceMotion || motionState !== "REACTING"
                            ? 1
                            : moodAccessoryScale
                      }
                    ]
                  }
                ]}
              >
                <MaterialCommunityIcons
                  color={moodColor}
                  name={moodIcon}
                  size={18}
                />
              </Animated.View>
            ) : null}
            {motionState === "REACTING" &&
            (dailyMood.kind === "POSITIVE" || dailyMood.kind === "NEGATIVE") ? (
              <Animated.Text
                pointerEvents="none"
                style={[
                  styles.moodCoin,
                  {
                    color: colors.gold,
                    transform: [
                      { translateX: moodCoinX },
                      { translateY: moodCoinY },
                      { rotate: moodCoinRotation }
                    ]
                  }
                ]}
              >
                ₺
              </Animated.Text>
            ) : null}
            {sleeping ? (
              <Animated.Text
                pointerEvents="none"
                style={[
                  styles.sleepMark,
                  { opacity: reduceMotion ? 0.75 : sleepPhase }
                ]}
              >
                zZ
              </Animated.Text>
            ) : null}
            <Animated.Text
              style={[
                styles.sparkle,
                {
                  opacity: sleeping
                    ? 0
                    : reduceMotion
                      ? dailyMood.kind === "NEGATIVE" ? 0.28 : 0.7
                      : sparkleOpacity,
                  transform: [
                    { scale: reduceMotion ? 1 : sparkleScale }
                  ]
                }
              ]}
            >
              ✦
            </Animated.Text>
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
  bibi: { width: mascotSize, height: mascotSize },
  sparkle: {
    position: "absolute",
    right: -1,
    top: -5,
    color: "#56C8FF",
    fontSize: 12,
    fontWeight: "900"
  },
  moodAccessory: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: -2,
    top: -7
  },
  moodAccessoryLow: {
    bottom: -2,
    right: -3,
    top: undefined
  },
  moodCoin: {
    fontSize: 15,
    fontWeight: "900",
    left: 25,
    position: "absolute",
    top: 19
  },
  sleepMark: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "900",
    position: "absolute",
    right: -5,
    top: -8
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
  moodBubble: {
    minHeight: 92
  },
  moodEyebrow: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 4
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
