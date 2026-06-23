import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { AddButton } from '@/components/ui/AddButton'
import { FxCard } from '@/components/ui/FxCard'
import { AddTransaction } from '@/components/forms/AddTransaction'
import { useTransactions } from '@/lib/queries'
import type { TxType } from '@/lib/types'
import { eur, dateFr } from '@/lib/format'
import { color, font } from '@/theme/tokens'

const TX: Record<TxType, { label: string; icon: keyof typeof Feather.glyphMap; color: string; sign: number }> = {
  BUY:        { label: 'Achat',      icon: 'arrow-down-left',  color: color.acc,  sign: -1 },
  SELL:       { label: 'Vente',      icon: 'arrow-up-right',   color: color.up,   sign: 1 },
  DEPOSIT:    { label: 'Dépôt',      icon: 'plus',             color: color.up,   sign: 1 },
  WITHDRAWAL: { label: 'Retrait',    icon: 'minus',            color: color.down, sign: -1 },
  DIVIDEND:   { label: 'Dividende',  icon: 'gift',             color: color.pop,  sign: 1 },
}

export default function Transactions() {
  const q = useTransactions()
  const [add, setAdd] = useState(false)

  return (
    <AppShell>
      <AddTransaction visible={add} onClose={() => setAdd(false)} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} tintColor={color.acc} />}
      >
        <ScreenHeader eyebrow="VESTIX" title="Transactions" right={<AddButton onPress={() => setAdd(true)} />} />

        {q.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
        ) : q.error ? (
          <FxCard><Text style={styles.err}>{String((q.error as Error).message)}</Text></FxCard>
        ) : !q.data!.length ? (
          <FxCard><Text style={styles.muted}>Aucune transaction.</Text></FxCard>
        ) : (
          <FxCard>
            {q.data!.map((t, i) => {
              const meta = TX[t.type]
              const total = (t.price + (t.fees ?? 0)) * (t.quantity ?? 1)
              return (
                <View key={t.id} style={[styles.row, i > 0 && styles.border]}>
                  <View style={[styles.ico, { backgroundColor: meta.color + '22' }]}>
                    <Feather name={meta.icon} size={17} color={meta.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>
                      {meta.label}{t.symbol ? ` · ${t.symbol}` : ''}
                    </Text>
                    <Text style={styles.sub}>{dateFr(t.date)}{t.quantity ? ` · ${t.quantity} @ ${eur(t.price, 2)}` : ''}</Text>
                  </View>
                  <Text style={[styles.amt, { color: meta.sign > 0 ? color.up : color.ink }]}>
                    {meta.sign > 0 ? '+' : '−'}{eur(total, 2)}
                  </Text>
                </View>
              )
            })}
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
  err: { fontFamily: font.bodyMed, fontSize: 13.5, color: color.down },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  ico: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink },
  sub: { fontFamily: font.mono, fontSize: 10.5, color: color.inkFaint, marginTop: 2 },
  amt: { fontFamily: font.bodySemi, fontSize: 14.5, fontVariant: ['tabular-nums'] },
})
