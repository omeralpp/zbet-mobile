import {
  useCallback,
  useMemo,
  type PropsWithChildren,
  type ReactNode,
  type RefObject
} from "react";
import {
  Image,
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
import { isAtLeast, resolveBreakpoint, wideContentMaxWidth } from "@/src/layout/breakpoints";
import { btbBrandMark } from "@/src/theme/brand-mark";
import { RefreshDataButton } from "@/src/web/RefreshDataButton";
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
import { runtimeConfig } from "@/src/config/runtime";

type ScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
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
  /**
   * Web only: widen the content column with the window (960/1280/1560 px) for
   * screens laid out in columns. Native and reading-style screens keep 720.
   */
  wide?: boolean;
  /** Compact context that stays above the scrolling content. */
  fixedHeader?: ReactNode;
  /**
   * Top-level tab screens: the BTB brand bar with the refresh control. Phone
   * and narrow web only — from 768 px the desktop sidebar carries the brand
   * and the shell carries the refresh.
   */
  brand?: boolean;
}>;

/**
 * Mark, name and refresh, with the right end left clear for Jinx, whose
 * overlay docks in that corner by default.
 */
function BrandBar() {
  return (
    <View style={styles.brandBar}>
      <Image accessibilityIgnoresInvertColors source={btbBrandMark} style={styles.brandMark} />
      <Text accessibilityRole="header" style={styles.brandName}>BTB</Text>
      <View style={styles.flex} />
      <RefreshDataButton variant="icon" />
      <View style={styles.mascotDock} />
    </View>
  );
}

export function Screen({
  children,
  title,
  subtitle,
  eyebrow,
  action,
  scroll = true,
  edgeSwipeBack = false,
  onEdgeSwipeBack,
  accent,
  scrollRef,
  contentStyle,
  scrollProps,
  wide = false,
  fixedHeader,
  brand = false
}: ScreenProps) {
  const { width } = useWindowDimensions();
  const showsBrandBar =
    brand && (Platform.OS !== "web" || !isAtLeast(resolveBreakpoint(width), "medium"));
  const widened =
    wide && Platform.OS === "web"
      ? { maxWidth: wideContentMaxWidth(resolveBreakpoint(width)), paddingHorizontal: spacing.xxl }
      : null;
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
  // signature and a border. It is drawn only while the screen has a state to
  // report, so an inert screen has no rule under its title at all.
  const header =
    title || eyebrow || action ? (
      <View style={styles.headerBlock}>
        <View style={[styles.header, showsBrandBar && styles.headerUnderBrand]}>
          <View style={styles.headerCopy}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            {title ? <Text accessibilityRole="header" role="heading" aria-level={1} style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
        {accent ? (
          <LinearGradient
            colors={[accent, `${accent}00`]}
            end={{ x: 1, y: 0 }}
            start={{ x: 0, y: 0 }}
            style={styles.trace}
          />
        ) : null}
      </View>
    ) : null;

  const content = (
    <>
      {header}
      {children}
    </>
  );

  return (
    // A swipe-back screen is a pushed stack page under the native header,
    // which already clears the status bar; insetting it again left an empty
    // band between the header and the content on Android.
    <SafeAreaView edges={edgeSwipeBack ? [] : ["top"]} style={styles.safeArea}>
      {showsBrandBar ? <BrandBar /> : null}
      {runtimeConfig.useMocks ? <View style={styles.previewNotice}><Text style={styles.previewText}>Örnek veriler · canlı veri değil</Text></View> : null}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.gestureRoot, gestureEnabled ? gestureStyle : null]}
        >
          {fixedHeader}
          {scroll ? (
            <ScrollView
              contentContainerStyle={[styles.content, widened, contentStyle]}
              keyboardShouldPersistTaps="handled"
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              {...scrollProps}
            >
              {content}
            </ScrollView>
          ) : (
            <View style={[styles.content, styles.flex, widened, contentStyle]}>
              {content}
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  previewNotice: { backgroundColor: colors.goldSoft, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  previewText: { ...typeScale.meta, color: colors.gold },
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
  brandBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    height: 64,
    paddingLeft: spacing.lg,
    paddingRight: 6
  },
  brandMark: {
    height: 32,
    width: 32
  },
  brandName: {
    color: colors.text,
    ...typeScale.decision,
    fontWeight: "800",
    letterSpacing: 0.6
  },
  // Jinx's overlay docks here by default: 68pt plus its edge margin.
  mascotDock: {
    width: 72
  },
  headerBlock: {
    marginBottom: spacing.lg
  },
  header: {
    minHeight: 64,
    paddingTop: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md
  },
  headerUnderBrand: {
    minHeight: 0,
    paddingTop: 2
  },
  headerCopy: {
    flex: 1
  },
  trace: {
    height: 1,
    opacity: 0.9,
    marginTop: spacing.md
  },
  eyebrow: {
    // Previously BTB green on every screen, which made the brand accent ambient
    // and left it unable to mean "won" anywhere else. Muted here, so green is
    // spent only where it reports something.
    color: colors.textMuted,
    ...typeScale.eyebrow,
    marginBottom: 2
  },
  title: {
    color: colors.text,
    ...typeScale.pageTitle
  },
  subtitle: {
    ...typeScale.bodyCompact,
    color: colors.textMuted,
    marginTop: spacing.xs
  }
});
