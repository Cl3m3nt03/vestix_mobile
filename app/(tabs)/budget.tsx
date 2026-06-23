import { ActivityIndicator, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxKpi } from '@/components/ui/FxKpi'
import { useBudget } from '@/lib/queries'
import type { BudgetCategory } from '@/lib/types'
import { eur } from '@/lib/format'
import { color, font } from '@/theme/tokens'

const CATS: Record<BudgetCategory, { label: string; color: string }> = {
  needs:      { label: 'Besoins',        color: color.acc },
  wants:      { label: 'Envies',         color: color.pop },
  savings:    { label: 'Épargne',        color: color.d2 },
  investment: { label: 'Investissement', color: color.violet },
}

export default function Budget() {
  const q = useBudget()
  const items = q.data?.items ?? []
  const income = q.data?.income ?? 0
  const spent = items.reduce((s, it) => s + it.amount, 0)
  const left = income - spent

  return (
    <AppShell>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} tintColor={color.acc} />}
      >
        <ScreenHeader eyebrow="VESTIX" title="Budget" />

        {q.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
        ) : q.error ? (
          <FxCard><Text style={styles.err}>{String((q.error as Error).message)}</Text></FxCard>
        ) : (
          <>
            <View style={styles.kpis}>
              <FxKpi label="Revenu" value={eur(income)} />
              <FxKpi label="Reste" value={eur(left)} trend={{ dir: left >= 0 ? 'up' : 'down', text: `Dépensé ${eur(spent)}` }} />
            </View>

            {!items.length ? (
              <FxCard><Text style={styles.muted}>Aucun poste de budget. Ajoute-en depuis le web.</Text></FxCard>
            ) : (
              (Object.keys(CATS) as BudgetCategory[]).map((c) => {
                const list = items.filter((it) => it.category === c)
                if (!list.length) return null
                const sum = list.reduce((s, it) => s + it.amount, 0)
                return (
                  <FxCard key={c}>
                    <FxCardHeader title={CATS[c].label} sub={eur(sum)} />
                    {list.map((it, i) => (
                      <View key={it.id} style={[styles.row, i > 0 && styles.border]}>
                        <View style={[styles.dot, { backgroundColor: CATS[c].color }]} />
                        <Text style={styles.name} numberOfLines={1}>{it.label}</Text>
                        <Text style={styles.val}>{eur(it.amount)}</Text>
                      </View>
                    ))}
                  </FxCard>
                )
              })
            )}
          </>
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
  kpis: { flexDirection: 'row', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11 },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { flex: 1, fontFamily: font.bodyMed, fontSize: 14, color: color.ink },
  val: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink, fontVariant: ['tabular-nums'] },
})
