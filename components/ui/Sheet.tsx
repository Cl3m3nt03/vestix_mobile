import { ReactNode, useEffect } from 'react'
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View,
  useWindowDimensions,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  Extrapolation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated'
import { color, font, radius } from '@/theme/tokens'
import { tapLight } from '@/lib/haptics'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const SPRING = { damping: 24, stiffness: 240, mass: 0.7 }
/** Distance / vitesse de drag au-delà desquelles on ferme. */
const DISMISS_DIST = 120
const DISMISS_VEL = 800

/**
 * Feuille modale par le bas (équivalent natif de `.fx-sheet` / modaux web).
 * Entrée en ressort, backdrop qui fond progressivement, **swipe-down pour
 * fermer** (drag sur la poignée). Hauteur auto-ajustée au contenu (cap 88 %).
 * Backdrop tap = fermeture. `leading` = élément optionnel à gauche du titre.
 *
 * - `bodyScroll: false` désactive la ScrollView interne (chat qui gère son
 *   propre scroll + input bar fixe en bas).
 * - `fullHeight: true` force le panel à 88 % de la hauteur (écrans denses).
 */
export function Sheet({
  visible, onClose, title, children, leading, bodyScroll = true, fullHeight,
}: {
  visible: boolean
  onClose: () => void
  title: string
  children: ReactNode
  leading?: ReactNode
  bodyScroll?: boolean
  fullHeight?: boolean
}) {
  const insets = useSafeAreaInsets()
  const { height: screenH } = useWindowDimensions()
  const ty = useSharedValue(screenH) // translateY du panel — démarre hors écran

  useEffect(() => {
    // Ouvre en ressort ; à la fermeture (parent qui passe visible=false sans
    // l'anim de sortie), on replace le panel hors écran pour la prochaine ouverture.
    if (visible) ty.value = withSpring(0, SPRING)
    else ty.value = screenH
  }, [visible])

  // Ferme en animant le panel vers le bas, PUIS notifie le parent.
  const animateClose = () => {
    ty.value = withTiming(screenH, { duration: 220 }, (done) => {
      if (done) runOnJS(onClose)()
    })
  }
  const closeWithHaptic = () => {
    tapLight()
    animateClose()
  }

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      ty.value = Math.max(0, e.translationY) // drag vers le bas uniquement
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DIST || e.velocityY > DISMISS_VEL) {
        ty.value = withTiming(screenH, { duration: 200 }, (done) => {
          if (done) runOnJS(onClose)()
        })
      } else {
        ty.value = withSpring(0, SPRING) // pas assez loin → revient
      }
    })

  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }))
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ty.value, [0, screenH], [1, 0], Extrapolation.CLAMP),
  }))

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={animateClose} statusBarTranslucent>
      <GestureHandlerRootView style={styles.fill}>
        <AnimatedPressable style={[styles.backdrop, backdropStyle]} onPress={closeWithHaptic} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[styles.panel, { paddingBottom: 16 + insets.bottom }, fullHeight && styles.panelFull, panelStyle]}
          >
            <GestureDetector gesture={pan}>
              <View style={styles.gripZone}>
                <View style={styles.grip} />
              </View>
            </GestureDetector>
            <View style={styles.head}>
              <View style={styles.headLeft}>
                {leading}
                <Text style={styles.title}>{title}</Text>
              </View>
              <Pressable onPress={closeWithHaptic} style={styles.close} hitSlop={8}>
                <Feather name="x" size={18} color={color.inkSoft} />
              </Pressable>
            </View>
            {bodyScroll ? (
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {children}
              </ScrollView>
            ) : (
              <View style={styles.bodyFlex}>{children}</View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,40,33,0.40)' },
  kav: { flex: 1, justifyContent: 'flex-end' },
  panel: {
    backgroundColor: '#f4f8f5',
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 18, paddingTop: 6, maxHeight: '88%',
    // ombre haute douce — détache le panel du dashboard derrière
    shadowColor: '#0b2018', shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.22, shadowRadius: 28, elevation: 24,
  },
  panelFull: { height: '88%' },
  bodyFlex: { flex: 1, minHeight: 0 },
  // Zone de drag élargie autour de la poignée (cible tactile confortable).
  gripZone: { alignSelf: 'stretch', alignItems: 'center', paddingTop: 8, paddingBottom: 10 },
  grip: { width: 40, height: 5, borderRadius: 3, backgroundColor: color.hair },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  title: { fontFamily: font.display, fontSize: 19, color: color.ink, flexShrink: 1 },
  close: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: color.glass,
  },
})
