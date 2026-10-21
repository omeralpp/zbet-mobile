import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import { useJinxPreferences } from "@/src/mascot/JinxPreferencesProvider";
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
  iconSizes,
  interaction,
  radii,
  semantic,
  spacing,
  typeScale
} from "@/src/theme/theme";
import { bibiPresence } from "@/src/mascot/bibi-presence";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { describeUiError, type UiErrorCategory } from "./ui-error";
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
  const jinx = useJinxPreferences();
  const spec = resolveSystemState(kind);
  const accent = toneColor(spec.tone);
  const alarming = isAlarming(spec.tone);
  const showMascot =
    jinx.ready && !jinx.hidden && !jinx.denseSurface &&
    !alarming &&
    spec.tone === "NEUTRAL" &&
    bibiPresence(pathname) === "FULL";
  const showRetry = spec.retryable && Boolean(onRetry);

  return (
    <View
      accessibilityLiveRegion={kind === "LOADING" ? "polite" : undefined}
      accessibilityRole={
        kind === "LOADING" ? "progressbar" : alarming ? "alert" : undefined
      }
      style={styles.container}
    >
      <SurfaceMaterial
        {...(alarming ? { accent } : {})}
        radius={radii.lg}
      />
      {kind === "LOADING" ? (
        // The shape of what is coming instead of a spinner: a header line,
        // two rows and a block, still, so it never competes with live data.
        <View accessibilityElementsHidden style={styles.skeleton}>
          <View style={styles.skeletonHead}>
            <View style={[styles.bone, styles.boneTitle]} />
            <View style={[styles.bone, styles.bonePill]} />
          </View>
          {[0, 1].map((row) => (
            <View key={row} style={styles.skeletonRow}>
              <View style={[styles.bone, styles.boneDot]} />
              <View style={[styles.bone, row === 0 ? styles.boneLong : styles.boneShort]} />
            </View>
          ))}
          <View style={[styles.bone, styles.boneBlock]} />
        </View>
      ) : showMascot ? (
        <Image
          resizeMode="contain"
          source={require("../../assets/mascot/candidates/jinx-a-half.png")}
          accessible={false}
          style={styles.mascot}
        />
      ) : (
        <View style={styles.iconTile}>
          <MaterialCommunityIcons
            color={accent}
            name={spec.icon as IconName}
            size={iconSizes.control}
          />
        </View>
      )}
      {kind === "LOADING" ? (
        <View style={styles.loadingLabel}>
          <ActivityIndicator color={accent} size="small" />
          <Text accessibilityRole="header" role="heading" aria-level={2} style={styles.loadingText}>{title ?? spec.title}</Text>
        </View>
      ) : (
        <>
          <Text accessibilityRole="header" role="heading" aria-level={2} style={styles.title}>{title ?? spec.title}</Text>
          <Text style={styles.message}>{message ?? spec.body}</Text>
        </>
      )}
      {showRetry ? (
        <Pressable
          accessibilityHint="Bu ekranın verilerini yeniden yükler"
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.button}
        >
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

/** An unavailable region with cause-aware copy and only a useful retry action. */
export function ErrorState({
  error,
  category,
  onRetry
}: {
  error?: unknown;
  category?: UiErrorCategory;
  /** Legacy diagnostic text is deliberately not rendered. Pass the structured error. */
  message?: string;
  onRetry?: () => void;
}) {
  const display = describeUiError(error, category);
  return (
    <SystemState
      kind={display.kind}
      message={display.message}
      title={display.title}
      {...(onRetry && display.retryable ? { onRetry } : {})}
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
  iconTile: {
    alignItems: "center",
    backgroundColor: colors.surfaceStrong,
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    width: 52
  },
  skeleton: {
    alignSelf: "stretch",
    gap: spacing.md
  },
  skeletonHead: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  skeletonRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  bone: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.round
  },
  boneTitle: { height: 12, width: "38%" },
  bonePill: { height: 20, width: 56 },
  boneDot: { height: 30, width: 30 },
  boneLong: { height: 12, flex: 1 },
  boneShort: { height: 12, width: "55%" },
  boneBlock: { borderRadius: 14, height: 88 },
  loadingLabel: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  loadingText: {
    color: colors.text,
    ...typeScale.bodyCompact,
    fontWeight: "700"
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
    backgroundColor: semantic.actionFill
  },
  buttonText: {
    color: semantic.onAction,
    ...typeScale.bodyCompact,
    fontWeight: "700"
  }
});
