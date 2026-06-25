import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { color } from '@/theme/tokens'

function Dot({ delay }: { delay: number }) {
  const op = useSharedValue(0.25)
  useEffect(() => {
    op.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }),
          withTiming(0.25, { duration: 380, easing: Easing.in(Easing.cubic) }),
        ),
        -1,
        false,
      ),
    )
  }, [delay, op])
  const style = useAnimatedStyle(() => ({ opacity: op.value }))
  return <Animated.View style={[styles.dot, style]} />
}

/** Trois points qui pulsent en cascade — indicateur « assistant tape… ». */
export function TypingDots() {
  return (
    <View style={styles.wrap}>
      <Dot delay={0} />
      <Dot delay={160} />
      <Dot delay={320} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: color.acc },
})
