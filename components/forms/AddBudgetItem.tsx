import { useState, useEffect } from 'react'
import { Text, StyleSheet, Alert } from 'react-native'
import { Sheet } from '@/components/ui/Sheet'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { FxButton } from '@/components/ui/FxButton'
import { useAddBudgetItem, useEditBudgetItem, useDeleteBudgetItem } from '@/lib/queries'
import type { BudgetCategory, BudgetItem } from '@/lib/types'
import { ApiError } from '@/lib/api'
import { color, font } from '@/theme/tokens'

const CATS: { value: BudgetCategory; label: string }[] = [
  { value: 'needs', label: 'Besoins' },
  { value: 'wants', label: 'Envies' },
  { value: 'savings', label: 'Épargne' },
  { value: 'investment', label: 'Investissement' },
]

export function AddBudgetItem({
  visible, onClose, editing,
}: {
  visible: boolean
  onClose: () => void
  editing?: BudgetItem | null
}) {
  const add = useAddBudgetItem()
  const edit = useEditBudgetItem()
  const del = useDeleteBudgetItem()
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<BudgetCategory>('needs')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setLabel(editing.label); setAmount(String(editing.amount)); setCategory(editing.category)
    } else {
      setLabel(''); setAmount(''); setCategory('needs')
    }
  }, [editing, visible])

  const submit = async () => {
    setErr(null)
    if (!label.trim()) { setErr('Le libellé est requis'); return }
    const body = { label: label.trim(), amount: Number(amount.replace(',', '.')) || 0, category, recurring: true }
    try {
      if (editing) await edit.mutateAsync({ id: editing.id, ...body })
      else await add.mutateAsync(body)
      onClose()
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Échec de l’enregistrement')
    }
  }

  const confirmDelete = () => {
    if (!editing) return
    Alert.alert('Supprimer', `Supprimer « ${editing.label} » ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await del.mutateAsync(editing.id); onClose() } },
    ])
  }

  const pending = add.isPending || edit.isPending

  return (
    <Sheet visible={visible} onClose={onClose} title={editing ? 'Modifier le poste' : 'Nouveau poste de budget'}>
      <Field label="Libellé" placeholder="Loyer, Courses…" value={label} onChangeText={setLabel} />
      <Field label="Montant (€)" placeholder="0" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
      <Select label="Catégorie" options={CATS} value={category} onChange={setCategory} />
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FxButton label={pending ? '...' : 'Enregistrer'} onPress={submit} style={{ marginTop: 4 }} />
      {editing ? <FxButton label="Supprimer" variant="danger" onPress={confirmDelete} style={{ marginTop: 10 }} /> : null}
    </Sheet>
  )
}

const styles = StyleSheet.create({
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginBottom: 8 },
})
