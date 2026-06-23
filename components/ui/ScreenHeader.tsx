import { StyleSheet, Text, View } from 'react-native'
import { color, font } from '@/theme/tokens'

/** En-tête d'écran : eyebrow mono + gros titre Outfit. Cohérent avec le dashboard. */
export function ScreenHeader({ eyebrow, title, right }: { eyebrow: string; title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.h1}>{title}</Text>
      </View>
      {right}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  eyebrow: { fontFamily: font.mono, fontSize: 10, letterSpacing: 2, color: color.inkFaint },
  h1: { fontFamily: font.display, fontSize: 24, letterSpacing: -0.3, color: color.ink, marginTop: 2 },
})
