import { Pressable, StyleSheet, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { color, font, shadow } from '@/theme/tokens'
import { useTheme } from '@/lib/theme-context'

/** Chip / filtre. Actif = dégradé accent blanc. Équivalent natif de `.fx-chip`. */
export function FxChip({
  label,
  active,
  onPress,
}: {
  label: string
  active?: boolean
  onPress?: () => void
}) {
  const { accent } = useTheme()
  if (active) {
    return (
      <Pressable onPress={onPress}>
        <LinearGradient colors={accent.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.chip, styles.active, { shadowColor: accent.acc }]}>
          <Text style={[styles.txt, { color: color.white }]}>{label}</Text>
        </LinearGradient>
      </Pressable>
    )
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, styles.idle, { opacity: pressed ? 0.8 : 1 }]}>
      <Text style={[styles.txt, { color: color.inkSoft }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
  idle: { backgroundColor: color.glass2, borderWidth: 1, borderColor: color.hair2 },
  active: { ...shadow.xs, shadowColor: color.acc },
  txt: { fontFamily: font.bodySemi, fontSize: 13 },
})
