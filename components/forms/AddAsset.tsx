import { useState, useEffect } from 'react'
import { Text, StyleSheet, Alert } from 'react-native'
import { Sheet } from '@/components/ui/Sheet'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { FxButton } from '@/components/ui/FxButton'
import { useAddAsset, useEditAsset, useDeleteAsset } from '@/lib/queries'
import type { AssetType, Asset } from '@/lib/types'
import { ApiError } from '@/lib/api'
import { color, font } from '@/theme/tokens'

const TYPES: { value: AssetType; label: string }[] = [
  { value: 'STOCK', label: 'Actions' },
  { value: 'PEA', label: 'PEA' },
  { value: 'CTO', label: 'CTO' },
  { value: 'CRYPTO', label: 'Crypto' },
  { value: 'SAVINGS', label: 'Épargne' },
  { value: 'BANK_ACCOUNT', label: 'Banque' },
  { value: 'REAL_ESTATE', label: 'Immo' },
  { value: 'OTHER', label: 'Autre' },
]

export function AddAsset({
  visible, onClose, editing,
}: {
  visible: boolean
  onClose: () => void
  editing?: Asset | null
}) {
  const add = useAddAsset()
  const edit = useEditAsset()
  const del = useDeleteAsset()
  const [name, setName] = useState('')
  const [type, setType] = useState<AssetType>('SAVINGS')
  const [institution, setInstitution] = useState('')
  const [value, setValue] = useState('')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setType(editing.type)
      setInstitution(editing.institution ?? '')
      setValue(String(editing.value))
    } else {
      setName(''); setType('SAVINGS'); setInstitution(''); setValue('')
    }
  }, [editing, visible])

  const submit = async () => {
    setErr(null)
    if (!name.trim()) { setErr('Le nom est requis'); return }
    const body = {
      name: name.trim(),
      type,
      institution: institution.trim() || undefined,
      value: Number(value.replace(',', '.')) || 0,
      currency: 'EUR',
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
    <Sheet visible={visible} onClose={onClose} title={editing ? 'Modifier l’actif' : 'Nouvel actif'}>
      <Field label="Nom" placeholder="Livret A, Apple…" value={name} onChangeText={setName} />
      <Select label="Type" options={TYPES} value={type} onChange={setType} />
      <Field label="Établissement (optionnel)" placeholder="Boursorama…" value={institution} onChangeText={setInstitution} />
      <Field label="Valeur (€)" placeholder="0" keyboardType="decimal-pad" value={value} onChangeText={setValue} />
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FxButton label={pending ? '...' : 'Enregistrer'} onPress={submit} style={{ marginTop: 4 }} />
      {editing ? <FxButton label="Supprimer" variant="danger" onPress={confirmDelete} style={{ marginTop: 10 }} /> : null}
    </Sheet>
  )
}

const styles = StyleSheet.create({
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginBottom: 8 },
})
