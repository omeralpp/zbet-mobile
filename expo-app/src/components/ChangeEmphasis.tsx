import {
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";
import {
  Animated,
  type StyleProp,
  type ViewStyle
} from "react-native";
import {
  emphasis,
  motionDuration,
  type EmphasisName
} from "@/src/theme/theme";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";

type ChangeToken = string | number | null | undefined;

/**
 * Announces one meaningful data change without introducing ambient motion.
 *
 * The token is compared with the previous rendered value. Initial data stays
 * still; callers may opt a newly inserted row into the same one-shot emphasis.
 * Reduced motion skips the travel and lands directly on the final state.
 */
export function ChangeEmphasis({
  announceOnMount = false,
  children,
  kind = "arrive",
  style,
  token
}: {
  announceOnMount?: boolean;
  children: ReactNode;
  kind?: EmphasisName;
  style?: StyleProp<ViewStyle>;
  token: ChangeToken;
}) {
  const reduceMotion = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(1));
  const [scale] = useState(() => new Animated.Value(1));
  const mounted = useRef(false);
  const previous = useRef<ChangeToken>(token);

  useEffect(() => {
    const firstRender = !mounted.current;
    const changed = !firstRender && !Object.is(previous.current, token);
    mounted.current = true;
    previous.current = token;

    if (!changed && !(firstRender && announceOnMount)) {
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }

    const preset = emphasis[kind];
    opacity.setValue(preset.opacityFrom);
    scale.setValue(preset.scaleFrom);

    const duration = motionDuration(
      kind === "alert" ? "transition" : "reveal",
      reduceMotion
    );
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        duration,
        toValue: 1,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        duration,
        toValue: 1,
        useNativeDriver: true
      })
    ]);
    animation.start();
    return () => animation.stop();
  }, [announceOnMount, kind, opacity, reduceMotion, scale, token]);

  return (
    <Animated.View
      style={[style, { opacity, transform: [{ scale }] }]}
    >
      {children}
    </Animated.View>
  );
}
