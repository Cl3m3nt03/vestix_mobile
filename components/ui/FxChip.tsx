import { Pressable, StyleSheet, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { color, font, accentGradient, shadow } from '@/theme/tokens'

/** Chip / filtre. Actif = dégradé émeraude blanc. Équivalent natif de `.fx-chip`. */
export function FxChip({
  label,
  active,
  onPress,
}: {
  label: string
  active?: boolean
  onPress?: () => void
}) {
  if (active) {
    return (
      <Pressable onPress={onPress}>
        <LinearGradient colors={accentGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.chip, styles.active]}>
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
