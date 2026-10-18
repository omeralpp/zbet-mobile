import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/theme';
import { useReducedMotion } from '@/src/theme/use-reduced-motion';
import { inspectorCommit, inspectorIntent, inspectorWheelInput, type InspectorIntent } from './journey-inspector';

type Props = {
  visible: boolean; onClose: () => void; onDismiss: () => void; children: ReactNode;
  previous: (() => void) | undefined; next: (() => void) | undefined;
  selectionKey: string | null; positionLabel: string;
};

export function JourneyInspector({ visible, onDismiss, ...props }: Props) {
  const reduceMotion = useReducedMotion();
  return <Modal visible={visible} transparent animationType={reduceMotion ? "none" : "fade"} onRequestClose={props.onClose} onDismiss={onDismiss}>
    <GestureHandlerRootView style={styles.root}><InspectorPanel {...props}/></GestureHandlerRootView>
  </Modal>;
}

/** Mounted inside Modal so native gestures and DOM listeners share its lifetime. */
function InspectorPanel({ onClose, children, previous, next, selectionKey, positionLabel }: Omit<Props, 'visible' | 'onDismiss'>) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const panel = useRef<View>(null), content = useRef<ScrollView>(null);
  const wheelState = useRef({ at: 0, amount: 0, locked: false });
  const scrollY = useSharedValue(0), startX = useSharedValue(0), startY = useSharedValue(0);
  const canDismiss = useSharedValue(false), mode = useSharedValue<InspectorIntent>('WAIT');
  const dragX = useSharedValue(0), dragY = useSharedValue(0);
  const scrollGesture = useMemo(() => Gesture.Native(), []);
  const pan = useMemo(() => Gesture.Pan().enabled(Platform.OS !== 'web').maxPointers(1).manualActivation(true)
    .blocksExternalGesture(scrollGesture)
    .onTouchesDown(event => {
      'worklet'; const touch = event.changedTouches[0];
      mode.set('WAIT');
      if (touch) { startX.set(touch.x); startY.set(touch.y); canDismiss.set(touch.y <= 100 || scrollY.get() <= 1); }
    })
    .onTouchesMove((event, manager) => {
      'worklet'; if (event.numberOfTouches !== 1) { manager.fail(); return; }
      if (mode.get() !== 'WAIT') return;
      const touch = event.allTouches[0]; if (!touch) { manager.fail(); return; }
      const intent = inspectorIntent(touch.x - startX.get(), touch.y - startY.get(), canDismiss.get());
      if (intent === 'SCROLL') manager.fail();
      else if (intent !== 'WAIT') { mode.set(intent); manager.activate(); }
    })
    .onTouchesUp((_event, manager) => { 'worklet'; if (mode.get() === 'WAIT') manager.fail(); })
    .onTouchesCancelled((_event, manager) => { 'worklet'; manager.fail(); })
    .onUpdate(event => {
      'worklet';
      if (mode.get() === 'DISMISS') dragY.set(Math.max(0, event.translationY));
      else dragX.set(Math.max(-50, Math.min(50, event.translationX * .2)));
    })
    .onEnd(event => {
      'worklet'; const result = inspectorCommit(event.translationX, event.translationY, event.velocityX, event.velocityY, mode.get());
      if (result === 'DISMISS') scheduleOnRN(onClose);
      else if (result === 'NEXT' && next) scheduleOnRN(next);
      else if (result === 'PREVIOUS' && previous) scheduleOnRN(previous);
    })
    .onFinalize(() => {
      'worklet'; mode.set('WAIT');
      dragX.set(reduceMotion ? 0 : withSpring(0)); dragY.set(reduceMotion ? 0 : withSpring(0));
    }), [scrollGesture, startX, startY, scrollY, canDismiss, mode, dragX, dragY, onClose, previous, next, reduceMotion]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: dragX.get() }, { translateY: dragY.get() }] }));
  useEffect(() => { content.current?.scrollTo({ y: 0, animated: false }); }, [selectionKey]);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = panel.current as unknown as HTMLElement | null;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      const result = inspectorWheelInput(wheelState.current, event, Date.now());
      if (!result.handled) return;
      event.preventDefault(); event.stopPropagation(); wheelState.current = result.state;
      if (result.direction > 0) next?.(); else if (result.direction < 0) previous?.();
    };
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.ctrlKey || event.altKey || event.metaKey || target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName)) return;
      if (event.key === 'ArrowLeft' && previous) { event.preventDefault(); event.stopPropagation(); previous(); }
      else if (event.key === 'ArrowRight' && next) { event.preventDefault(); event.stopPropagation(); next(); }
    };
    node.addEventListener('wheel', onWheel, { passive: false, capture: true });
    node.addEventListener('keydown', onKey);
    return () => { node.removeEventListener('wheel', onWheel, true); node.removeEventListener('keydown', onKey); };
  }, [previous, next]);
  return <View style={[styles.backdrop, width >= 768 ? styles.centered : null]}>
    <Pressable accessible={false} onPress={onClose} style={StyleSheet.absoluteFill}/>
    <GestureDetector gesture={pan}>
      <Animated.View ref={panel} accessibilityViewIsModal style={[styles.panel, { maxHeight: height * .86, paddingBottom: Math.max(12, insets.bottom) }, animatedStyle]}>
        {Platform.OS !== 'web' ? <View style={styles.handle}/> : null}
        <View style={styles.heading}>
          <Pressable accessibilityRole="button" accessibilityLabel="Önceki olay" disabled={!previous} onPress={previous} style={[styles.arrow, !previous ? styles.disabled : null]}><Text style={styles.arrowText}>‹</Text></Pressable>
          <View style={styles.titleBlock}><Text style={styles.title}>Seçili an</Text><Text accessibilityLiveRegion="polite" style={styles.hint}>{positionLabel}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Sonraki olay" disabled={!next} onPress={next} style={[styles.arrow, !next ? styles.disabled : null]}><Text style={styles.arrowText}>›</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Ayrıntıyı kapat" onPress={onClose} style={styles.close}><Text style={styles.link}>Kapat ✕</Text></Pressable>
        </View>
        <Text style={styles.instructions}>{Platform.OS === 'web' ? '← → Olaylar · Panel üzerinde yatay tekerlek veya Shift + tekerlek' : '↓ Kapat · ↔ Önceki / sonraki olay'}</Text>
        <GestureDetector gesture={scrollGesture}>
          <ScrollView ref={content} nestedScrollEnabled scrollEventThrottle={16} bounces={false}
            onScroll={event => scrollY.set(Math.max(0, event.nativeEvent.contentOffset.y))} contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        </GestureDetector>
      </Animated.View>
    </GestureDetector>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 }, backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12 },
  centered: { justifyContent: 'center' },
  panel: { width: '100%', maxWidth: 640, alignSelf: 'center', backgroundColor: colors.backgroundElevated, borderRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.textMuted, opacity: .5, alignSelf: 'center', marginTop: 10 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 4 }, titleBlock: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text }, hint: { fontSize: 11, color: colors.textMuted },
  instructions: { fontSize: 11, lineHeight: 17, color: colors.textMuted, marginBottom: 8 },
  arrow: { minWidth: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 32, color: colors.blue }, close: { minHeight: 48, paddingHorizontal: 6, justifyContent: 'center' },
  link: { fontSize: 13, fontWeight: '700', color: colors.blue }, disabled: { opacity: .3 },
  content: { gap: 12, paddingBottom: 16 }
});
