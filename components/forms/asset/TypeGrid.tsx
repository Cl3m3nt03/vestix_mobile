import { Pressable, StyleSheet, Text, View } from 'react-native'
import { color, font, radius, shadow } from '@/theme/tokens'
import { useTheme } from '@/lib/theme-context'
import { CAT, TYPE_EMOJI } from '@/lib/format'
import type { AssetType } from '@/lib/types'

const TYPES: AssetType[] = [
  'BANK_ACCOUNT', 'SAVINGS', 'REAL_ESTATE',
  'STOCK', 'CRYPTO', 'PEA',
  'CTO', 'LIABILITY', 'OTHER',
]

/** Phase 1 du wizard : grille 3×3 des types d'actif. */
export function TypeGrid({ value, onChange }: { value: AssetType | null; onChange: (t: AssetType) => void }) {
  const { accent } = useTheme()
  return (
    <View style={styles.grid}>
      {TYPES.map((t) => {
        const active = value === t
        return (
          <Pressable
            key={t}
            onPress={() => onChange(t)}
            style={({ pressed }) => [
              styles.cell,
              active && [styles.cellActive, { borderColor: accent.acc, backgroundColor: accent.accTint, shadowColor: accent.acc }],
              pressed && styles.cellPressed,
            ]}
          >
            <View style={[styles.iconBox, active && { backgroundColor: accent.accWash }]}>
              <Text style={styles.icon}>{TYPE_EMOJI[t]}</Text>
            </View>
            <Text style={[styles.label, active && { color: accent.acc }]}>{CAT[t].label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.glassHi,
    backgroundColor: color.glass2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  cellActive: {
    borderColor: color.acc,
    backgroundColor: color.accTint,
    ...shadow.xs,
    shadowColor: color.acc,
  },
  cellPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  iconBox: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: color.white,
  },
  iconBoxActive: { backgroundColor: color.accWash },
  icon: { fontSize: 24, lineHeight: 28 },
  label: { fontFamily: font.bodySemi, fontSize: 11.5, color: color.inkSoft, textAlign: 'center' },
  labelActive: { color: color.acc },
})
