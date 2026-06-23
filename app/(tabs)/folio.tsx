import { ActivityIndicator, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxPill } from '@/components/ui/FxPill'
import { Donut, Slice } from '@/components/ui/Donut'
import { useStats, useAssets } from '@/lib/queries'
import type { AssetType } from '@/lib/types'
import { eur, CAT } from '@/lib/format'
import { color, font } from '@/theme/tokens'

export default function Folio() {
  const stats = useStats()
  const assets = useAssets()
  const loading = stats.isLoading || assets.isLoading
  const error = stats.error || assets.error
  const refreshing = stats.isRefetching || assets.isRefetching
  const refetch = () => { stats.refetch(); assets.refetch() }

  const slices: Slice[] = stats.data
    ? (Object.entries(stats.data.breakdown) as [AssetType, number][])
        .filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
        .map(([k, v]) => ({ label: CAT[k].label, value: v, color: CAT[k].color }))
    : []

  return (
    <AppShell>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={color.acc} />}
      >
        <ScreenHeader eyebrow="VESTIX" title="Portefeuille" />

        {loading ? (
          <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
        ) : error ? (
          <FxCard><Text style={styles.err}>{String((error as Error).message)}</Text></FxCard>
        ) : (
          <>
            <FxCard>
              <FxCardHeader title="Répartition" sub={eur(stats.data!.totalValue)} />
              {slices.length ? <Donut centerValue={eur(stats.data!.totalValue)} centerLabel="Total" slices={slices} />
                : <Text style={styles.muted}>Aucun actif.</Text>}
            </FxCard>

            <FxCard>
              <FxCardHeader title="Tous les actifs" sub={`${assets.data!.length} LIGNES`} />
              {assets.data!.map((a, i) => {
                const cat = CAT[a.type] ?? CAT.OTHER
                const pnl = a.holdings?.[0]?.pnlPercentEur
                return (
                  <View key={a.id} style={[styles.row, i > 0 && styles.border]}>
                    <View style={[styles.logo, { backgroundColor: cat.color + '22' }]}>
                      <Text style={[styles.logoTxt, { color: cat.color }]}>{a.name.slice(0, 3).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name} numberOfLines={1}>{a.name}</Text>
                      <Text style={styles.cat}>{cat.label}{a.institution ? ` · ${a.institution}` : ''}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={styles.val}>{eur(a.value)}</Text>
                      {typeof pnl === 'number' ? <FxPill dir={pnl >= 0 ? 'up' : 'down'} label={`${Math.abs(pnl).toFixed(1)} %`} /> : null}
                    </View>
                  </View>
                )
              })}
            </FxCard>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 13 },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  logo: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  logoTxt: { fontFamily: font.display, fontSize: 12 },
  name: { fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink },
  cat: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', color: color.inkFaint, marginTop: 2 },
  val: { fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink, fontVariant: ['tabular-nums'] },
})
