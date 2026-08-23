import {
  useCallback,
  useMemo,
  type PropsWithChildren,
  type ReactNode,
  type RefObject
} from "react";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { adjacentMainTab, type MainTabRoute } from "@/src/navigation/main-tabs";
import {
  edgeSwipe,
  shouldActivateEdgeSwipe,
  shouldActivateTabSwipe,
  shouldCommitEdgeSwipe,
  shouldCommitTabSwipe,
  tabSwipe as tabSwipeConfig,
  tabSwipeTranslation,
  type TabSwipeDirection
} from "@/src/navigation/tab-swipe";
import { colors, interaction, spacing, typeScale } from "@/src/theme/theme";

type ScreenProps = PropsWithChildren<{
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  scroll?: boolean;
  edgeSwipeBack?: boolean;
  onEdgeSwipeBack?: () => void;
  /** Enables the horizontal main-tab gesture on primary tab screens. */
  tabSwipe?: boolean;
  /** Gives visible page-local tabs first refusal before the main tab changes. */
  localTabSwipe?: {
    hasNext: boolean;
    hasPrevious: boolean;
    onNavigate: (direction: TabSwipeDirection) => void;
  };
  /**
   * Semantic colour for the header trace when the screen currently carries that
   * state — `semantic.live` while live matches are on it, for example.
   *
   * Omitted, the trace stays inert. This is the only place the shell itself is
   * allowed to light up, and it only ever reports something true about the
   * content below it.
   */
  accent?: string;
  scrollRef?: RefObject<ScrollView | null>;
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, "contentContainerStyle">;
}>;

const springBack = {
  damping: 20,
  stiffness: 260,
  mass: 0.7
} as const;

export function Screen({
  children,
  title,
  eyebrow,
  action,
  scroll = true,
  edgeSwipeBack = false,
  onEdgeSwipeBack,
  tabSwipe = false,
  localTabSwipe,
  accent,
  scrollRef,
  contentStyle,
  scrollProps
}: ScreenProps) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const swipeX = useSharedValue(0);
  const gestureStartX = useSharedValue(0);
  const gestureStartY = useSharedValue(0);
  const gestureActivated = useSharedValue(false);

  const tabTargetFor = useCallback(
    (
      dx: number
    ):
      | { kind: "LOCAL"; direction: TabSwipeDirection }
      | { kind: "MAIN"; route: MainTabRoute }
      | null => {
      const direction: TabSwipeDirection = dx < 0 ? "NEXT" : "PREVIOUS";
      const hasLocalTarget =
        direction === "NEXT"
          ? localTabSwipe?.hasNext
          : localTabSwipe?.hasPrevious;
      if (hasLocalTarget) {
        return { kind: "LOCAL", direction };
      }
      const route = adjacentMainTab(pathname, direction);
      return route ? { kind: "MAIN", route } : null;
    },
    [localTabSwipe, pathname]
  );

  const commitGesture = useCallback(
    (dx: number, vx: number) => {
      if (edgeSwipeBack) {
        if (shouldCommitEdgeSwipe(dx, vx)) {
          onEdgeSwipeBack?.();
        }
        return;
      }
      const target = tabTargetFor(dx);
      if (!target || !shouldCommitTabSwipe(dx, vx, true)) {
        return;
      }
      if (Platform.OS !== "web") {
        Haptics.selectionAsync().catch(() => undefined);
      }
      if (target.kind === "LOCAL") {
        localTabSwipe?.onNavigate(target.direction);
      } else {
        router.navigate(target.route as never);
      }
    },
    [
      edgeSwipeBack,
      localTabSwipe,
      onEdgeSwipeBack,
      router,
      tabTargetFor
    ]
  );

  const hasPreviousTarget =
    Boolean(localTabSwipe?.hasPrevious) ||
    adjacentMainTab(pathname, "PREVIOUS") !== null;
  const hasNextTarget =
    Boolean(localTabSwipe?.hasNext) || adjacentMainTab(pathname, "NEXT") !== null;
  const hasPreviousLocalTarget = Boolean(localTabSwipe?.hasPrevious);
  const hasNextLocalTarget = Boolean(localTabSwipe?.hasNext);

  // A screen enables exactly one horizontal gesture: detail screens the edge
  // back swipe, primary tab screens the tab swipe. The active mode is therefore
  // a property of the screen rather than gesture state that has to be tracked.
  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(edgeSwipeBack || tabSwipe)
      .manualActivation(true)
      .maxPointers(1)
      .onTouchesDown((event) => {
        const touch = event.changedTouches[0];
        if (!touch) {
          return;
        }
        gestureStartX.set(touch.x);
        gestureStartY.set(touch.y);
        gestureActivated.set(false);
      })
      .onTouchesMove((event, stateManager) => {
        if (gestureActivated.get() || event.numberOfTouches !== 1) {
          if (event.numberOfTouches !== 1) {
            stateManager.fail();
          }
          return;
        }
        const touch = event.allTouches[0];
        if (!touch) {
          stateManager.fail();
          return;
        }
        const dx = touch.x - gestureStartX.get();
        const dy = touch.y - gestureStartY.get();
        const horizontal = Math.abs(dx);
        const vertical = Math.abs(dy);

        const shouldActivate = edgeSwipeBack
          ? shouldActivateEdgeSwipe(gestureStartX.get(), dx, dy)
          : tabSwipe && shouldActivateTabSwipe(dx, dy);
        if (shouldActivate) {
          gestureActivated.set(true);
          stateManager.activate();
          return;
        }

        const directionRatio = edgeSwipeBack
          ? edgeSwipe.directionRatio
          : tabSwipeConfig.directionRatio;
        const activationDistance = edgeSwipeBack
          ? edgeSwipe.activationDx
          : tabSwipeConfig.activationDx;
        const wrongEdgeDirection = edgeSwipeBack && dx < -activationDistance;
        const verticalWon =
          vertical > activationDistance &&
          horizontal <= vertical * directionRatio;
        if (
          wrongEdgeDirection ||
          verticalWon ||
          (edgeSwipeBack && gestureStartX.get() > edgeSwipe.startWidth)
        ) {
          stateManager.fail();
        }
      })
      .onTouchesUp((_event, stateManager) => {
        if (!gestureActivated.get()) {
          stateManager.fail();
        }
      })
      .onTouchesCancelled((_event, stateManager) => {
        stateManager.fail();
      })
      .onUpdate((event) => {
        if (edgeSwipeBack) {
          swipeX.set(Math.max(0, Math.min(width, event.translationX)));
          return;
        }
        const hasTarget =
          event.translationX < 0 ? hasNextTarget : hasPreviousTarget;
        swipeX.set(
          tabSwipeTranslation(event.translationX, width, hasTarget)
        );
      })
      .onEnd((event) => {
        const hasTarget = edgeSwipeBack
          ? true
          : event.translationX < 0
            ? hasNextTarget
            : hasPreviousTarget;
        const shouldCommit = edgeSwipeBack
          ? shouldCommitEdgeSwipe(event.translationX, event.velocityX)
          : shouldCommitTabSwipe(
              event.translationX,
              event.velocityX,
              hasTarget
            );
        const hasLocalTarget =
          event.translationX < 0
            ? hasNextLocalTarget
            : hasPreviousLocalTarget;

        // Main-tab and stack navigation own their paired transition, so remove
        // the finger transform before scheduling navigation on the RN runtime.
        swipeX.set(
          shouldCommit && !hasLocalTarget
            ? 0
            : withSpring(0, springBack)
        );
        if (shouldCommit) {
          scheduleOnRN(commitGesture, event.translationX, event.velocityX);
        }
      })
      .onFinalize((_event, success) => {
        gestureActivated.set(false);
        if (!success) {
          swipeX.set(withSpring(0, springBack));
        }
      });
  }, [
    commitGesture,
    edgeSwipeBack,
    gestureActivated,
    gestureStartX,
    gestureStartY,
    hasNextLocalTarget,
    hasNextTarget,
    hasPreviousLocalTarget,
    hasPreviousTarget,
    swipeX,
    tabSwipe,
    width
  ]);
  const gestureEnabled = edgeSwipeBack || tabSwipe;
  const gestureStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeX.get() }]
  }));
  // A hairline that fades out from the leading edge rather than a rule that
  // crosses the screen: it reads as the residue of something moving through the
  // interface instead of as a divider, which is the whole difference between a
  // signature and a border. It carries the accent only when the screen has a
  // state to report, so an inert screen stays completely calm.
  const traceColor = accent ?? colors.border;
  const header =
    title || eyebrow || action ? (
      <View>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            {title ? <Text style={styles.title}>{title}</Text> : null}
          </View>
          {action}
        </View>
        <LinearGradient
          colors={[traceColor, `${traceColor}00`]}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={[styles.trace, accent ? styles.traceAccent : null]}
        />
      </View>
    ) : null;

  const content = (
    <>
      {header}
      {children}
    </>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.gestureRoot, gestureEnabled ? gestureStyle : null]}
        >
          {scroll ? (
            <ScrollView
              contentContainerStyle={[styles.content, contentStyle]}
              keyboardShouldPersistTaps="handled"
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              {...scrollProps}
            >
              {content}
            </ScrollView>
          ) : (
            <View style={[styles.content, styles.flex, contentStyle]}>
              {content}
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  flex: {
    flex: 1
  },
  gestureRoot: {
    flex: 1
  },
  content: {
    width: "100%",
    maxWidth: interaction.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: 112
  },
  header: {
    minHeight: 76,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  headerCopy: {
    flex: 1
  },
  trace: {
    height: 1,
    opacity: 0.45,
    marginBottom: spacing.lg
  },
  traceAccent: {
    opacity: 0.9
  },
  eyebrow: {
    // Previously BTB green on every screen, which made the brand accent ambient
    // and left it unable to mean "won" anywhere else. Muted here, so green is
    // spent only where it reports something.
    color: colors.textSubtle,
    ...typeScale.eyebrow,
    marginBottom: spacing.xs
  },
  title: {
    color: colors.text,
    ...typeScale.pageTitle
  }
});
