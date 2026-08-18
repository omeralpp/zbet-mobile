import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  colors,
  interaction,
  radii,
  semantic,
  spacing,
  typeScale
} from "@/src/theme/theme";
import { bibiPresence } from "@/src/mascot/bibi-presence";
import { SurfaceMaterial } from "./SurfaceMaterial";
import {
  isAlarming,
  resolveSystemState,
  type SystemStateKind,
  type SystemStateTone
} from "./system-state";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

function toneColor(tone: SystemStateTone): string {
  if (tone === "PROBLEM") {
    return semantic.negative;
  }
  if (tone === "CAUTION") {
    return semantic.warning;
  }
  if (tone === "WAITING") {
    return semantic.intelligence;
  }
  return colors.textSubtle;
}

/**
 * One rendering for every system state.
 *
 * Tone drives the whole presentation, so a screen cannot accidentally dress a
 * closed market as a crash: it names the situation and the vocabulary decides
 * how loud that situation is allowed to be.
 *
 * Bibi appears only on the calm states, and only where ambient presence is
 * already allowed. Deriving that from `bibiPresence` rather than a prop means
 * an empty state on Match Detail cannot smuggle the mascot back onto a surface
 * Batch 2 deliberately cleared. She is also kept away from anything alarming —
 * a friendly character next to a real problem reads as the product not taking
 * it seriously.
 */
export function SystemState({
  kind,
  title,
  message,
  onRetry
}: {
  kind: SystemStateKind;
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  const pathname = usePathname();
  const spec = resolveSystemState(kind);
  const accent = toneColor(spec.tone);
  const alarming = isAlarming(spec.tone);
  const showMascot =
    !alarming &&
    spec.tone === "NEUTRAL" &&
    bibiPresence(pathname) === "FULL";
  const showRetry = spec.retryable && Boolean(onRetry);

  return (
    <View style={styles.container}>
      <SurfaceMaterial
        {...(alarming ? { accent } : {})}
        radius={radii.lg}
      />
      {kind === "LOADING" ? (
        <ActivityIndicator color={accent} size="large" />
      ) : showMascot ? (
        <Image
          resizeMode="contain"
          source={require("../../assets/mascot/bibi-half.png")}
          style={styles.mascot}
        />
      ) : (
        <MaterialCommunityIcons
          color={accent}
          name={spec.icon as IconName}
          size={32}
        />
      )}
      <Text style={styles.title}>{title ?? spec.title}</Text>
      <Text style={styles.message}>{message ?? spec.body}</Text>
      {showRetry ? (
        <Pressable onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>Tekrar dene</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Loading. Kept as a named entry point because it reads better at call sites. */
export function LoadingState({ label }: { label?: string }) {
  return <SystemState kind="LOADING" {...(label ? { title: label } : {})} />;
}

/**
 * A request that failed outright.
 *
 * This is the one place a screen has nothing to show and retrying can help, so
 * it is the only common state that carries problem styling.
 */
export function ErrorState({
  message,
  onRetry
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <SystemState
      kind="OFFLINE"
      message={message}
      title="Bağlantı kurulamadı"
      {...(onRetry ? { onRetry } : {})}
    />
  );
}

/** Nothing here, which is a normal answer rather than a failure. */
export function EmptyState({
  title,
  message,
  kind = "EMPTY"
}: {
  title: string;
  message: string;
  kind?: Extract<
    SystemStateKind,
    "EMPTY" | "NO_LIVE_MATCH" | "NO_DECISION"
  >;
}) {
  return <SystemState kind={kind} message={message} title={title} />;
}

const styles = StyleSheet.create({
  container: {
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft
  },
  mascot: {
    width: 54,
    height: 54
  },
  title: {
    color: colors.text,
    ...typeScale.moduleTitle,
    marginTop: spacing.md,
    textAlign: "center"
  },
  message: {
    color: colors.textMuted,
    ...typeScale.body,
    textAlign: "center",
    marginTop: spacing.sm
  },
  button: {
    marginTop: spacing.lg,
    minHeight: interaction.minTouchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    borderRadius: radii.round,
    backgroundColor: semantic.intelligence
  },
  buttonText: {
    color: colors.white,
    ...typeScale.label
  }
});
