import { ActivityIndicator, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { LineChart, Series } from '@/components/ui/LineChart'
import { usePerformance } from '@/lib/queries'
import { color, font } from '@/theme/tokens'

export default function Performance() {
  const router = useRouter()
  const q = usePerformance(24)

  const last = (pts?: { value: number }[]) => (pts?.length ? pts[pts.length - 1].value : 0)
  const series: Series[] = q.data
    ? [
        { label: 'Mon portefeuille', color: color.acc, points: q.data.portfolio },
        { label: 'CAC 40', color: color.info, points: q.data.cac40 },
        { label: 'S&P 500', color: color.pop, points: q.data.sp500 },
        { label: 'MSCI World', color: color.violet, points: q.data.msciWorld },
      ]
    : []

  return (
    <AppShell>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} tintColor={color.acc} />}
      >
        <ScreenHeader eyebrow="VESTIX" title="Performance" onBack={() => router.back()} />

        {q.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
        ) : q.error ? (
          <FxCard><Text style={styles.err}>{String((q.error as Error).message)}</Text></FxCard>
        ) : (
          <>
            <FxCard>
              <FxCardHeader title="Mon portefeuille vs indices" sub="24 MOIS · % DE VARIATION" />
              <LineChart series={series} />
            </FxCard>
            <View style={styles.kpis}>
              {series.map((s) => (
                <FxCard key={s.label} style={styles.kpi}>
                  <Text style={styles.kpiLabel}>{s.label}</Text>
                  <Text style={[styles.kpiVal, { color: last(s.points) >= 0 ? color.up : color.down }]}>
                    {last(s.points) >= 0 ? '+' : ''}{last(s.points).toFixed(1)} %
                  </Text>
                </FxCard>
              ))}
            </View>
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
  err: { fontFamily: font.bodyMed, fontSize: 13.5, color: color.down },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpi: { flexBasis: '47%', flexGrow: 1, padding: 16 },
  kpiLabel: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: color.inkFaint },
  kpiVal: { fontFamily: font.display, fontSize: 20, marginTop: 6, fontVariant: ['tabular-nums'] },
})
