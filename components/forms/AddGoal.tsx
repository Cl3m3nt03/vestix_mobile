import { useState, useEffect } from 'react'
import { Text, StyleSheet, Alert } from 'react-native'
import { Sheet } from '@/components/ui/Sheet'
import { Field } from '@/components/ui/Field'
import { FxButton } from '@/components/ui/FxButton'
import { useAddGoal, useEditGoal, useDeleteGoal } from '@/lib/queries'
import type { Goal } from '@/lib/types'
import { ApiError } from '@/lib/api'
import { color, font } from '@/theme/tokens'

export function AddGoal({
  visible, onClose, editing,
}: {
  visible: boolean
  onClose: () => void
  editing?: Goal | null
}) {
  const add = useAddGoal()
  const edit = useEditGoal()
  const del = useDeleteGoal()
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [date, setDate] = useState('')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setName(editing.name); setTarget(String(editing.targetValue)); setDate(editing.targetDate?.slice(0, 10) ?? '')
    } else {
      setName(''); setTarget(''); setDate('')
    }
  }, [editing, visible])

  const submit = async () => {
    setErr(null)
    if (!name.trim()) { setErr('Le nom est requis'); return }
    const body = {
      name: name.trim(),
      targetValue: Number(target.replace(',', '.')) || 0,
      currency: 'EUR',
      targetDate: date.trim() || undefined,
      expectedRate: 7,
    }
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
    Alert.alert('Supprimer', `Supprimer « ${editing.name} » ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await del.mutateAsync(editing.id); onClose() } },
    ])
  }

  const pending = add.isPending || edit.isPending

  return (
    <Sheet visible={visible} onClose={onClose} title={editing ? 'Modifier l’objectif' : 'Nouvel objectif'}>
      <Field label="Nom" placeholder="Apport immo, Liberté financière…" value={name} onChangeText={setName} />
      <Field label="Montant cible (€)" placeholder="0" keyboardType="decimal-pad" value={target} onChangeText={setTarget} />
      <Field label="Date cible (optionnel)" placeholder="AAAA-MM-JJ" value={date} onChangeText={setDate} />
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FxButton label={pending ? '...' : 'Enregistrer'} onPress={submit} style={{ marginTop: 4 }} />
      {editing ? <FxButton label="Supprimer" variant="danger" onPress={confirmDelete} style={{ marginTop: 10 }} /> : null}
    </Sheet>
  )
}

const styles = StyleSheet.create({
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginBottom: 8 },
})
