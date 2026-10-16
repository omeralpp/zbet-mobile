import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import { Platform } from 'react-native';
import type { JourneyMoment } from './journey-story';
import { colors } from '@/src/theme/theme';

export const journeySvgAccessibility=Platform.OS==='web'?{'aria-hidden':true as const}:{accessible:false};

export function journeyEventColor(event: JourneyMoment) {
  return event.kind === 'SUPER' ? colors.gold : event.kind === 'RED_CARD' ? colors.red : event.kind === 'CORRECTION' ? colors.textMuted
    : event.kind === 'POOL_CHANGE' || event.side === 'AWAY' ? colors.bronze
    : event.side === 'HOME' ? colors.blue : colors.textMuted;
}

/** Shared vector symbols in the plot, event rail and selected-event detail. */
export function JourneyEventGlyph({ kind, color }: { kind: JourneyMoment['kind']; color: string }) {
  // The same five-point star the rating rows use, so a chart mark and its
  // row in the flow below read as one decision.
  if (kind === 'SUPER') return <Path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8Z" fill={color} stroke={color} strokeWidth={1} strokeLinejoin="round"/>;
  if (kind === 'RED_CARD') return <G><Rect x={6} y={3} width={12} height={18} rx={2} fill={color}/><Line x1={9} y1={7} x2={15} y2={7} stroke={colors.background} strokeOpacity={.35}/></G>;
  if (kind === 'POOL_CHANGE') return <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><Path d="M4 8h15l-4-4M20 16H5l4 4"/><Circle cx={5} cy={16} r={1}/><Circle cx={19} cy={8} r={1}/></G>;
  if (kind === 'CORRECTION') return <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><Path d="M5 8a8 8 0 1 1-1 8M5 3v5h5M12 8v5l3 2"/></G>;
  return <G stroke={color} strokeWidth={1.5} strokeLinejoin="round"><Circle cx={12} cy={12} r={9} fill="none"/><Path d="M12 8l4 3-1.5 4h-5L8 11Z" fill={color}/><Path d="M12 3v5M21 10l-5 1M17 20l-2.5-5M7 20l2.5-5M3 10l5 1" fill="none"/></G>;
}

export function JourneyEventIcon({ event, size = 24 }: { event: JourneyMoment; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" {...journeySvgAccessibility}><JourneyEventGlyph kind={event.kind} color={journeyEventColor(event)}/></Svg>;
}
