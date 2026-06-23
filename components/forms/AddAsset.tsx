import { useState } from 'react'
import { Text, StyleSheet } from 'react-native'
import { Sheet } from '@/components/ui/Sheet'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { FxButton } from '@/components/ui/FxButton'
import { useAddAsset } from '@/lib/queries'
import type { AssetType } from '@/lib/types'
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

export function AddAsset({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const add = useAddAsset()
  const [name, setName] = useState('')
  const [type, setType] = useState<AssetType>('SAVINGS')
  const [institution, setInstitution] = useState('')
  const [value, setValue] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    setErr(null)
    if (!name.trim()) { setErr('Le nom est requis'); return }
    try {
      await add.mutateAsync({
        name: name.trim(),
        type,
        institution: institution.trim() || undefined,
        value: Number(value.replace(',', '.')) || 0,
        currency: 'EUR',
      })
      onClose()
      setName(''); setInstitution(''); setValue('')
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Échec de l’enregistrement')
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Nouvel actif">
      <Field label="Nom" placeholder="Livret A, Apple…" value={name} onChangeText={setName} />
      <Select label="Type" options={TYPES} value={type} onChange={setType} />
      <Field label="Établissement (optionnel)" placeholder="Boursorama…" value={institution} onChangeText={setInstitution} />
      <Field label="Valeur (€)" placeholder="0" keyboardType="decimal-pad" value={value} onChangeText={setValue} />
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FxButton label={add.isPending ? '...' : 'Enregistrer'} onPress={submit} style={{ marginTop: 4 }} />
    </Sheet>
  )
}

const styles = StyleSheet.create({
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginBottom: 8 },
})
