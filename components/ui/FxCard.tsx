import { ReactNode } from 'react'
import { StyleSheet, View, ViewStyle, Text } from 'react-native'
import { color, radius, shadow, font } from '@/theme/tokens'

/**
 * Carte de verre — fond OPAQUE (pas de blur, cf. perf), bordure claire,
 * radius 26, ombre verte douce. Équivalent natif de `.fx-card`.
 */
export function FxCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>
}

/** En-tête de carte : titre Outfit + sous-titre mono optionnel + action à droite. */
export function FxCardHeader({
  title,
  sub,
  right,
}: {
  title: string
  sub?: string
  right?: ReactNode
}) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.glassHi,
    borderRadius: radius.lg,
    padding: 22,
    ...shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontFamily: font.display,
    fontSize: 18,
    letterSpacing: -0.2,
    color: color.ink,
  },
  sub: {
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: color.inkFaint,
    marginTop: 4,
  },
})
