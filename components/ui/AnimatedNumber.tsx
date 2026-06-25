import { useEffect, useState } from 'react'
import { Text, TextStyle } from 'react-native'
import {
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated'

/**
 * Compteur animé : interpole de la valeur précédente vers `value` en `duration` ms.
 * Rend un Text natif (compatible numberOfLines / adjustsFontSizeToFit du parent).
 */
export function AnimatedNumber({
  value,
  format,
  duration = 700,
  style,
  numberOfLines,
  adjustsFontSizeToFit,
}: {
  value: number
  format: (n: number) => string
  duration?: number
  style?: TextStyle | TextStyle[]
  numberOfLines?: number
  adjustsFontSizeToFit?: boolean
}) {
  const sv = useSharedValue(value)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    sv.value = withTiming(value, { duration, easing: Easing.out(Easing.cubic) })
  }, [value, duration, sv])

  useAnimatedReaction(
    () => sv.value,
    (v) => runOnJS(setDisplay)(v),
    [],
  )

  return (
    <Text style={style} numberOfLines={numberOfLines} adjustsFontSizeToFit={adjustsFontSizeToFit}>
      {format(display)}
    </Text>
  )
}
