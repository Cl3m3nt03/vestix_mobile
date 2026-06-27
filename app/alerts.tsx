import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { AddButton } from '@/components/ui/AddButton'
import { FxCard } from '@/components/ui/FxCard'
import { FxButton } from '@/components/ui/FxButton'
import { FxBadge } from '@/components/ui/FxBadge'
import { Sheet } from '@/components/ui/Sheet'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { useAlerts, useAddAlert, useDeleteAlert } from '@/lib/queries'
import { eur } from '@/lib/format'
import { ApiError } from '@/lib/api'
import { useTheme } from '@/lib/theme-context'
import { color, font } from '@/theme/tokens'

export default function Alerts() {
  const router = useRouter()
  const { accent } = useTheme()
  const q = useAlerts()
  const add = useAddAlert()
  const del = useDeleteAlert()
  const [open, setOpen] = useState(false)
  const [symbol, setSymbol] = useState('')
  const [condition, setCondition] = useState<'above' | 'below'>('above')
  const [target, setTarget] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    setErr(null)
    if (!symbol.trim()) { setErr('Symbole requis'); return }
    try {
      await add.mutateAsync({ symbol: symbol.trim().toUpperCase(), condition, target: Number(target.replace(',', '.')) || 0, currency: 'EUR' })
      setOpen(false); setSymbol(''); setTarget('')
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Échec')
    }
  }

  return (
    <AppShell>
      <Sheet visible={open} onClose={() => setOpen(false)} title="Nouvelle alerte">
        <Field label="Symbole" placeholder="BTC, AAPL…" autoCapitalize="characters" value={symbol} onChangeText={setSymbol} />
        <Select label="Condition" value={condition} onChange={setCondition}
          options={[{ value: 'above', label: 'Au-dessus de' }, { value: 'below', label: 'En-dessous de' }]} />
        <Field label="Prix cible" placeholder="0" keyboardType="decimal-pad" value={target} onChangeText={setTarget} />
        {err ? <Text style={styles.err}>{err}</Text> : null}
        <FxButton label={add.isPending ? '...' : 'Créer l’alerte'} onPress={submit} style={{ marginTop: 4 }} />
      </Sheet>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="VESTIX" title="Alertes" onBack={() => router.back()} right={<AddButton onPress={() => setOpen(true)} />} />

        {q.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={accent.acc} /></View>
        ) : q.error ? (
          <FxCard><Text style={styles.err}>{String((q.error as Error).message)}</Text></FxCard>
        ) : !q.data!.length ? (
          <FxCard><Text style={styles.muted}>Aucune alerte. Touche + pour surveiller un cours.</Text></FxCard>
        ) : (
          <FxCard>
            {q.data!.map((a, i) => (
              <View key={a.id} style={[styles.row, i > 0 && styles.border]}>
                <View style={[styles.ico, { backgroundColor: (a.condition === 'above' ? color.up : color.down) + '22' }]}>
                  <Feather name={a.condition === 'above' ? 'trending-up' : 'trending-down'} size={17}
                    color={a.condition === 'above' ? color.up : color.down} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sym}>{a.symbol}</Text>
                  <Text style={styles.cond}>{a.condition === 'above' ? '≥' : '≤'} {eur(a.target, 2)}</Text>
                </View>
                {a.triggered ? <FxBadge label="Déclenchée" tone="premium" /> : null}
                <Pressable onPress={() => del.mutate(a.id)} hitSlop={8} style={{ marginLeft: 10 }}>
                  <Feather name="trash-2" size={18} color={color.inkFaint} />
                </Pressable>
              </View>
            ))}
          </FxCard>
        )}
        <View style={{ height: 16 }} />
      </ScrollView>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
  center: { paddingVertical: 60, alignItems: 'center' },
  muted: { fontFamily: font.body, fontSize: 13.5, color: color.inkSoft },
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  ico: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  sym: { fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink },
  cond: { fontFamily: font.mono, fontSize: 11, color: color.inkFaint, marginTop: 2 },
})
