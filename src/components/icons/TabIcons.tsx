// ─────────────────────────────────────────────────────────────────────────────
// Forged custom tab bar icons — "Ghibli Pastoral" hand-drawn SVG style.
// Each icon accepts a `color` prop (active vs inactive) and `size`.
// All paths are traced from the design system HTML document.
// ─────────────────────────────────────────────────────────────────────────────
import Svg, { Path, Line, Circle } from 'react-native-svg'

interface IconProps {
  color: string
  size?: number
}

// ── Today — Open scroll / the daily intention ─────────────────────────────────
export function TodayIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      {/* bottom roll left */}
      <Path d="M5.5 18.5 Q5.5 21 8 21 Q10.5 21 10.5 18.5"
        stroke={color} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
      {/* scroll body sides */}
      <Line x1={5.5} y1={5} x2={5.5} y2={18.5}
        stroke={color} strokeWidth={1.25} strokeLinecap="round" />
      <Line x1={16.5} y1={5} x2={16.5} y2={18.5}
        stroke={color} strokeWidth={1.25} strokeLinecap="round" />
      {/* top roll */}
      <Path d="M5.5 5 Q5.5 2 11 2 Q16.5 2 16.5 5"
        stroke={color} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
      {/* top roll inner shadow curve */}
      <Path d="M7 5 Q11 3.5 15 5"
        stroke={color} strokeWidth={0.85} strokeLinecap="round" opacity={0.55} />
      {/* bottom roll right */}
      <Path d="M10.5 18.5 Q10.5 21 13 21 Q15.5 21 16.5 18.5"
        stroke={color} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
      {/* text lines inside scroll */}
      <Line x1={8.5} y1={9} x2={13.5} y2={9}
        stroke={color} strokeWidth={1.0} strokeLinecap="round" opacity={0.7} />
      <Line x1={8.5} y1={12} x2={13.5} y2={12}
        stroke={color} strokeWidth={1.0} strokeLinecap="round" opacity={0.7} />
      <Line x1={8.5} y1={15} x2={11.5} y2={15}
        stroke={color} strokeWidth={1.0} strokeLinecap="round" opacity={0.5} />
    </Svg>
  )
}

// ── Progress — Growing sapling / each day adds a branch ──────────────────────
export function ProgressIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      {/* trunk */}
      <Path d="M11 20 L11 8"
        stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      {/* ground roots */}
      <Path d="M11 20 Q9 19.5 7.5 20.5"
        stroke={color} strokeWidth={1.1} strokeLinecap="round" />
      <Path d="M11 20 Q13 19.5 14.5 20.5"
        stroke={color} strokeWidth={1.1} strokeLinecap="round" />
      {/* lower branch left */}
      <Path d="M11 16 Q8.5 15 7 13"
        stroke={color} strokeWidth={1.15} strokeLinecap="round" />
      {/* lower branch right */}
      <Path d="M11 15 Q13.5 13.5 15 12"
        stroke={color} strokeWidth={1.15} strokeLinecap="round" />
      {/* mid branch left */}
      <Path d="M11 12.5 Q9 11.5 8 10"
        stroke={color} strokeWidth={1.1} strokeLinecap="round" />
      {/* crown — three leaf arcs */}
      <Path d="M11 8 Q9.5 5.5 11 4 Q12.5 5.5 11 8 Z"
        stroke={color} strokeWidth={1.1} strokeLinejoin="round" />
      <Path d="M11 7 Q13 5 14.5 6.5 Q13 9 11 8"
        stroke={color} strokeWidth={1.0} strokeLinejoin="round" />
      <Path d="M11 7 Q9 5 7.5 6.5 Q9 9 11 8"
        stroke={color} strokeWidth={1.0} strokeLinejoin="round" />
    </Svg>
  )
}

// ── Forge — Single hammer / blacksmith strike ─────────────────────────────────
export function ForgeIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      {/* hammer head top edge */}
      <Path d="M3.43 7.09 Q6.65 4.71 9.88 2.33"
        stroke={color} strokeWidth={1.35} strokeLinecap="round" />
      {/* hammer head bottom edge */}
      <Path d="M6.13 10.31 Q9.04 7.55 11.94 4.78"
        stroke={color} strokeWidth={1.35} strokeLinecap="round" />
      {/* hammer head left side */}
      <Line x1={3.43} y1={7.09} x2={6.13} y2={10.31}
        stroke={color} strokeWidth={1.35} strokeLinecap="round" />
      {/* hammer head right side */}
      <Line x1={9.88} y1={2.33} x2={11.94} y2={4.78}
        stroke={color} strokeWidth={1.35} strokeLinecap="round" />
      {/* eye / neck */}
      <Path d="M8.43 7.99 L9.88 6.77 L10.66 7.69 L9.2 8.91 Z"
        stroke={color} strokeWidth={1.1} strokeLinejoin="round" />
      {/* handle outer edge */}
      <Path d="M9.99 8.37 Q14.59 11.98 16.55 16.19"
        stroke={color} strokeWidth={1.35} strokeLinecap="round" />
      {/* handle inner edge */}
      <Path d="M10.49 7.74 Q14.89 11.54 16.75 15.74"
        stroke={color} strokeWidth={1.1} strokeLinecap="round" />
      {/* grip end cap */}
      <Line x1={16.55} y1={16.19} x2={16.75} y2={15.74}
        stroke={color} strokeWidth={1.1} strokeLinecap="round" />
    </Svg>
  )
}

// ── Settings — Botanical gear / craft & care ──────────────────────────────────
export function SettingsIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      {/* 8 botanical petal lobes */}
      <Path d="M11 2 Q12.2 3.8 11 5.5 Q9.8 3.8 11 2 Z"
        stroke={color} strokeWidth={1.1} strokeLinejoin="round" />
      <Path d="M20 11 Q18.2 12.2 16.5 11 Q18.2 9.8 20 11 Z"
        stroke={color} strokeWidth={1.1} strokeLinejoin="round" />
      <Path d="M11 20 Q9.8 18.2 11 16.5 Q12.2 18.2 11 20 Z"
        stroke={color} strokeWidth={1.1} strokeLinejoin="round" />
      <Path d="M2 11 Q3.8 9.8 5.5 11 Q3.8 12.2 2 11 Z"
        stroke={color} strokeWidth={1.1} strokeLinejoin="round" />
      <Path d="M17.2 4.8 Q16.5 6.8 14.8 6.5 Q15.5 4.5 17.2 4.8 Z"
        stroke={color} strokeWidth={1.1} strokeLinejoin="round" />
      <Path d="M17.2 17.2 Q15.2 16.5 15.5 14.8 Q17.5 15.5 17.2 17.2 Z"
        stroke={color} strokeWidth={1.1} strokeLinejoin="round" />
      <Path d="M4.8 4.8 Q6.8 5.5 6.5 7.2 Q4.5 6.5 4.8 4.8 Z"
        stroke={color} strokeWidth={1.1} strokeLinejoin="round" />
      <Path d="M4.8 17.2 Q5.5 15.2 7.2 15.5 Q6.5 17.5 4.8 17.2 Z"
        stroke={color} strokeWidth={1.1} strokeLinejoin="round" />
      {/* inner ring */}
      <Circle cx={11} cy={11} r={3.5} stroke={color} strokeWidth={1.3} />
      {/* centre dot — filled with active color */}
      <Circle cx={11} cy={11} r={1} fill={color} />
    </Svg>
  )
}
