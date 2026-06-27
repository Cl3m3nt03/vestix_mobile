import { useEffect } from 'react'
import { Platform, StyleSheet, Text, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated'
import { color, font, shadow } from '@/theme/tokens'
import { useTheme } from '@/lib/theme-context'
import { tapLight } from '@/lib/haptics'

export type NavItem = { key: string; label: string; icon: (active: boolean) => React.ReactNode }

const SPRING = { damping: 14, stiffness: 220, mass: 0.6 }

/** Un onglet — anim ressort de l'icône active + apparition du fond teinté. */
function NavSlot({ item, active, onPress }: { item: NavItem; active: boolean; onPress: () => void }) {
  const { accent } = useTheme()
  const a = useSharedValue(active ? 1 : 0)
  const press = useSharedValue(0)

  useEffect(() => {
    a.value = withSpring(active ? 1 : 0, SPRING)
  }, [active])

  // Fond teinté en couche séparée (opacité animée) → la teinte du thème
  // s'applique sans recalcul de chaîne rgba, et n'affecte pas l'icône.
  const bgStyle = useAnimatedStyle(() => ({ opacity: a.value }))
  const wrapStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(a.value, [0, 1], [1, 1.06]) * (1 - press.value * 0.12) },
      { translateY: interpolate(a.value, [0, 1], [0, -1]) },
    ],
  }))
  const lblStyle = useAnimatedStyle(() => ({
    opacity: interpolate(a.value, [0, 1], [0.85, 1]),
  }))

  return (
    <Pressable
      key={item.key}
      onPress={() => {
        tapLight()
        onPress()
      }}
      onPressIn={() => (press.value = withTiming(1, { duration: 90 }))}
      onPressOut={() => (press.value = withTiming(0, { duration: 140 }))}
      style={styles.slot}
    >
      <Animated.View style={[styles.iconWrap, wrapStyle]}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.iconBg, { backgroundColor: accent.accTint }, bgStyle]}
        />
        {item.icon(active)}
      </Animated.View>
      <Animated.Text
        style={[styles.lbl, lblStyle, { color: active ? accent.acc : color.inkSoft }]}
        numberOfLines={1}
      >
        {item.label}
      </Animated.Text>
    </Pressable>
  )
}

/**
 * Barre de navigation basse — reproduit le rail web en mode mobile (≤640px) :
 * 4 onglets primaires + « Plus ». Actif = teinte émeraude DISCRÈTE animée
 * (fond accTint en ressort, icône scale), + haptic léger au tap.
 */
export function BottomNav({
  items,
  active,
  onSelect,
}: {
  items: NavItem[]
  active: string
  onSelect: (key: string) => void
}) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.bar, { paddingBottom: 7 + insets.bottom }]}>
      {items.map((it) => (
        <NavSlot key={it.key} item={it} active={it.key === active} onPress={() => onSelect(it.key)} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: color.navBar,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: color.glassHi,
    paddingTop: 7,
    paddingHorizontal: 8,
    // iOS : ombre haute douce. Android : pas d'elevation (sinon halo carré
    // tout autour qui bave sur les coins arrondis du haut). Séparation = borderTop.
    ...Platform.select({
      ios: { ...shadow.lg, shadowOffset: { width: 0, height: -14 } },
      android: {},
    }),
  },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4 },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconBg: { borderRadius: 14 },
  lbl: { fontFamily: font.bodySemi, fontSize: 10, lineHeight: 12 },
})
