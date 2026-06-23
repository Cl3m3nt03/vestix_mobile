import { StyleSheet, Text, View } from 'react-native'
import { color, font } from '@/theme/tokens'

/** Pilule de variation. Équivalent natif de `.fx-pill-up/down`. */
export function FxPill({ dir, label }: { dir: 'up' | 'down'; label: string }) {
  const up = dir === 'up'
  return (
    <View style={[styles.pill, { backgroundColor: up ? 'rgba(0,137,84,0.12)' : 'rgba(206,81,77,0.12)' }]}>
      <Text style={[styles.txt, { color: up ? color.up : color.down }]}>
        {up ? '▲ ' : '▼ '}
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  txt: { fontFamily: font.bodySemi, fontSize: 13 },
})
