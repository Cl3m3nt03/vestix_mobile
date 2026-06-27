import { ReactNode } from 'react'
import { Pressable, StyleProp, ViewStyle } from 'react-native'
import { tapLight } from '@/lib/haptics'

/**
 * Zone tappable avec retour tactile cohérent : léger scale + baisse d'opacité
 * à l'appui (même feeling que FxButton) + haptic léger. Drop-in pour toute
 * row/carte cliquable, à la place d'un Pressable nu.
 *
 * `haptic={false}` pour désactiver la vibration (ex. listes très denses).
 * `scale` règle l'intensité du shrink (défaut 0.98).
 */
export function Touchable({
  children,
  onPress,
  style,
  haptic = true,
  scale = 0.98,
  disabled,
}: {
  children: ReactNode
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  haptic?: boolean
  scale?: number
  disabled?: boolean
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={
        onPress
          ? () => {
              if (haptic) tapLight()
              onPress()
            }
          : undefined
      }
      style={({ pressed }) => [
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? scale : 1 }] },
        style,
      ]}
    >
      {children}
    </Pressable>
  )
}
