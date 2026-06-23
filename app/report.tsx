import { ActivityIndicator, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxKpi } from '@/components/ui/FxKpi'
import { Donut, Slice } from '@/components/ui/Donut'
import { useStats, usePerformance, useFiscal, useAssets } from '@/lib/queries'
import type { AssetType } from '@/lib/types'
import { eur, CAT } from '@/lib/format'
import { color, font } from '@/theme/tokens'

export default function Report() {
  const router = useRouter()
  const stats = useStats()
  const perf = usePerformance(12)
  const fiscal = useFiscal()
  const assets = useAssets()

  const loading = stats.isLoading || assets.isLoading
  const refetch = () => { stats.refetch(); perf.refetch(); fiscal.refetch(); assets.refetch() }
  const refreshing = stats.isRefetching || perf.isRefetching || fiscal.isRefetching

  const slices: Slice[] = stats.data
    ? (Object.entries(stats.data.breakdown) as [AssetType, number][])
        .filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
        .map(([k, v]) => ({ label: CAT[k].label, value: v, color: CAT[k].color }))
    : []

  const perfLast = perf.data?.portfolio?.length ? perf.data.portfolio[perf.data.portfolio.length - 1].value : null
  const topAssets = [...(assets.data ?? [])].sort((a, b) => b.value - a.value).slice(0, 5)

  return (
    <AppShell>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={color.acc} />}
      >
        <ScreenHeader eyebrow="VESTIX" title="Rapport" onBack={() => router.back()} />

        {loading ? (
          <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
        ) : (
          <>
            <View style={styles.kpis}>
              <FxKpi label="Patrimoine" value={eur(stats.data?.totalValue ?? 0)} />
              <FxKpi label="Plus-value"
                value={`${(stats.data?.totalPnl ?? 0) >= 0 ? '+' : ''}${eur(stats.data?.totalPnl ?? 0)}`}
                trend={{ dir: (stats.data?.totalPnl ?? 0) >= 0 ? 'up' : 'down', text: `${(stats.data?.totalPnlPercent ?? 0).toFixed(1)} %` }} />
            </View>

            {perfLast != null ? (
              <View style={styles.kpis}>
                <FxKpi label="Perf 12 mois" value={`${perfLast >= 0 ? '+' : ''}${perfLast.toFixed(1)} %`} />
                <FxKpi label="Passif" value={eur(stats.data?.liabilities ?? 0)} />
              </View>
            ) : null}

            {slices.length ? (
              <FxCard>
                <FxCardHeader title="Répartition" sub="PAR CLASSE" />
                <Donut centerValue={eur(stats.data!.totalValue)} centerLabel="Total" slices={slices} />
              </FxCard>
            ) : null}

            {fiscal.data ? (
              <FxCard>
                <FxCardHeader title={`Fiscalité ${fiscal.data.year}`} sub="ESTIMATION" />
                <Row label="Plus-values réalisées" value={eur(fiscal.data.plusValues.total)} />
                <Row label="Dividendes" value={eur(fiscal.data.dividends.total)} />
                <Row label="Impôt estimé (PFU)" value={eur(fiscal.data.tax.pfuAmount)} strong />
              </FxCard>
            ) : null}

            {topAssets.length ? (
              <FxCard>
                <FxCardHeader title="Top actifs" sub={`${topAssets.length}`} />
                {topAssets.map((a, i) => (
                  <View key={a.id} style={[styles.row, i > 0 && styles.border]}>
                    <Text style={styles.name} numberOfLines={1}>{a.name}</Text>
                    <Text style={styles.val}>{eur(a.value)}</Text>
                  </View>
                ))}
              </FxCard>
            ) : null}
          </>
        )}
        <View style={{ height: 16 }} />
      </ScrollView>
    </AppShell>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.kvRow}>
      <Text style={styles.k}>{label}</Text>
      <Text style={[styles.v, strong && { fontFamily: font.display }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
  center: { paddingVertical: 60, alignItems: 'center' },
  kpis: { flexDirection: 'row', gap: 12 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  k: { fontFamily: font.body, fontSize: 14, color: color.inkSoft },
  v: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 11 },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  name: { flex: 1, fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  val: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink, fontVariant: ['tabular-nums'] },
})
