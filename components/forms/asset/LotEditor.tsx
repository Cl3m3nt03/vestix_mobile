import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { color, font, radius } from '@/theme/tokens'
import { eur } from '@/lib/format'

/** Un lot = un achat. Conservé individuellement (rachats successifs). */
export interface LotDraft {
  id?: string
  quantity: string
  avgBuyPrice: string
  buyDate: string
}

/**
 * Éditeur multi-lots d'un actif financier (équivalent natif de l'éditeur web).
 * Affiche les nouveaux lots toujours, et regroupe les anciens (id) sous un
 * collapsible.
 */
export function LotEditor({
  lots, currency, onChange,
}: {
  lots: LotDraft[]
  currency: string
  onChange: (lots: LotDraft[]) => void
}) {
  const [showOld, setShowOld] = useState(false)

  const updateLot = (i: number, patch: Partial<LotDraft>) =>
    onChange(lots.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  const addLot = () =>
    onChange([{ quantity: '', avgBuyPrice: '', buyDate: '' }, ...lots])
  const removeLot = (i: number) => {
    if (lots.length <= 1) return
    onChange(lots.filter((_, idx) => idx !== i))
  }

  const newLots = lots.map((l, i) => ({ l, i })).filter((x) => !x.l.id)
  const oldLots = lots.map((l, i) => ({ l, i })).filter((x) => x.l.id)

  const totalQty = lots.reduce((s, l) => s + (parseFloat(l.quantity) || 0), 0)
  const invested = lots.reduce((s, l) => s + (parseFloat(l.quantity) || 0) * (parseFloat(l.avgBuyPrice) || 0), 0)
  const weightedPru = totalQty > 0 ? invested / totalQty : 0

  const renderLot = (lot: LotDraft, i: number, label: string) => (
    <View key={lot.id ?? `new-${i}`} style={styles.lotCard}>
      <View style={styles.lotHead}>
        <Text style={styles.lotLabel}>{label}</Text>
        <Pressable
          onPress={() => removeLot(i)}
          disabled={lots.length <= 1}
          hitSlop={6}
          style={[styles.trash, lots.length <= 1 && styles.trashDisabled]}
        >
          <Feather name="trash-2" size={14} color={color.down} />
        </Pressable>
      </View>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.tinyLabel}>Quantité</Text>
          <TextInput
            value={lot.quantity}
            onChangeText={(v) => updateLot(i, { quantity: v })}
            placeholder="0.00"
            placeholderTextColor={color.inkFaint}
            keyboardType="decimal-pad"
            style={styles.input}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tinyLabel}>PRU</Text>
          <TextInput
            value={lot.avgBuyPrice}
            onChangeText={(v) => updateLot(i, { avgBuyPrice: v })}
            placeholder="0.00"
            placeholderTextColor={color.inkFaint}
            keyboardType="decimal-pad"
            style={styles.input}
          />
        </View>
      </View>
      <View>
        <Text style={styles.tinyLabel}>Date d'achat <Text style={styles.optional}>(optionnel)</Text></Text>
        <TextInput
          value={lot.buyDate}
          onChangeText={(v) => updateLot(i, { buyDate: v })}
          placeholder="AAAA-MM-JJ"
          placeholderTextColor={color.inkFaint}
          style={styles.input}
        />
      </View>
    </View>
  )

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.headLabel}>
          Lots{lots.length > 1 ? <Text style={styles.headCount}> · {lots.length}</Text> : null}
        </Text>
        <Pressable onPress={addLot} hitSlop={6} style={styles.addBtn}>
          <Feather name="plus" size={13} color={color.acc} />
          <Text style={styles.addTxt}>Ajouter un lot</Text>
        </Pressable>
      </View>

      {newLots.length > 0 && (
        <View style={styles.lotList}>
          {newLots.map(({ l, i }) => renderLot(l, i, 'Nouveau lot'))}
        </View>
      )}

      {oldLots.length > 0 && (
        <>
          <Pressable
            onPress={() => setShowOld((v) => !v)}
            style={({ pressed }) => [styles.toggleOld, pressed && { opacity: 0.85 }]}
          >
            <Feather name={showOld ? 'chevron-up' : 'chevron-down'} size={13} color={color.inkSoft} />
            <Text style={styles.toggleOldTxt}>
              {showOld ? 'Masquer' : 'Afficher'} les {oldLots.length} lot{oldLots.length > 1 ? 's' : ''} existant{oldLots.length > 1 ? 's' : ''}
            </Text>
          </Pressable>
          {showOld && (
            <View style={styles.lotList}>
              {oldLots.map(({ l, i }, idx) => renderLot(l, i, `Lot ${idx + 1}`))}
            </View>
          )}
        </>
      )}

      {totalQty > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>
            Position consolidée · {lots.length} lot{lots.length > 1 ? 's' : ''}
          </Text>
          <Text style={styles.summaryValue}>
            {totalQty.toLocaleString('fr-FR')} × {eur(weightedPru, 2)}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headLabel: { fontFamily: font.bodyMed, fontSize: 13, color: color.inkSoft },
  headCount: { color: color.inkFaint, fontFamily: font.body },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addTxt: { fontFamily: font.bodySemi, fontSize: 12, color: color.acc },
  lotList: { gap: 8 },
  lotCard: {
    backgroundColor: color.glass2, borderWidth: 1, borderColor: color.glassHi,
    borderRadius: radius.sm, padding: 10, gap: 8,
  },
  lotHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lotLabel: { fontFamily: font.monoSemi, fontSize: 10, color: color.inkFaint, letterSpacing: 0.6, textTransform: 'uppercase' },
  trash: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  trashDisabled: { opacity: 0.3 },
  row: { flexDirection: 'row', gap: 8 },
  tinyLabel: { fontFamily: font.mono, fontSize: 10, color: color.inkFaint, marginBottom: 4 },
  optional: { fontFamily: font.body, textTransform: 'none' },
  input: {
    height: 40, paddingHorizontal: 10, borderRadius: 10,
    borderWidth: 1, borderColor: color.glassHi, backgroundColor: color.white,
    fontFamily: font.mono, fontSize: 13, color: color.ink,
  },
  toggleOld: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1, borderColor: color.glassHi,
    backgroundColor: color.glass2,
  },
  toggleOldTxt: { fontFamily: font.bodySemi, fontSize: 11.5, color: color.inkSoft },
  summary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: color.accTint, borderWidth: 1, borderColor: color.acc,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.sm,
  },
  summaryLabel: { fontFamily: font.bodyMed, fontSize: 12, color: color.acc3 },
  summaryValue: { fontFamily: font.monoSemi, fontSize: 12.5, color: color.acc },
})
