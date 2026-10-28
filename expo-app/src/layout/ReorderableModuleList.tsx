import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject
} from "react";
import * as Haptics from "expo-haptics";
import {
  AccessibilityInfo,
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type ScrollView
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, interaction, radii, spacing, typeScale } from "@/src/theme/theme";
import { moduleReorderLabel, resolveModuleStep } from "./module-reorder-accessibility";
import {
  moduleReorderActivationDelayMs,
  moduleReorderActivationSlop,
  resolveDropIndex
} from "./module-layout";

export type ReorderableModuleItem = {
  id: string;
  node: ReactNode;
  /** Desktop summary spans a row; Android remains a single reading column. */
  fullWidth?: boolean;
  /** Desktop only (grid rows spanned); the native single column ignores it. */
  rowSpan?: number;
};

type ReorderableModuleListProps = {
  items: ReorderableModuleItem[];
  onReorder: (from: number, to: number) => void;
  /** Lets the host screen suspend competing gestures while a module is lifted. */
  onDragStateChange?: (dragging: boolean) => void;
  scrollRef?: RefObject<ScrollView | null>;
  scrollOffsetRef?: RefObject<number>;
  /** Web-only column cap (an embedded pane); native always lays out one column. */
  maxColumns?: number;
};

type ModuleSlot = {
  translate: Animated.Value;
  height: number;
};

const autoScrollEdge = 96;
const autoScrollStep = 9;
const autoScrollIntervalMs = 16;

const settle = {
  damping: 24,
  stiffness: 260,
  mass: 0.85,
  useNativeDriver: true
} as const;

function haptic(kind: "activate" | "step" | "drop"): void {
  if (Platform.OS === "web") {
    return;
  }
  if (kind === "step") {
    Haptics.selectionAsync().catch(() => undefined);
    return;
  }
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

type ReorderableModuleProps = {
  id: string;
  node: ReactNode;
  controls: ReactNode;
  editing: boolean;
  dragging: boolean;
  someDragging: boolean;
  onDragMove: (pageY: number, dy: number) => void;
  onDragEnd: () => void;
  onRegister: (id: string, translate: Animated.Value) => void;
  onRelease: (id: string) => void;
  onMeasure: (id: string, height: number) => void;
  onHoldStart: (id: string, x: number, y: number) => void;
  onHoldMove: (x: number, y: number) => void;
  onHoldEnd: () => void;
};

/**
 * One reorderable module.
 *
 * Each module owns its own animated offset and lift so the list never has to
 * hold per-item animation state, and registers that offset with the list for
 * the duration it is mounted.
 */
const ReorderableModule = memo(function ReorderableModule({
  id,
  node,
  controls,
  editing,
  dragging,
  someDragging,
  onDragMove,
  onDragEnd,
  onRegister,
  onRelease,
  onMeasure,
  onHoldStart,
  onHoldMove,
  onHoldEnd
}: ReorderableModuleProps) {
  const [translate] = useState(() => new Animated.Value(0));
  const [lift] = useState(() => new Animated.Value(0));

  // Only the lifted module owns a pan responder, and only after the hold has
  // already promoted this module, so scrolling never competes with a gesture.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: () => dragging,
        onMoveShouldSetPanResponder: () => dragging,
        onPanResponderMove: (event, gesture) =>
          onDragMove(event.nativeEvent.pageY, gesture.dy),
        onPanResponderRelease: onDragEnd,
        onPanResponderTerminate: onDragEnd,
        onPanResponderTerminationRequest: () => false
      }),
    [dragging, onDragEnd, onDragMove]
  );

  useEffect(() => {
    onRegister(id, translate);
    return () => onRelease(id);
  }, [id, onRegister, onRelease, translate]);

  useEffect(() => {
    Animated.spring(lift, { toValue: dragging ? 1 : 0, ...settle }).start();
  }, [dragging, lift]);

  return (
    <Animated.View
      onLayout={(event: LayoutChangeEvent) =>
        onMeasure(id, event.nativeEvent.layout.height)
      }
      onTouchCancel={onHoldEnd}
      onTouchEnd={onHoldEnd}
      onTouchMove={(event) =>
        onHoldMove(event.nativeEvent.pageX, event.nativeEvent.pageY)
      }
      onTouchStart={(event) =>
        !editing && onHoldStart(id, event.nativeEvent.pageX, event.nativeEvent.pageY)
      }
      style={[
        dragging ? styles.dragging : null,
        {
          transform: [
            { translateY: translate },
            {
              scale: lift.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.02]
              })
            }
          ]
        }
      ]}
      {...panResponder.panHandlers}
    >
      {controls}
      {node}
      {someDragging && !dragging ? (
        <View pointerEvents="none" style={styles.dropTarget} />
      ) : null}
      {dragging ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.liftOutline, { opacity: lift }]}
        />
      ) : null}
    </Animated.View>
  );
});

/**
 * Native reorder surface used by Özet, Canlı detay and Super detay. Visible
 * edit controls provide the same persisted moves without requiring a drag.
 *
 * Motion is driven by native-driver transforms only: the lifted module follows
 * the finger while neighbours spring aside to open the drop slot. Normal
 * vertical scrolling is untouched until the hold threshold is met, at which
 * point the host screen suspends scrolling for the duration of the drag.
 * Edit mode keeps scrolling available and disarms holds on its move buttons.
 */
export function ReorderableModuleList({
  items,
  onReorder,
  onDragStateChange,
  scrollRef,
  scrollOffsetRef
}: ReorderableModuleListProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [dragId, setDragId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const slots = useRef(new Map<string, ModuleSlot>());
  const drag = useRef<{
    id: string;
    index: number;
    dropIndex: number;
    height: number;
  } | null>(null);
  const orderedIds = useRef<string[]>([]);
  const pointerY = useRef(0);
  const lastDy = useRef(0);
  const autoScrolled = useRef(0);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdOrigin = useRef({ x: 0, y: 0 });

  const ids = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    orderedIds.current = ids;
  }, [ids]);

  const registerSlot = useCallback((id: string, translate: Animated.Value) => {
    const existing = slots.current.get(id);
    slots.current.set(id, { translate, height: existing?.height ?? 0 });
  }, []);

  const releaseSlot = useCallback((id: string) => {
    slots.current.delete(id);
  }, []);

  const measureSlot = useCallback((id: string, height: number) => {
    const slot = slots.current.get(id);
    if (slot) {
      slot.height = height;
    }
  }, []);

  const orderedHeights = useCallback(
    () => orderedIds.current.map((id) => slots.current.get(id)?.height ?? 0),
    []
  );

  const applyNeighbourOffsets = useCallback(() => {
    const active = drag.current;
    if (!active) {
      return;
    }
    orderedIds.current.forEach((id, index) => {
      const slot = slots.current.get(id);
      if (index === active.index || !slot) {
        return;
      }
      const shiftsUp =
        active.dropIndex > active.index &&
        index > active.index &&
        index <= active.dropIndex;
      const shiftsDown =
        active.dropIndex < active.index &&
        index < active.index &&
        index >= active.dropIndex;
      Animated.spring(slot.translate, {
        toValue: shiftsUp ? -active.height : shiftsDown ? active.height : 0,
        ...settle
      }).start();
    });
  }, []);

  const updateDrag = useCallback(
    (dy: number) => {
      const active = drag.current;
      const slot = active ? slots.current.get(active.id) : undefined;
      if (!active || !slot) {
        return;
      }
      const offset = dy + autoScrolled.current;
      slot.translate.setValue(offset);
      const next = resolveDropIndex(orderedHeights(), active.index, offset);
      if (next !== active.dropIndex) {
        active.dropIndex = next;
        haptic("step");
        applyNeighbourOffsets();
      }
    },
    [applyNeighbourOffsets, orderedHeights]
  );

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  const edgeDirection = useCallback(() => {
    const top = insets.top + autoScrollEdge;
    const bottom = windowHeight - insets.bottom - autoScrollEdge;
    return pointerY.current < top ? -1 : pointerY.current > bottom ? 1 : 0;
  }, [insets.bottom, insets.top, windowHeight]);

  const tickAutoScroll = useCallback(() => {
    const scroller = scrollRef?.current;
    const direction = edgeDirection();
    if (!scroller || !scrollOffsetRef || !drag.current || direction === 0) {
      stopAutoScroll();
      return;
    }
    const target = Math.max(
      0,
      scrollOffsetRef.current + direction * autoScrollStep
    );
    if (target === scrollOffsetRef.current) {
      return;
    }
    autoScrolled.current += target - scrollOffsetRef.current;
    scroller.scrollTo({ y: target, animated: false });
    updateDrag(lastDy.current);
  }, [edgeDirection, scrollOffsetRef, scrollRef, stopAutoScroll, updateDrag]);

  // The edge ticker only exists while the finger is actually in an edge zone,
  // so a normal drag in the middle of the screen runs on gestures alone.
  const syncAutoScroll = useCallback(() => {
    if (!scrollRef?.current || !scrollOffsetRef) {
      return;
    }
    if (edgeDirection() === 0) {
      stopAutoScroll();
      return;
    }
    if (!autoScrollTimer.current) {
      autoScrollTimer.current = setInterval(
        tickAutoScroll,
        autoScrollIntervalMs
      );
    }
  }, [
    edgeDirection,
    scrollOffsetRef,
    scrollRef,
    stopAutoScroll,
    tickAutoScroll
  ]);

  const clearHold = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  const activate = useCallback(
    (id: string) => {
      const index = orderedIds.current.indexOf(id);
      if (index < 0 || drag.current) {
        return;
      }
      drag.current = {
        id,
        index,
        dropIndex: index,
        height: slots.current.get(id)?.height ?? 0
      };
      autoScrolled.current = 0;
      lastDy.current = 0;
      setDragId(id);
      onDragStateChange?.(true);
      haptic("activate");
    },
    [onDragStateChange]
  );

  const handleHoldStart = useCallback(
    (id: string, x: number, y: number) => {
      if (drag.current) {
        return;
      }
      holdOrigin.current = { x, y };
      pointerY.current = y;
      clearHold();
      holdTimer.current = setTimeout(() => activate(id), moduleReorderActivationDelayMs);
    },
    [activate, clearHold]
  );

  const handleHoldMove = useCallback(
    (x: number, y: number) => {
      pointerY.current = y;
      if (drag.current) {
        return;
      }
      if (
        Math.abs(x - holdOrigin.current.x) > moduleReorderActivationSlop ||
        Math.abs(y - holdOrigin.current.y) > moduleReorderActivationSlop
      ) {
        clearHold();
      }
    },
    [clearHold]
  );

  const finishDrag = useCallback(() => {
    const active = drag.current;
    clearHold();
    stopAutoScroll();
    if (!active) {
      return;
    }
    const slot = slots.current.get(active.id);
    const heightList = orderedHeights();
    let travelled = 0;
    for (
      let index = Math.min(active.index, active.dropIndex);
      index <= Math.max(active.index, active.dropIndex);
      index += 1
    ) {
      if (index !== active.index) {
        travelled += heightList[index] ?? 0;
      }
    }
    const restOffset = active.dropIndex > active.index ? travelled : -travelled;
    const from = active.index;
    const to = active.dropIndex;
    drag.current = null;
    haptic("drop");
    const settleDrop = () => {
      setDragId(null);
      onDragStateChange?.(false);
      if (from === to) {
        slot?.translate.setValue(0);
        return;
      }
      // Offsets are cleared in the same commit as the reordered list so the
      // settled module never blinks back through its previous slot.
      for (const entry of slots.current.values()) {
        entry.translate.setValue(0);
      }
      onReorder(from, to);
    };
    if (!slot) {
      settleDrop();
      return;
    }
    Animated.spring(slot.translate, { toValue: restOffset, ...settle }).start(
      settleDrop
    );
  }, [clearHold, onDragStateChange, onReorder, orderedHeights, stopAutoScroll]);

  useEffect(
    () => () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
      }
    },
    []
  );

  /**
   * Ends whatever the touch had started.
   *
   * A hold that promoted a module but never moved leaves the pan responder
   * unused, so its release arrives here as a plain touch end rather than as a
   * gesture release. Without this the module would stay lifted and the screen
   * would stay unscrollable until the next drag. Now that a panel header is
   * tappable this is no longer a rare gesture: a slow tap on a header crosses
   * the hold threshold with the finger perfectly still.
   *
   * Safe to reach twice — `finishDrag` clears the active drag before it settles,
   * so a real gesture release that also bubbles a touch end is a no-op here.
   */
  const releaseTouch = useCallback(() => {
    if (drag.current) {
      finishDrag();
      return;
    }
    clearHold();
  }, [clearHold, finishDrag]);

  const handleDragMove = useCallback(
    (pageY: number, dy: number) => {
      pointerY.current = pageY;
      lastDy.current = dy;
      updateDrag(dy);
      syncAutoScroll();
    },
    [syncAutoScroll, updateDrag]
  );

  const moveByAction = (id: string, direction: -1 | 1) => {
    if (drag.current) {
      return;
    }
    const move = resolveModuleStep(ids, id, direction);
    if (!move) {
      return;
    }
    clearHold();
    onReorder(move.from, move.to);
    haptic("step");
    AccessibilityInfo.announceForAccessibility(move.announcement);
  };

  return (
    <View>
      {items.length > 1 || editing ? (
        <Pressable
          accessibilityHint={editing ? "Bölüm taşıma düğmelerini kapatır." : "Her bölüm için yukarı ve aşağı taşıma düğmelerini açar."}
          accessibilityRole="button"
          accessibilityState={{ expanded: editing, disabled: dragId !== null }}
          disabled={dragId !== null}
          onPress={() => {
            clearHold();
            setEditing((value) => !value);
          }}
          style={({ pressed }) => [styles.editAction, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionText}>{editing ? "Düzenlemeyi bitir" : "Bölümleri düzenle"}</Text>
        </Pressable>
      ) : null}
      {items.map((item, index) => (
        <ReorderableModule
          controls={editing ? (
            <View style={styles.moveToolbar}>
              <Text style={styles.positionText}>{moduleReorderLabel(item.id)} · {index + 1}/{items.length}</Text>
              <View style={styles.moveActions}>
                {([-1, 1] as const).map((direction) => {
                  const disabled = direction === -1 ? index === 0 : index === items.length - 1;
                  const label = direction === -1 ? "Yukarı" : "Aşağı";
                  return (
                    <Pressable
                      accessibilityLabel={`${moduleReorderLabel(item.id)}, ${index + 1}. bölüm, toplam ${items.length}. ${label} taşı`}
                      accessibilityRole="button"
                      accessibilityState={{ disabled }}
                      disabled={disabled}
                      key={direction}
                      onPress={() => moveByAction(item.id, direction)}
                      style={({ pressed }) => [styles.moveAction, disabled && styles.actionDisabled, pressed && styles.actionPressed]}
                    >
                      <Text style={styles.actionText}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}
          dragging={dragId === item.id}
          editing={editing}
          id={item.id}
          key={item.id}
          node={item.node}
          onHoldEnd={releaseTouch}
          onHoldMove={handleHoldMove}
          onHoldStart={handleHoldStart}
          onDragEnd={finishDrag}
          onDragMove={handleDragMove}
          onMeasure={measureSlot}
          onRegister={registerSlot}
          onRelease={releaseSlot}
          someDragging={dragId !== null}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  editAction: {
    alignSelf: "flex-end",
    justifyContent: "center",
    minHeight: interaction.minTouchTarget,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm
  },
  moveToolbar: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    marginBottom: spacing.sm
  },
  positionText: {
    ...typeScale.bodyCompact,
    color: colors.textMuted
  },
  moveActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm
  },
  moveAction: {
    minWidth: interaction.minTouchTarget,
    minHeight: interaction.minTouchTarget,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    alignItems: "center"
  },
  actionText: {
    ...typeScale.bodyCompact,
    color: colors.text,
    fontWeight: "700"
  },
  actionPressed: {
    opacity: 0.65
  },
  actionDisabled: {
    opacity: 0.35
  },
  dragging: {
    elevation: 14,
    zIndex: 14
  },
  liftOutline: {
    borderColor: colors.green,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    bottom: 2,
    left: -4,
    position: "absolute",
    right: -4,
    top: 2
  },
  dropTarget: {
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderStyle: "dashed",
    borderWidth: 1,
    bottom: 4,
    left: -4,
    position: "absolute",
    right: -4,
    top: 4
  }
});
