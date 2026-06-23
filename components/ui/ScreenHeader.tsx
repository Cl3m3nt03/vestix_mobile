import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { color, font } from '@/theme/tokens'

/** En-tête d'écran : eyebrow mono + gros titre Outfit. Cohérent avec le dashboard. */
export function ScreenHeader({
  eyebrow, title, right, onBack,
}: {
  eyebrow: string
  title: string
  right?: React.ReactNode
  onBack?: () => void
}) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={8} style={styles.back}>
            <Feather name="chevron-left" size={22} color={color.ink} />
          </Pressable>
        ) : null}
        <View>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.h1}>{title}</Text>
        </View>
      </View>
      {right}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  back: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    backgroundColor: color.glass, borderWidth: 1, borderColor: color.glassHi,
  },
  eyebrow: { fontFamily: font.mono, fontSize: 10, letterSpacing: 2, color: color.inkFaint },
  h1: { fontFamily: font.display, fontSize: 24, letterSpacing: -0.3, color: color.ink, marginTop: 2 },
})
