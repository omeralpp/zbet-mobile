import { useMemo, useState, type PropsWithChildren, type ReactNode } from "react";
import {
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/src/theme/theme";

type ScreenProps = PropsWithChildren<{
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  scroll?: boolean;
  edgeSwipeBack?: boolean;
  onEdgeSwipeBack?: () => void;
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
  contentStyle,
  scrollProps
}: ScreenProps) {
  const { width } = useWindowDimensions();
  const [swipeX] = useState(() => new Animated.Value(0));
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          edgeSwipeBack &&
          gesture.x0 <= 32 &&
          gesture.dx > 8 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onPanResponderMove: (_, gesture) => {
          swipeX.setValue(Math.max(0, Math.min(width, gesture.dx)));
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldGoBack = gesture.dx > 76 || gesture.vx > 0.65;
          if (shouldGoBack && onEdgeSwipeBack) {
            Animated.timing(swipeX, {
              toValue: width,
              duration: 160,
              useNativeDriver: true
            }).start(() => onEdgeSwipeBack());
            return;
          }
          Animated.spring(swipeX, {
            toValue: 0,
            damping: 18,
            stiffness: 220,
            useNativeDriver: true
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(swipeX, {
            toValue: 0,
            damping: 18,
            stiffness: 220,
            useNativeDriver: true
          }).start();
        }
      }),
    [edgeSwipeBack, onEdgeSwipeBack, swipeX, width]
  );
  const header =
    title || eyebrow || action ? (
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
        {action}
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
        {...(edgeSwipeBack ? panResponder.panHandlers : {})}
        style={[styles.gestureRoot, edgeSwipeBack && { transform: [{ translateX: swipeX }] }]}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, contentStyle]}
            keyboardShouldPersistTaps="handled"
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
    paddingHorizontal: spacing.lg,
    paddingBottom: 112
  },
  header: {
    minHeight: 80,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  headerCopy: {
    flex: 1
  },
  eyebrow: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: spacing.xs
  },
  title: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.6
  }
});
