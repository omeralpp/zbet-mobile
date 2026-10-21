import { useState, type ReactNode, type RefObject } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, type ScrollView } from "react-native";
import { colors, iconSizes, radii, semantic, spacing } from "@/src/theme/theme";
import { moduleColumns } from "./breakpoints";
import { useBreakpoint } from "./use-breakpoint";

export type ReorderableModuleItem = {
  id: string;
  node: ReactNode;
  fullWidth?: boolean;
  /** Desktop grid rows this module spans, so a tall module keeps its column. */
  rowSpan?: number;
};

type ReorderableModuleListProps = {
  items: ReorderableModuleItem[];
  onReorder: (from: number, to: number) => void;
  onDragStateChange?: (dragging: boolean) => void;
  scrollRef?: RefObject<ScrollView | null>;
  scrollOffsetRef?: RefObject<number>;
  /** Caps the masonry columns, e.g. 1 inside the Canlı split-view pane. */
  maxColumns?: number;
};

/**
 * Web twin of the long-press reorder surface. A desktop has no touch hold, so
 * each module shows a small toolbar on hover or keyboard focus: a handle that
 * drags with the mouse (native HTML drag and drop) and up/down buttons that do
 * the same move from the keyboard. The order and the onReorder(from, to) move
 * semantics are exactly those of the native list.
 */
export function ReorderableModuleList({
  items,
  onReorder,
  onDragStateChange,
  maxColumns
}: ReorderableModuleListProps) {
  const [active, setActive] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  // Grid follows DOM/keyboard order across each row. Saved module order stays intact.
  const columns = Math.max(1, Math.min(moduleColumns(useBreakpoint()), maxColumns ?? 3));

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
    onDragStateChange?.(false);
  };

  return (
    <div style={columns > 1 ? { ...columnsStyle, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : listStyle}>
      {items.map((item, index) => {
        const shown = active === item.id || dragIndex === index;
        const dropHere = dragIndex !== null && overIndex === index && dragIndex !== index;
        return (
          <div
            key={item.id}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setActive((current) => (current === item.id ? null : current));
              }
            }}
            onDragOver={(event) => {
              if (dragIndex === null) {
                return;
              }
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              if (overIndex !== index) {
                setOverIndex(index);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (dragIndex !== null && dragIndex !== index) {
                onReorder(dragIndex, index);
              }
              endDrag();
            }}
            onFocus={() => setActive(item.id)}
            onMouseEnter={() => setActive(item.id)}
            onMouseLeave={() => setActive((current) => (current === item.id ? null : current))}
            style={{
              ...moduleStyle,
              ...(columns > 1 ? columnModuleStyle : null),
              ...(columns > 1 && item.fullWidth ? { gridColumn: "1 / -1" } : null),
              ...(columns > 1 && item.rowSpan ? { gridRow: `span ${item.rowSpan}` } : null),
              opacity: dragIndex === index ? 0.55 : 1,
              outline: dropHere ? `2px solid ${semantic.intelligence}` : "none"
            }}
          >
            {item.node}
            <div
              style={{
                ...toolbarStyle,
                opacity: shown ? 1 : 0,
                pointerEvents: shown ? "auto" : "none"
              }}
            >
              <div
                aria-label="Modülü sürükleyerek taşı"
                draggable
                onDragEnd={endDrag}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", item.id);
                  const card = event.currentTarget.parentElement?.parentElement;
                  if (card) {
                    event.dataTransfer.setDragImage(card, 24, 24);
                  }
                  setDragIndex(index);
                  onDragStateChange?.(true);
                }}
                role="button"
                style={handleStyle}
                title="Sürükleyerek taşı"
              >
                <MaterialCommunityIcons color={colors.textMuted} name="drag" size={iconSizes.small} />
              </div>
              <Pressable
                accessibilityLabel="Modülü yukarı taşı"
                accessibilityRole="button"
                disabled={index === 0}
                onPress={() => onReorder(index, index - 1)}
                style={({ hovered }) => [styles.move, hovered && styles.moveHover, index === 0 && styles.disabled]}
              >
                <MaterialCommunityIcons color={colors.text} name="chevron-up" size={iconSizes.small} />
              </Pressable>
              <Pressable
                accessibilityLabel="Modülü aşağı taşı"
                accessibilityRole="button"
                disabled={index === items.length - 1}
                onPress={() => onReorder(index, index + 1)}
                style={({ hovered }) => [
                  styles.move,
                  hovered && styles.moveHover,
                  index === items.length - 1 && styles.disabled
                ]}
              >
                <MaterialCommunityIcons color={colors.text} name="chevron-down" size={iconSizes.small} />
              </Pressable>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Module content is React Native layout, which assumes every parent behaves
// like a react-native-web View; these wrappers carry the same defaults.
const viewDefaults = {
  alignItems: "stretch",
  boxSizing: "border-box",
  display: "flex",
  flexBasis: "auto",
  flexDirection: "column",
  flexShrink: 0,
  minHeight: 0,
  minWidth: 0,
  position: "relative"
} as const;

// No gap: as on native, spacing between modules belongs to the modules.
const listStyle = viewDefaults;

const columnsStyle = {
  gap: spacing.xxl,
  alignItems: "start",
  display: "grid",
  position: "relative"
} as const;

// A module never splits across two columns.
const columnModuleStyle = {
  minWidth: 0
} as const;

const moduleStyle = {
  ...viewDefaults,
  borderRadius: radii.lg,
  transition: "opacity 140ms ease"
} as const;

const toolbarStyle = {
  alignItems: "center",
  backgroundColor: colors.backgroundElevated,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.round,
  display: "flex",
  gap: 2,
  padding: 2,
  position: "absolute",
  right: spacing.sm,
  top: -spacing.md,
  transition: "opacity 140ms ease",
  zIndex: 2
} as const;

const handleStyle = {
  alignItems: "center",
  cursor: "grab",
  display: "flex",
  height: 28,
  justifyContent: "center",
  width: 28
} as const;

const styles = StyleSheet.create({
  move: {
    alignItems: "center",
    borderRadius: radii.round,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  moveHover: {
    backgroundColor: colors.surface
  },
  disabled: {
    opacity: 0.35
  }
});
