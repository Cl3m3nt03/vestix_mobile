import { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useTheme } from '@/lib/theme-context'

/**
 * Coquille globale : reproduit le fond dégradé émeraude/bleu/crème du web
 * (radial 12%/100% + base) + des « blobs » flous STATIQUES (jamais animés —
 * cf. incident perf glassmorphism du web).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { accent } = useTheme()
  return (
    <LinearGradient
      colors={accent.bg}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.fill}
    >
      {/* blobs décoratifs statiques — teintés selon le thème */}
      <View pointerEvents="none" style={[styles.blob, styles.b1, { backgroundColor: accent.blob[0] }]} />
      <View pointerEvents="none" style={[styles.blob, styles.b2, { backgroundColor: accent.blob[1] }]} />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <Animated.View style={styles.fill} entering={FadeIn.duration(120)}>
          {children}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.45 },
  b1: { width: 360, height: 360, top: -120, left: -100 },
  b2: { width: 380, height: 380, top: -80, right: -120 },
})
