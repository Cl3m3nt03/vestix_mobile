import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Pressable, RefreshControl } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { useRouter, type Href } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { AppShell } from '@/components/ui/AppShell'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxKpi } from '@/components/ui/FxKpi'
import { FxBadge } from '@/components/ui/FxBadge'
import { FxPill } from '@/components/ui/FxPill'
import { Donut, Slice } from '@/components/ui/Donut'
import { useStats, useAssets, useMe } from '@/lib/queries'
import type { AssetType } from '@/lib/types'
import { eur, CAT } from '@/lib/format'
import { Touchable } from '@/components/ui/Touchable'
import { tapMedium } from '@/lib/haptics'
import { color, font, shadow } from '@/theme/tokens'
import { useTheme } from '@/lib/theme-context'

export default function Dashboard() {
  const router = useRouter()
  const { accent } = useTheme()
  const me = useMe()
  const stats = useStats()
  const assets = useAssets()

  const loading = stats.isLoading || assets.isLoading
  const error = stats.error || assets.error
  const refreshing = stats.isRefetching || assets.isRefetching
  const refetch = () => { stats.refetch(); assets.refetch(); me.refetch() }

  const slices: Slice[] = stats.data
    ? (Object.entries(stats.data.breakdown) as [AssetType, number][])
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => ({ label: CAT[k].label, value: v, color: CAT[k].color }))
    : []

  return (
    <AppShell>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={accent.acc} />}
      >
        <View style={styles.topbar}>
          <View>
            <Text style={styles.eyebrow}>VESTIX</Text>
            <Text style={styles.h1}>Patrimoine</Text>
          </View>
          <Touchable style={[styles.avatar, { backgroundColor: accent.acc3 }]} onPress={() => router.push('/settings' as Href)}>
            <Text style={styles.avatarTxt}>
              {(me.data?.name ?? me.data?.email ?? '?').slice(0, 2).toUpperCase()}
            </Text>
          </Touchable>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={color.acc} />
            <Text style={styles.muted}>Connexion au serveur…</Text>
          </View>
        ) : error ? (
          <FxCard>
            <Text style={styles.errTitle}>Impossible de charger les données</Text>
            <Text style={styles.muted}>{String((error as Error).message)}</Text>
          </FxCard>
        ) : (
          <>
            <View style={styles.kpis}>
              <FxKpi
                label="Total"
                value={eur(stats.data!.totalValue)}
                valueNum={stats.data!.totalValue}
                format={(n) => eur(n)}
                icon={<Feather name="layers" size={17} color={accent.acc} />}
                trend={{
                  dir: stats.data!.totalPnl >= 0 ? 'up' : 'down',
                  text: `${stats.data!.totalPnlPercent >= 0 ? '+' : ''}${stats.data!.totalPnlPercent.toFixed(1)} %`,
                }}
              />
              <FxKpi
                label="Plus-value"
                value={`${stats.data!.totalPnl >= 0 ? '+' : ''}${eur(stats.data!.totalPnl)}`}
                valueNum={stats.data!.totalPnl}
                format={(n) => `${n >= 0 ? '+' : ''}${eur(n)}`}
                icon={<Feather name="trending-up" size={17} color={accent.acc} />}
                sub={`Investi ${eur(stats.data!.totalInvested)}`}
              />
            </View>

            <FxCard>
              <FxCardHeader title="Répartition" sub="PAR CLASSE D'ACTIF" right={<FxBadge label="Live" tone="live" />} />
              {slices.length ? (
                <Donut centerValue={eur(stats.data!.totalValue)} centerLabel="Total" slices={slices} />
              ) : (
                <Text style={styles.muted}>Aucun actif pour le moment.</Text>
              )}
            </FxCard>

            <FxCard>
              <FxCardHeader title="Mes actifs" sub={`${assets.data!.length} LIGNE${assets.data!.length > 1 ? 'S' : ''}`} />
              {assets.data!.length === 0 ? (
                <Text style={styles.muted}>Ajoute un actif depuis le web pour le voir ici.</Text>
              ) : (
                assets.data!.slice(0, 5).map((a, i) => {
                  const cat = CAT[a.type] ?? CAT.OTHER
                  const pnl = a.holdings?.[0]?.pnlPercentEur
                  return (
                    <Animated.View
                      key={a.id}
                      entering={FadeInUp.duration(280).delay(i * 35)}
                      style={[styles.assetRow, i > 0 && styles.assetBorder]}
                    >
                      <View style={[styles.tickLogo, { backgroundColor: cat.color + '22' }]}>
                        <Text style={[styles.tickTxt, { color: cat.color }]}>{a.name.slice(0, 3).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.assetName} numberOfLines={1}>{a.name}</Text>
                        <Text style={styles.assetCat}>{cat.label}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Text style={styles.assetVal}>{eur(a.value)}</Text>
                        {typeof pnl === 'number' ? (
                          <FxPill dir={pnl >= 0 ? 'up' : 'down'} label={`${Math.abs(pnl).toFixed(1)} %`} />
                        ) : null}
                      </View>
                    </Animated.View>
                  )
                })
              )}
            </FxCard>
          </>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      <Pressable
        onPress={() => {
          tapMedium()
          router.push('/assistant' as Href)
        }}
        style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.92 }] }]}
      >
        <LinearGradient colors={accent.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabInner}>
          <Feather name="message-circle" size={24} color={color.white} />
        </LinearGradient>
      </Pressable>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  eyebrow: { fontFamily: font.mono, fontSize: 10, letterSpacing: 2, color: color.inkFaint },
  h1: { fontFamily: font.display, fontSize: 24, letterSpacing: -0.3, color: color.ink, marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    backgroundColor: color.acc3, borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
  },
  avatarTxt: { fontFamily: font.display, fontSize: 13, color: color.white },
  kpis: { flexDirection: 'row', gap: 12 },
  centerBox: { alignItems: 'center', gap: 10, paddingVertical: 60 },
  muted: { fontFamily: font.body, fontSize: 13.5, color: color.inkSoft },
  errTitle: { fontFamily: font.display, fontSize: 16, color: color.down, marginBottom: 6 },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 13 },
  assetBorder: { borderTopWidth: 1, borderTopColor: color.hair2 },
  tickLogo: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tickTxt: { fontFamily: font.display, fontSize: 12 },
  assetName: { fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink },
  assetCat: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: color.inkFaint, marginTop: 2 },
  assetVal: { fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink, fontVariant: ['tabular-nums'] },
  fab: { position: 'absolute', right: 16, bottom: 16, width: 58, height: 58, borderRadius: 18, ...shadow.lg, shadowColor: color.acc },
  fabInner: { flex: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
})
