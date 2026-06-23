import { useState, useEffect } from 'react'
import { Text, StyleSheet, Alert } from 'react-native'
import { Sheet } from '@/components/ui/Sheet'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { FxButton } from '@/components/ui/FxButton'
import { useAddTransaction, useEditTransaction, useDeleteTransaction } from '@/lib/queries'
import type { TxType, Transaction } from '@/lib/types'
import { ApiError } from '@/lib/api'
import { color, font } from '@/theme/tokens'

const TYPES: { value: TxType; label: string }[] = [
  { value: 'BUY', label: 'Achat' },
  { value: 'SELL', label: 'Vente' },
  { value: 'DEPOSIT', label: 'Dépôt' },
  { value: 'WITHDRAWAL', label: 'Retrait' },
  { value: 'DIVIDEND', label: 'Dividende' },
]

const today = () => new Date().toISOString().slice(0, 10)

export function AddTransaction({
  visible, onClose, editing,
}: {
  visible: boolean
  onClose: () => void
  editing?: Transaction | null
}) {
  const add = useAddTransaction()
  const edit = useEditTransaction()
  const del = useDeleteTransaction()
  const [type, setType] = useState<TxType>('BUY')
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [fees, setFees] = useState('')
  const [date, setDate] = useState(today())
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setType(editing.type)
      setSymbol(editing.symbol ?? '')
      setQuantity(editing.quantity != null ? String(editing.quantity) : '')
      setPrice(String(editing.price))
      setFees(String(editing.fees ?? ''))
      setDate(editing.date.slice(0, 10))
    } else {
      setType('BUY'); setSymbol(''); setQuantity(''); setPrice(''); setFees(''); setDate(today())
    }
  }, [editing, visible])

  const submit = async () => {
    setErr(null)
    const body = {
      type,
      symbol: symbol.trim() || undefined,
      quantity: quantity ? Number(quantity.replace(',', '.')) : undefined,
      price: Number(price.replace(',', '.')) || 0,
      fees: fees ? Number(fees.replace(',', '.')) : 0,
      currency: 'EUR',
      date,
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
    Alert.alert('Supprimer', 'Supprimer cette transaction ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await del.mutateAsync(editing.id); onClose() } },
    ])
  }

  const pending = add.isPending || edit.isPending

  return (
    <Sheet visible={visible} onClose={onClose} title={editing ? 'Modifier la transaction' : 'Nouvelle transaction'}>
      <Select label="Type" options={TYPES} value={type} onChange={setType} />
      <Field label="Symbole (optionnel)" placeholder="CW8, BTC…" autoCapitalize="characters" value={symbol} onChangeText={setSymbol} />
      <Field label="Quantité (optionnel)" placeholder="0" keyboardType="decimal-pad" value={quantity} onChangeText={setQuantity} />
      <Field label="Prix unitaire (€)" placeholder="0" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      <Field label="Frais (€)" placeholder="0" keyboardType="decimal-pad" value={fees} onChangeText={setFees} />
      <Field label="Date" placeholder="AAAA-MM-JJ" value={date} onChangeText={setDate} />
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FxButton label={pending ? '...' : 'Enregistrer'} onPress={submit} style={{ marginTop: 4 }} />
      {editing ? <FxButton label="Supprimer" variant="danger" onPress={confirmDelete} style={{ marginTop: 10 }} /> : null}
    </Sheet>
  )
}

const styles = StyleSheet.create({
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginBottom: 8 },
})
