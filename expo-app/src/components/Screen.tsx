import {
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode,
  type RefObject
} from "react";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import {
  Animated,
  PanResponder,
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
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { adjacentMainTab, type MainTabRoute } from "@/src/navigation/main-tabs";
import {
  shouldActivateTabSwipe,
  shouldCommitTabSwipe,
  tabSwipeTranslation
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
  toValue: 0,
  damping: 20,
  stiffness: 260,
  mass: 0.7,
  useNativeDriver: true
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
  accent,
  scrollRef,
  contentStyle,
  scrollProps
}: ScreenProps) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const [swipeX] = useState(() => new Animated.Value(0));

  // A screen enables exactly one horizontal gesture: detail screens the edge
  // back swipe, primary tab screens the tab swipe. The active mode is therefore
  // a property of the screen rather than gesture state that has to be tracked.
  const panResponder = useMemo(() => {
    const tabTargetFor = (dx: number): MainTabRoute | null =>
      adjacentMainTab(pathname, dx < 0 ? "NEXT" : "PREVIOUS");

    return PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gesture) => {
        if (edgeSwipeBack) {
          return (
            gesture.x0 <= 32 &&
            gesture.dx > 8 &&
            Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2
          );
        }
        return tabSwipe && shouldActivateTabSwipe(gesture.dx, gesture.dy);
      },
      onPanResponderMove: (_, gesture) => {
        if (edgeSwipeBack) {
          swipeX.setValue(Math.max(0, Math.min(width, gesture.dx)));
          return;
        }
        swipeX.setValue(
          tabSwipeTranslation(gesture.dx, width, tabTargetFor(gesture.dx) !== null)
        );
      },
      onPanResponderRelease: (_, gesture) => {
        if (edgeSwipeBack) {
          const shouldGoBack = gesture.dx > 76 || gesture.vx > 0.65;
          if (shouldGoBack && onEdgeSwipeBack) {
            Animated.timing(swipeX, {
              toValue: width,
              duration: 160,
              useNativeDriver: true
            }).start(() => onEdgeSwipeBack());
            return;
          }
          Animated.spring(swipeX, springBack).start();
          return;
        }
        const target = tabTargetFor(gesture.dx);
        // The tab change is committed immediately while the outgoing content
        // settles back, so the navigator animation continues the gesture
        // instead of replacing it after a pause.
        if (target && shouldCommitTabSwipe(gesture.dx, gesture.vx, true)) {
          if (Platform.OS !== "web") {
            Haptics.selectionAsync().catch(() => undefined);
          }
          router.navigate(target as never);
        }
        Animated.spring(swipeX, springBack).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(swipeX, springBack).start();
      }
    });
  }, [edgeSwipeBack, onEdgeSwipeBack, pathname, router, swipeX, tabSwipe, width]);
  const gestureEnabled = edgeSwipeBack || tabSwipe;
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
      <Animated.View
        {...(gestureEnabled ? panResponder.panHandlers : {})}
        style={[
          styles.gestureRoot,
          gestureEnabled && { transform: [{ translateX: swipeX }] }
        ]}
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
          <View style={[styles.content, styles.flex, contentStyle]}>{content}</View>
        )}
      </Animated.View>
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
