import { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { color, radius, shadow, font } from '@/theme/tokens'
import { useTheme } from '@/lib/theme-context'
import { AnimatedNumber } from './AnimatedNumber'

/**
 * Carte KPI — label mono uppercase, grande valeur Outfit (tabular-nums),
 * petite icône carrée teintée émeraude. Équivalent natif de `.fx-kpi`.
 * Si `valueNum` + `format` sont fournis, la valeur est animée (compteur).
 */
export function FxKpi({
  label,
  value,
  valueNum,
  format,
  sub,
  icon,
  trend,
}: {
  label: string
  value: string
  valueNum?: number
  format?: (n: number) => string
  sub?: string
  icon?: ReactNode
  trend?: { dir: 'up' | 'down'; text: string }
}) {
  const { accent } = useTheme()
  return (
    <View style={styles.kpi}>
      <View style={styles.top}>
        <Text style={styles.label}>{label}</Text>
        {icon ? <View style={[styles.ico, { backgroundColor: accent.accTint }]}>{icon}</View> : null}
      </View>
      {typeof valueNum === 'number' && format ? (
        <AnimatedNumber
          value={valueNum}
          format={format}
          style={styles.value}
          numberOfLines={1}
          adjustsFontSizeToFit
        />
      ) : (
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
      )}
      {trend ? (
        <Text style={[styles.sub, { color: trend.dir === 'up' ? color.up : color.down }]}>
          {trend.dir === 'up' ? '▲ ' : '▼ '}
          {trend.text}
        </Text>
      ) : sub ? (
        <Text style={styles.sub}>{sub}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  kpi: {
    flex: 1,
    minWidth: 150,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.glassHi,
    borderRadius: radius.lg,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 4,
    ...shadow.sm,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: {
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: color.inkFaint,
  },
  ico: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.accTint,
  },
  value: {
    fontFamily: font.display,
    fontSize: 26,
    letterSpacing: -0.5,
    color: color.ink,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  sub: { fontFamily: font.bodyMed, fontSize: 12.5, color: color.inkSoft },
})
