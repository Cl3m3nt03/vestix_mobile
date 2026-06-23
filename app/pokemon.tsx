import { ActivityIndicator, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxKpi } from '@/components/ui/FxKpi'
import { LineChart } from '@/components/ui/LineChart'
import { useHoloStatus, useHoloData } from '@/lib/queries'
import { eur } from '@/lib/format'
import { color, font } from '@/theme/tokens'

export default function Pokemon() {
  const router = useRouter()
  const status = useHoloStatus()
  const data = useHoloData()

  const connected = status.data?.connected
  const pf = data.data?.portfolio
  const items = data.data?.collection?.items ?? []
  const history = (data.data?.history ?? []).map((h) => ({ value: h.value }))

  return (
    <AppShell>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={data.isRefetching} onRefresh={() => { status.refetch(); data.refetch() }} tintColor={color.acc} />}
      >
        <ScreenHeader eyebrow="VESTIX" title="Collection TCG" onBack={() => router.back()} />

        {status.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
        ) : !connected ? (
          <FxCard>
            <Text style={styles.muted}>
              Collection Pokémon non connectée. Connecte ton compte HoloFolio depuis le site web —
              la collection apparaîtra ensuite ici en lecture seule.
            </Text>
          </FxCard>
        ) : (
          <>
            <View style={styles.kpis}>
              <FxKpi label="Valeur" value={eur(pf?.totalValue ?? status.data?.lastTotalValue ?? 0)} />
              <FxKpi label="Investi" value={eur(pf?.totalInvested ?? status.data?.lastTotalInvested ?? 0)} />
            </View>

            {history.length > 1 ? (
              <FxCard>
                <FxCardHeader title="Évolution" sub="90 JOURS" />
                <LineChart series={[{ label: 'Collection', color: color.pop, points: history }]} />
              </FxCard>
            ) : null}

            <FxCard>
              <FxCardHeader title="Cartes" sub={`${data.data?.collection?.total ?? items.length}`} />
              {!items.length ? (
                <Text style={styles.muted}>Aucune carte chargée.</Text>
              ) : (
                items.slice(0, 30).map((it, i) => (
                  <View key={it.id ?? i} style={[styles.row, i > 0 && styles.border]}>
                    <Text style={styles.name} numberOfLines={1}>{it.name ?? 'Carte'}</Text>
                    {it.quantity ? <Text style={styles.qty}>×{it.quantity}</Text> : null}
                    <Text style={styles.val}>{eur(it.marketValue ?? 0, 2)}</Text>
                  </View>
                ))
              )}
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
  muted: { fontFamily: font.body, fontSize: 13.5, lineHeight: 20, color: color.inkSoft },
  kpis: { flexDirection: 'row', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  name: { flex: 1, fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  qty: { fontFamily: font.mono, fontSize: 11, color: color.inkFaint },
  val: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink, fontVariant: ['tabular-nums'] },
})
