import { useState } from 'react'
import { Text, StyleSheet } from 'react-native'
import { Sheet } from '@/components/ui/Sheet'
import { Field } from '@/components/ui/Field'
import { FxButton } from '@/components/ui/FxButton'
import { useAddGoal } from '@/lib/queries'
import { ApiError } from '@/lib/api'
import { color, font } from '@/theme/tokens'

export function AddGoal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const add = useAddGoal()
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [date, setDate] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    setErr(null)
    if (!name.trim()) { setErr('Le nom est requis'); return }
    try {
      await add.mutateAsync({
        name: name.trim(),
        targetValue: Number(target.replace(',', '.')) || 0,
        currency: 'EUR',
        targetDate: date.trim() || undefined,
        expectedRate: 7,
      })
      onClose()
      setName(''); setTarget(''); setDate('')
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Échec de l’enregistrement')
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Nouvel objectif">
      <Field label="Nom" placeholder="Apport immo, Liberté financière…" value={name} onChangeText={setName} />
      <Field label="Montant cible (€)" placeholder="0" keyboardType="decimal-pad" value={target} onChangeText={setTarget} />
      <Field label="Date cible (optionnel)" placeholder="AAAA-MM-JJ" value={date} onChangeText={setDate} />
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FxButton label={add.isPending ? '...' : 'Enregistrer'} onPress={submit} style={{ marginTop: 4 }} />
    </Sheet>
  )
}

const styles = StyleSheet.create({
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginBottom: 8 },
})
