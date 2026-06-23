import { Pressable, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { accentGradient, color, shadow } from '@/theme/tokens'

/** Bouton rond « + » (ajout rapide), dégradé émeraude. */
export function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <LinearGradient colors={accentGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        <Feather name="plus" size={22} color={color.white} />
      </LinearGradient>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', ...shadow.sm, shadowColor: color.acc },
})
