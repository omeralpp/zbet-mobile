import { useEffect, useRef, useState, type ReactNode } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent
} from "react-native";
import { ModuleHeading } from "@/src/components/ModuleHeading";
import { motionDuration } from "@/src/theme/motion";
import { colors, iconSizes, spacing } from "@/src/theme/theme";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";
import { shouldTogglePanel } from "./module-collapse";
import { useModuleCollapse } from "./module-collapse-store";
import type { ModuleLayoutSurface } from "./module-layout";

type CollapsibleModuleProps = {
  surface: ModuleLayoutSurface;
  /** Stable registry id. Persistence is keyed by this, never by the title. */
  moduleId: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
};

/**
 * One analytical module as a collapsible panel.
 *
 * The analytical surfaces stack nine and four modules respectively, and reorder
 * alone only decides what a user scrolls past first — it never lets them stop
 * scrolling past a module they do not use. Collapsing is the missing half of
 * that control, and it is deliberately a sibling of reorder rather than an
 * extension of it: the two preferences are stored apart, so shutting a panel
 * never moves it and reordering never reopens it.
 *
 * The header is the whole heading row, so the target is generous on a phone and
 * a user does not have to find a chevron. The body is mounted and unmounted
 * rather than animated to a height: these modules contain a provider WebView, a
 * live timeline and several charts, and a measured height transition on that
 * content is exactly the kind of motion that makes a live screen feel slow. The
 * chevron carries the state change instead, and reduced motion collapses even
 * that to zero.
 */
export function CollapsibleModule({
  surface,
  moduleId,
  eyebrow,
  title,
  children
}: CollapsibleModuleProps) {
  const { collapsed, toggle } = useModuleCollapse(surface);
  const isCollapsed = collapsed.includes(moduleId);
  const reduceMotion = useReducedMotion();
  const [chevron] = useState(() => new Animated.Value(isCollapsed ? 1 : 0));
  const press = useRef<{
    startedAt: number;
    startX: number;
    startY: number;
  } | null>(null);

  useEffect(() => {
    Animated.timing(chevron, {
      duration: motionDuration("fast", reduceMotion),
      toValue: isCollapsed ? 1 : 0,
      useNativeDriver: true
    }).start();
  }, [chevron, isCollapsed, reduceMotion]);

  const handlePressIn = (event: GestureResponderEvent) => {
    press.current = {
      startedAt: Date.now(),
      startX: event.nativeEvent.pageX,
      startY: event.nativeEvent.pageY
    };
  };

  const handlePress = (event: GestureResponderEvent) => {
    const started = press.current;
    press.current = null;
    if (!started) {
      return;
    }
    if (
      !shouldTogglePanel({
        endedAt: Date.now(),
        endX: event.nativeEvent.pageX,
        endY: event.nativeEvent.pageY,
        startedAt: started.startedAt,
        startX: started.startX,
        startY: started.startY
      })
    ) {
      return;
    }
    toggle(moduleId);
  };

  return (
    <View>
      <Pressable
        accessibilityHint={
          isCollapsed ? "Modülü açar" : "Modülü kapatır"
        }
        accessibilityRole="button"
        accessibilityState={{ expanded: !isCollapsed }}
        onPress={handlePress}
        onPressIn={handlePressIn}
        // A closed panel is only its header, so the heading's own bottom margin
        // is cancelled rather than left as a gap under nothing.
        style={isCollapsed ? styles.headerCollapsed : undefined}
      >
        <ModuleHeading
          eyebrow={eyebrow}
          title={title}
          trailing={
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: chevron.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "180deg"]
                    })
                  }
                ]
              }}
            >
              <MaterialCommunityIcons
                color={colors.textMuted}
                name="chevron-up"
                size={iconSizes.control}
              />
            </Animated.View>
          }
        />
      </Pressable>
      {isCollapsed ? null : children}
    </View>
  );
}

const styles = StyleSheet.create({
  headerCollapsed: {
    marginBottom: -spacing.md
  }
});
