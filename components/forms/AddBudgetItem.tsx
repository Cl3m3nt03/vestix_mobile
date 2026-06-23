import { useState } from 'react'
import { Text, StyleSheet } from 'react-native'
import { Sheet } from '@/components/ui/Sheet'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { FxButton } from '@/components/ui/FxButton'
import { useAddBudgetItem } from '@/lib/queries'
import type { BudgetCategory } from '@/lib/types'
import { ApiError } from '@/lib/api'
import { color, font } from '@/theme/tokens'

const CATS: { value: BudgetCategory; label: string }[] = [
  { value: 'needs', label: 'Besoins' },
  { value: 'wants', label: 'Envies' },
  { value: 'savings', label: 'Épargne' },
  { value: 'investment', label: 'Investissement' },
]

export function AddBudgetItem({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const add = useAddBudgetItem()
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<BudgetCategory>('needs')
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    setErr(null)
    if (!label.trim()) { setErr('Le libellé est requis'); return }
    try {
      await add.mutateAsync({
        label: label.trim(),
        amount: Number(amount.replace(',', '.')) || 0,
        category,
        recurring: true,
      })
      onClose()
      setLabel(''); setAmount('')
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Échec de l’enregistrement')
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Nouveau poste de budget">
      <Field label="Libellé" placeholder="Loyer, Courses…" value={label} onChangeText={setLabel} />
      <Field label="Montant (€)" placeholder="0" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
      <Select label="Catégorie" options={CATS} value={category} onChange={setCategory} />
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FxButton label={add.isPending ? '...' : 'Enregistrer'} onPress={submit} style={{ marginTop: 4 }} />
    </Sheet>
  )
}

const styles = StyleSheet.create({
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginBottom: 8 },
})
