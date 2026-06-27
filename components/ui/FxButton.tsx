import { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { color, radius, shadow, font, accentGradient, dangerGradient } from '@/theme/tokens'
import { tapLight, tapMedium } from '@/lib/haptics'

type Variant = 'primary' | 'ghost' | 'danger'
type Size = 'md' | 'sm' | 'tiny'

/** Bouton — dégradé émeraude par défaut. Équivalent natif de `.fx-btn`. */
export function FxButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  style,
}: {
  label: string
  onPress?: () => void
  variant?: Variant
  size?: Size
  icon?: ReactNode
  style?: ViewStyle
}) {
  const h = size === 'tiny' ? 38 : size === 'sm' ? 44 : 46
  const px = size === 'tiny' ? 15 : size === 'sm' ? 18 : 20
  const r = size === 'tiny' ? 18 : 24

  // Haptic au tap : ghost = léger, primary/danger = medium (action engageante).
  const handlePress = onPress
    ? () => {
        variant === 'ghost' ? tapLight() : tapMedium()
        onPress()
      }
    : undefined

  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.base,
          styles.ghost,
          { height: h, paddingHorizontal: px, borderRadius: r, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
          style,
        ]}
      >
        {icon}
        <Text style={[styles.label, { color: color.ink }]}>{label}</Text>
      </Pressable>
    )
  }

  const colors = variant === 'danger' ? dangerGradient : accentGradient
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, styles.solid, { height: h, paddingHorizontal: px, borderRadius: r }]}
      >
        {icon}
        <Text style={[styles.label, { color: color.white }]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  solid: { ...shadow.sm, shadowColor: color.acc },
  ghost: {
    backgroundColor: color.glassStrong,
    borderWidth: 1,
    borderColor: color.glassHi,
    ...shadow.xs,
  },
  label: {
    fontFamily: font.bodySemi,
    fontSize: 14,
  },
})
