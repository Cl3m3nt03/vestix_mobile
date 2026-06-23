import { StyleSheet, Text, TextInput, View } from 'react-native'
import { color, font } from '@/theme/tokens'

/** Champ de formulaire étiqueté (label mono + input). */
export function Field({
  label, value, onChangeText, ...rest
}: {
  label: string
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={color.inkFaint}
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 12 },
  label: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: color.inkFaint },
  input: {
    height: 48, borderRadius: 13, paddingHorizontal: 14,
    borderWidth: 1, borderColor: color.glassHi, backgroundColor: color.white,
    fontFamily: font.body, fontSize: 15, color: color.ink,
  },
})
