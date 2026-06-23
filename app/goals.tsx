import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { AddButton } from '@/components/ui/AddButton'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { AddGoal } from '@/components/forms/AddGoal'
import { useGoals, useStats } from '@/lib/queries'
import { eur, dateFr } from '@/lib/format'
import { color, font } from '@/theme/tokens'

export default function Goals() {
  const router = useRouter()
  const goals = useGoals()
  const stats = useStats()
  const [add, setAdd] = useState(false)
  const total = stats.data?.totalValue ?? 0

  return (
    <AppShell>
      <AddGoal visible={add} onClose={() => setAdd(false)} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={goals.isRefetching} onRefresh={goals.refetch} tintColor={color.acc} />}
      >
        <ScreenHeader eyebrow="VESTIX" title="Objectifs" onBack={() => router.back()} right={<AddButton onPress={() => setAdd(true)} />} />

        {goals.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
        ) : goals.error ? (
          <FxCard><Text style={styles.err}>{String((goals.error as Error).message)}</Text></FxCard>
        ) : !goals.data!.length ? (
          <FxCard><Text style={styles.muted}>Aucun objectif. Touche + pour en créer un.</Text></FxCard>
        ) : (
          goals.data!.map((g) => {
            const pct = g.targetValue > 0 ? Math.min(100, (total / g.targetValue) * 100) : 0
            return (
              <FxCard key={g.id}>
                <FxCardHeader title={g.name} sub={g.targetDate ? `Échéance ${dateFr(g.targetDate)}` : undefined} />
                <View style={styles.rowBetween}>
                  <Text style={styles.cur}>{eur(total)}</Text>
                  <Text style={styles.tgt}>/ {eur(g.targetValue)}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.pct}>{pct.toFixed(0)} %</Text>
              </FxCard>
            )
          })
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
  rowBetween: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  cur: { fontFamily: font.display, fontSize: 22, color: color.ink },
  tgt: { fontFamily: font.bodyMed, fontSize: 13.5, color: color.inkSoft },
  track: { height: 8, borderRadius: 6, backgroundColor: color.hair2, overflow: 'hidden', marginTop: 10 },
  fill: { height: '100%', borderRadius: 6, backgroundColor: color.acc },
  pct: { fontFamily: font.mono, fontSize: 11, color: color.acc, marginTop: 6 },
})
