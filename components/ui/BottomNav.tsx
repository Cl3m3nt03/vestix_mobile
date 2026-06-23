import { StyleSheet, Text, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { color, font, shadow } from '@/theme/tokens'

export type NavItem = { key: string; label: string; icon: (active: boolean) => React.ReactNode }

/**
 * Barre de navigation basse — reproduit le rail web en mode mobile (≤640px) :
 * 4 onglets primaires + « Plus ». Actif = teinte émeraude DISCRÈTE
 * (fond accTint, texte acc), pas le gros pill dégradé du desktop.
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
      {items.map((it) => {
        const on = it.key === active
        return (
          <Pressable key={it.key} onPress={() => onSelect(it.key)} style={styles.slot}>
            <View style={[styles.iconWrap, on && styles.iconWrapOn]}>{it.icon(on)}</View>
            <Text style={[styles.lbl, { color: on ? color.acc : color.inkSoft }]} numberOfLines={1}>
              {it.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: color.glassStrong,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: color.glassHi,
    paddingTop: 7,
    paddingHorizontal: 8,
    ...shadow.lg,
    shadowOffset: { width: 0, height: -14 },
  },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4 },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapOn: { backgroundColor: color.accTint },
  lbl: { fontFamily: font.bodySemi, fontSize: 10, lineHeight: 12 },
})
