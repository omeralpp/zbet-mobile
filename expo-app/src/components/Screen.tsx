import {
  useCallback,
  useMemo,
  type PropsWithChildren,
  type ReactNode,
  type RefObject
} from "react";
import {
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
import {
  edgeSwipe,
  shouldActivateEdgeSwipe,
  shouldCommitEdgeSwipe
} from "@/src/navigation/tab-swipe";
import {
  colors,
  gestureSpring,
  interaction,
  spacing,
  typeScale
} from "@/src/theme/theme";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";

type ScreenProps = PropsWithChildren<{
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  scroll?: boolean;
  edgeSwipeBack?: boolean;
  onEdgeSwipeBack?: () => void;
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

export function Screen({
  children,
  title,
  eyebrow,
  action,
  scroll = true,
  edgeSwipeBack = false,
  onEdgeSwipeBack,
  accent,
  scrollRef,
  contentStyle,
  scrollProps
}: ScreenProps) {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const swipeX = useSharedValue(0);
  const gestureStartX = useSharedValue(0);
  const gestureStartY = useSharedValue(0);
  const gestureActivated = useSharedValue(false);

  const commitEdgeSwipe = useCallback(() => {
    onEdgeSwipeBack?.();
  }, [onEdgeSwipeBack]);

  // Main and page-local tabs use native pagers. `Screen` owns only the detail
  // screen's leading-edge back gesture, so no competing pan handler sits above
  // vertical lists or pager content.
  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(edgeSwipeBack)
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

        const shouldActivate = shouldActivateEdgeSwipe(
          gestureStartX.get(),
          dx,
          dy
        );
        if (shouldActivate) {
          gestureActivated.set(true);
          stateManager.activate();
          return;
        }

        const directionRatio = edgeSwipe.directionRatio;
        const activationDistance = edgeSwipe.activationDx;
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
        swipeX.set(Math.max(0, Math.min(width, event.translationX)));
      })
      .onEnd((event) => {
        const shouldCommit = shouldCommitEdgeSwipe(
          event.translationX,
          event.velocityX
        );
        swipeX.set(
          shouldCommit || reduceMotion ? 0 : withSpring(0, gestureSpring)
        );
        if (shouldCommit) {
          scheduleOnRN(commitEdgeSwipe);
        }
      })
      .onFinalize((_event, success) => {
        gestureActivated.set(false);
        if (!success) {
          swipeX.set(reduceMotion ? 0 : withSpring(0, gestureSpring));
        }
      });
  }, [
    commitEdgeSwipe,
    edgeSwipeBack,
    gestureActivated,
    gestureStartX,
    gestureStartY,
    reduceMotion,
    swipeX,
    width
  ]);
  const gestureEnabled = edgeSwipeBack;
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
