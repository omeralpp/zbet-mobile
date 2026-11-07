import Svg, { Circle, ClipPath, Defs, G, Line, Polygon, RadialGradient, Stop } from "react-native-svg";

/**
 * The launch football, drawn in code so it reads as a ball at 30 pt in both
 * themes: an ivory leather ball with ink panels, a stitched outline and a
 * soft top-left light. The previous launch ball tinted an icon with the
 * action ink on a surface fill, which left a dark disc on dark and a blank
 * disc on light.
 *
 * The central panel points up, like the ball inside the crest, so a landing
 * that ends at a whole turn settles exactly into the brand artwork.
 */

const ink = "#0B1620";
const leather = "#F7F5EC";
const centre = 50;
const radius = 47;

function pentagon(cx: number, cy: number, r: number, rotationDeg: number): string {
  return Array.from({ length: 5 }, (_, index) => {
    const angle = ((rotationDeg + index * 72) * Math.PI) / 180;
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
}

const vertexAngles = Array.from({ length: 5 }, (_, index) => -90 + index * 72);
const centralPanel = pentagon(centre, centre, 15, -90);
// Outer panels sit where the central panel's corners point, turned to face it,
// and are clipped by the ball's edge like the panels of a real ball.
const outerPanels = vertexAngles.map((angle) => {
  const radians = (angle * Math.PI) / 180;
  return pentagon(centre + 41 * Math.cos(radians), centre + 41 * Math.sin(radians), 13, angle + 180);
});
const seams = vertexAngles.map((angle) => {
  const radians = (angle * Math.PI) / 180;
  return {
    x1: centre + 15 * Math.cos(radians),
    y1: centre + 15 * Math.sin(radians),
    x2: centre + 28 * Math.cos(radians),
    y2: centre + 28 * Math.sin(radians)
  };
});

export function LaunchBall({ size }: { size: number }) {
  return (
    <Svg height={size} viewBox="0 0 100 100" width={size}>
      <Defs>
        <ClipPath id="btbLaunchBallClip">
          <Circle cx={centre} cy={centre} r={radius} />
        </ClipPath>
        <RadialGradient cx="34%" cy="28%" id="btbLaunchBallLight" r="80%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.55} />
          <Stop offset="0.55" stopColor="#FFFFFF" stopOpacity={0} />
          <Stop offset="1" stopColor={ink} stopOpacity={0.32} />
        </RadialGradient>
      </Defs>
      <Circle cx={centre} cy={centre} fill={leather} r={radius} />
      <G clipPath="url(#btbLaunchBallClip)">
        <Polygon fill={ink} points={centralPanel} />
        {outerPanels.map((points, index) => (
          <Polygon fill={ink} key={index} points={points} />
        ))}
        {seams.map((seam, index) => (
          <Line key={index} stroke={ink} strokeLinecap="round" strokeWidth={2.4} {...seam} />
        ))}
      </G>
      <Circle cx={centre} cy={centre} fill="url(#btbLaunchBallLight)" r={radius} />
      <Circle cx={centre} cy={centre} fill="none" r={radius} stroke={ink} strokeWidth={3.2} />
    </Svg>
  );
}
