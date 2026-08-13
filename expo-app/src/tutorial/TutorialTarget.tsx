import {
  useCallback,
  useEffect,
  useRef,
  type PropsWithChildren
} from "react";
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { colors, radii } from "@/src/theme/theme";
import { useTutorial } from "./TutorialProvider";

type TutorialTargetProps = PropsWithChildren<{
  id: string;
  style?: StyleProp<ViewStyle>;
  radius?: number;
}>;

export function TutorialTarget({
  children,
  id,
  style,
  radius = radii.lg
}: TutorialTargetProps) {
  const { activeTip, setTargetRect } = useTutorial();
  const ref = useRef<View>(null);
  const active = activeTip?.targetId === id;

  const measure = useCallback(() => {
    if (!active) {
      return;
    }
    requestAnimationFrame(() => {
      ref.current?.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setTargetRect(id, { x, y, width, height });
        }
      });
    });
  }, [active, id, setTargetRect]);

  useEffect(() => {
    if (active) {
      measure();
      const timer = setInterval(measure, 350);
      return () => {
        clearInterval(timer);
        setTargetRect(id, null);
      };
    }
    setTargetRect(id, null);
    return undefined;
  }, [active, id, measure, setTargetRect]);

  const onLayout = (_event: LayoutChangeEvent) => measure();

  return (
    <View
      collapsable={false}
      onLayout={onLayout}
      ref={ref}
      style={[styles.target, style]}
    >
      {children}
      {active ? (
        <View
          pointerEvents="none"
          style={[styles.activeBorder, { borderRadius: radius }]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  target: {
    position: "relative"
  },
  activeBorder: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderColor: colors.green,
    borderWidth: 2,
    backgroundColor: `${colors.green}0A`,
    zIndex: 20,
    elevation: 20
  }
});
