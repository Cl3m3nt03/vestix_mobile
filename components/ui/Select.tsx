import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { FxChip } from './FxChip'
import { color, font } from '@/theme/tokens'

export type Option<T extends string> = { value: T; label: string }

/** Sélecteur à puces (rangée de chips). Équivalent natif d'un <select>. */
export function Select<T extends string>({
  label, options, value, onChange,
}: {
  label: string
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {options.map((o) => (
          <FxChip key={o.value} label={o.label} active={o.value === value} onPress={() => onChange(o.value)} />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 12 },
  label: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: color.inkFaint },
  row: { gap: 8, paddingRight: 8 },
})
