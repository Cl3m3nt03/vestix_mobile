import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { color, font } from '@/theme/tokens'

export type Slice = { label: string; value: number; color: string }

/**
 * Donut SVG + légende. Trou central = valeur Outfit + label mono.
 * Équivalent natif de `.fx-donut` + `.fx-legend`.
 */
export function Donut({
  slices,
  size = 150,
  thickness = 22,
  centerValue,
  centerLabel,
}: {
  slices: Slice[]
  size?: number
  thickness?: number
  centerValue: string
  centerLabel: string
}) {
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const total = slices.reduce((s, x) => s + x.value, 0) || 1
  let offset = 0

  return (
    <View style={styles.row}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={color.hair2} strokeWidth={thickness} fill="none" />
          {slices.map((s, i) => {
            const len = (s.value / total) * c
            const el = (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={s.color}
                strokeWidth={thickness}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            )
            offset += len
            return el
          })}
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.cVal}>{centerValue}</Text>
          <Text style={styles.cLbl}>{centerLabel}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {slices.map((s, i) => (
          <View key={i} style={styles.leg}>
            <View style={[styles.legDot, { backgroundColor: s.color }]} />
            <Text style={styles.legName} numberOfLines={1}>
              {s.label}
            </Text>
            <Text style={styles.legVal}>{Math.round((s.value / total) * 100)}%</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  cVal: { fontFamily: font.display, fontSize: 20, color: color.ink, lineHeight: 22 },
  cLbl: { fontFamily: font.mono, fontSize: 9, letterSpacing: 0.7, textTransform: 'uppercase', color: color.inkFaint },
  legend: { flex: 1, gap: 10 },
  leg: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legDot: { width: 11, height: 11, borderRadius: 4 },
  legName: { flex: 1, fontFamily: font.body, fontSize: 13.5, color: color.inkSoft },
  legVal: { fontFamily: font.bodySemi, fontSize: 13.5, color: color.ink, fontVariant: ['tabular-nums'] },
})
