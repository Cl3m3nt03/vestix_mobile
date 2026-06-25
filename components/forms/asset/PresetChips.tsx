import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { color, font, radius } from '@/theme/tokens'

export const SAVINGS_PRESETS = [
  { name: 'Livret A',       institution: "Caisse d'Épargne",  notes: 'Taux réglementé : 3,00 %' },
  { name: 'LDDS',           institution: 'Crédit Mutuel',     notes: 'Taux réglementé : 3,00 %' },
  { name: 'LEP',            institution: 'La Banque Postale', notes: 'Taux réglementé : 6,10 %' },
  { name: 'PEL',            institution: 'BNP Paribas',       notes: 'Plan Épargne Logement : 2,25 %' },
  { name: 'CEL',            institution: '',                   notes: "Compte Épargne Logement : 2,00 %" },
  { name: 'Assurance Vie',  institution: '',                   notes: 'Contrat multisupport' },
  { name: 'PEA',            institution: 'Boursorama',         notes: 'Plan Épargne en Actions' },
  { name: "Compte à terme", institution: '',                   notes: '' },
]

export const BANK_PRESETS = [
  'BNP Paribas', 'Société Générale', 'Crédit Agricole', 'Crédit Mutuel',
  "Caisse d'Épargne", 'La Banque Postale', 'LCL', 'CIC',
  'Boursorama', 'Fortuneo', 'Hello Bank!', 'N26', 'Revolut', 'Wise',
]

export const REAL_ESTATE_PRESETS = [
  { name: 'Résidence principale',  notes: "Estimation Meilleurs Agents / SeLoger" },
  { name: 'Investissement locatif', notes: '' },
  { name: 'SCPI',                   notes: 'Société Civile de Placement Immobilier' },
  { name: 'Local commercial',       notes: '' },
  { name: 'Terrain',                notes: '' },
  { name: 'Résidence secondaire',   notes: '' },
]

/** Grille de presets d'épargne (Livret A, LDDS…) — 2 colonnes. */
export function SavingsPresets({
  selectedName, onPick,
}: {
  selectedName: string
  onPick: (preset: typeof SAVINGS_PRESETS[number]) => void
}) {
  return (
    <View style={styles.grid2}>
      {SAVINGS_PRESETS.map((p) => {
        const active = selectedName === p.name
        return (
          <Pressable
            key={p.name}
            onPress={() => onPick(p)}
            style={({ pressed }) => [styles.cell, active && styles.cellActive, pressed && styles.cellPressed]}
          >
            <Text style={[styles.cellName, active && styles.cellNameActive]} numberOfLines={1}>{p.name}</Text>
            {active ? <Feather name="check" size={14} color={color.acc} /> : null}
          </Pressable>
        )
      })}
    </View>
  )
}

/** Rangée de chips de banques françaises. */
export function BankPresets({
  selected, onPick,
}: {
  selected: string
  onPick: (bank: string) => void
}) {
  return (
    <View style={styles.chipsRow}>
      {BANK_PRESETS.map((b) => {
        const active = selected === b
        return (
          <Pressable
            key={b}
            onPress={() => onPick(b)}
            style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.cellPressed]}
          >
            <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{b}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

/** Grille de presets de biens immobiliers — 2 colonnes. */
export function RealEstatePresets({
  selectedName, onPick,
}: {
  selectedName: string
  onPick: (preset: typeof REAL_ESTATE_PRESETS[number]) => void
}) {
  return (
    <View style={styles.grid2}>
      {REAL_ESTATE_PRESETS.map((p) => {
        const active = selectedName === p.name
        return (
          <Pressable
            key={p.name}
            onPress={() => onPick(p)}
            style={({ pressed }) => [styles.cell, active && styles.cellActive, pressed && styles.cellPressed]}
          >
            <Text style={[styles.cellName, active && styles.cellNameActive]} numberOfLines={1}>{p.name}</Text>
            {active ? <Feather name="check" size={14} color={color.acc} /> : null}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: {
    width: '48.5%',
    paddingHorizontal: 12, paddingVertical: 11,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: radius.sm, borderWidth: 1, borderColor: color.glassHi,
    backgroundColor: color.glass2,
  },
  cellActive: { borderColor: color.acc, backgroundColor: color.accTint },
  cellPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  cellName: { fontFamily: font.bodySemi, fontSize: 13, color: color.inkSoft, flex: 1 },
  cellNameActive: { color: color.acc },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 11, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1, borderColor: color.glassHi,
    backgroundColor: color.glass2,
  },
  chipActive: { borderColor: color.acc, backgroundColor: color.accTint },
  chipTxt: { fontFamily: font.bodyMed, fontSize: 11.5, color: color.inkSoft },
  chipTxtActive: { color: color.acc },
})
