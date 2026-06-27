import { Pressable, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { color, shadow } from '@/theme/tokens'
import { useTheme } from '@/lib/theme-context'
import { tapLight } from '@/lib/haptics'

/** Bouton rond « + » (ajout rapide), dégradé accent. */
export function AddButton({ onPress }: { onPress: () => void }) {
  const { accent } = useTheme()
  return (
    <Pressable
      onPress={() => {
        tapLight()
        onPress()
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] })}
    >
      <LinearGradient colors={accent.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.btn, { shadowColor: accent.acc }]}>
        <Feather name="plus" size={22} color={color.white} />
      </LinearGradient>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', ...shadow.sm },
})
