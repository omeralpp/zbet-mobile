import { Circle, G, Line, Text as SvgText } from "react-native-svg";
import { colors, fontFamilies } from "@/src/theme/theme";
import { JourneyEventGlyph } from "./JourneyEventIcon";
import { edgeSafeLabel, pressureGoalAnnotation, pressureGoalGroups, type PressureGoal } from "./pressure-chart";

/** Event overlay only: no pressure value, scale, share or series is modified. */
export function PressureGoalMarkers({goals,x,left,right,top,bottom,mid,homeY,awayY}: {
  goals: readonly PressureGoal[]; x:(minute:number)=>number; left:number; right:number;
  top:number; bottom:number; mid:number; homeY:number; awayY:number;
}) {
  return <>{pressureGoalGroups(goals,x).map(group=>{
    const cy=group.side === "HOME" ? homeY : awayY;
    const annotation=pressureGoalAnnotation(group.goals);
    const ink=annotation.confirmed ? colors.gold : group.side === "HOME" ? colors.blue : colors.orange;
    const label=edgeSafeLabel(x(group.minute),left,right,annotation.width,annotation.gap);
    return <G key={group.key}>
      {group.goals.map(mark=><G key={mark.key}>
        {annotation.confirmed ? <>
          <Line x1={x(mark.minute)} x2={x(mark.minute)} y1={top} y2={bottom} stroke={colors.gold} strokeWidth={7} strokeOpacity={0.12} />
          <Line x1={x(mark.minute)} x2={x(mark.minute)} y1={top} y2={bottom} stroke={colors.gold} strokeWidth={2} />
          <Line x1={x(mark.minute)} x2={x(mark.minute)} y1={mark.side === "HOME" ? cy+9 : bottom} y2={mark.side === "HOME" ? top : cy-9} stroke={colors.gold} strokeOpacity={0.65} />
        </> : <>
          <Line x1={x(mark.minute)} x2={x(mark.minute)} y1={mark.side === "HOME" ? homeY+5 : mid} y2={mark.side === "HOME" ? mid : awayY-5} stroke={ink} strokeOpacity={0.35} />
          <Circle cx={x(mark.minute)} cy={cy} r={5} fill={colors.text} stroke={ink} strokeWidth={2} />
        </>}
      </G>)}
      {annotation.confirmed ? <>
        {group.goals.length > 1 ? <Line x1={x(group.goals[0]!.minute)} x2={x(group.goals.at(-1)!.minute)}
          y1={group.side === "HOME" ? cy+9 : cy-9} y2={group.side === "HOME" ? cy+9 : cy-9} stroke={colors.gold} strokeOpacity={0.65} /> : null}
        <Circle cx={x(group.minute)} cy={cy} r={9} fill={colors.background} stroke={colors.gold} strokeWidth={1} />
        <G transform={`translate(${x(group.minute)-9},${cy-9}) scale(0.75)`}><JourneyEventGlyph kind="GOAL" color={colors.gold} /></G>
      </> : null}
      <SvgText x={label.x} y={cy+4} textAnchor={label.anchor} fill={annotation.confirmed ? colors.gold : colors.text}
        fontSize={11} fontWeight="700" fontFamily={fontFamilies.text}>{annotation.text}</SvgText>
    </G>;
  })}</>;
}
