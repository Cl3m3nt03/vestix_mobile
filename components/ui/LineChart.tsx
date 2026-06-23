import { StyleSheet, Text, View } from 'react-native'
import Svg, { Polyline, Line } from 'react-native-svg'
import { color, font } from '@/theme/tokens'

export type Series = { label: string; color: string; points: { value: number }[] }

/**
 * Graphe multi-courbes (valeurs en %). SVG léger, pas d'animation (perf).
 * Échelle commune min/max sur toutes les séries.
 */
export function LineChart({ series, height = 180 }: { series: Series[]; height?: number }) {
  const W = 320
  const H = height
  const pad = 8
  const all = series.flatMap((s) => s.points.map((p) => p.value))
  if (!all.length) return <Text style={styles.empty}>Pas assez d’historique.</Text>
  const min = Math.min(...all, 0)
  const max = Math.max(...all, 0)
  const span = max - min || 1
  const maxLen = Math.max(...series.map((s) => s.points.length), 2)

  const toPoints = (pts: { value: number }[]) =>
    pts
      .map((p, i) => {
        const x = pad + (i / (maxLen - 1)) * (W - pad * 2)
        const y = pad + (1 - (p.value - min) / span) * (H - pad * 2)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')

  const zeroY = pad + (1 - (0 - min) / span) * (H - pad * 2)

  return (
    <View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* ligne du 0 % */}
        <Line x1={pad} y1={zeroY} x2={W - pad} y2={zeroY} stroke={color.hair} strokeWidth={1} strokeDasharray="3 4" />
        {series.map((s, i) =>
          s.points.length ? (
            <Polyline key={i} points={toPoints(s.points)} fill="none" stroke={s.color} strokeWidth={2.5}
              strokeLinejoin="round" strokeLinecap="round" />
          ) : null
        )}
      </Svg>
      <View style={styles.legend}>
        {series.map((s) => (
          <View key={s.label} style={styles.leg}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={styles.legTxt}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  empty: { fontFamily: font.body, fontSize: 13.5, color: color.inkSoft, paddingVertical: 20 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12 },
  leg: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 3 },
  legTxt: { fontFamily: font.bodyMed, fontSize: 12.5, color: color.inkSoft },
})
