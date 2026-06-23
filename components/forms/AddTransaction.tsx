import { useState } from 'react'
import { Text, StyleSheet } from 'react-native'
import { Sheet } from '@/components/ui/Sheet'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { FxButton } from '@/components/ui/FxButton'
import { useAddTransaction } from '@/lib/queries'
import type { TxType } from '@/lib/types'
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

export function AddTransaction({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const add = useAddTransaction()
  const [type, setType] = useState<TxType>('BUY')
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [fees, setFees] = useState('')
  const [date, setDate] = useState(today())
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    setErr(null)
    try {
      await add.mutateAsync({
        type,
        symbol: symbol.trim() || undefined,
        quantity: quantity ? Number(quantity.replace(',', '.')) : undefined,
        price: Number(price.replace(',', '.')) || 0,
        fees: fees ? Number(fees.replace(',', '.')) : 0,
        currency: 'EUR',
        date,
      })
      onClose()
      setSymbol(''); setQuantity(''); setPrice(''); setFees('')
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Échec de l’enregistrement')
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Nouvelle transaction">
      <Select label="Type" options={TYPES} value={type} onChange={setType} />
      <Field label="Symbole (optionnel)" placeholder="CW8, BTC…" autoCapitalize="characters" value={symbol} onChangeText={setSymbol} />
      <Field label="Quantité (optionnel)" placeholder="0" keyboardType="decimal-pad" value={quantity} onChangeText={setQuantity} />
      <Field label="Prix unitaire (€)" placeholder="0" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      <Field label="Frais (€)" placeholder="0" keyboardType="decimal-pad" value={fees} onChangeText={setFees} />
      <Field label="Date" placeholder="AAAA-MM-JJ" value={date} onChangeText={setDate} />
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FxButton label={add.isPending ? '...' : 'Enregistrer'} onPress={submit} style={{ marginTop: 4 }} />
    </Sheet>
  )
}

const styles = StyleSheet.create({
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginBottom: 8 },
})
