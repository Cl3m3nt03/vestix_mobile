import { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { color, font, radius } from '@/theme/tokens'

export interface TabItem<T extends string> {
  id: T
  label: string
  icon?: ReactNode
}

/**
 * Barre d'onglets segmentés (équivalent natif des `.fx-tab` du web). L'onglet
 * actif a un fond émeraude doux et un texte accentué.
 */
export function Tabs<T extends string>({
  items, value, onChange,
}: {
  items: TabItem<T>[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <View style={styles.bar}>
      {items.map((it) => {
        const active = it.id === value
        return (
          <Pressable
            key={it.id}
            onPress={() => onChange(it.id)}
            style={({ pressed }) => [
              styles.tab,
              active && styles.tabActive,
              pressed && !active && { opacity: 0.85 },
            ]}
          >
            {it.icon}
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
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
    gap: 6,
    padding: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: color.glassHi,
    backgroundColor: color.glass2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.sm - 4,
  },
  tabActive: { backgroundColor: color.accTint, borderWidth: 1, borderColor: color.accWash },
  label: { fontFamily: font.bodySemi, fontSize: 12.5, color: color.inkSoft },
  labelActive: { color: color.acc },
})
