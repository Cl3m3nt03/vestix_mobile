import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxChip } from '@/components/ui/FxChip'
import { LineChart } from '@/components/ui/LineChart'
import { AddAsset } from '@/components/forms/AddAsset'
import { useAssets, useSparkline } from '@/lib/queries'
import { eur, CAT } from '@/lib/format'
import { color, font } from '@/theme/tokens'

const RANGES = [
  { value: '1mo', label: '1M' },
  { value: '6mo', label: '6M' },
  { value: '1y', label: '1A' },
  { value: '5y', label: '5A' },
]

export default function Product() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const assets = useAssets()
  const asset = assets.data?.find((a) => a.id === id)
  const symbol = asset?.holdings?.[0]?.symbol ?? null
  const [range, setRange] = useState('1mo')
  const [edit, setEdit] = useState(false)
  const spark = useSparkline(symbol, asset?.name ?? '', range)
  const cat = asset ? (CAT[asset.type] ?? CAT.OTHER) : CAT.OTHER

  return (
    <AppShell>
      {asset ? <AddAsset visible={edit} editing={asset} onClose={() => { setEdit(false); if (!assets.data?.find((a) => a.id === id)) router.back() }} /> : null}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow={cat.label.toUpperCase()}
          title={asset?.name ?? 'Actif'}
          onBack={() => router.back()}
          right={asset ? (
            <Pressable onPress={() => setEdit(true)} hitSlop={8} style={styles.editBtn}>
              <Feather name="edit-2" size={18} color={color.acc} />
            </Pressable>
          ) : undefined}
        />

        {assets.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
        ) : !asset ? (
          <FxCard><Text style={styles.muted}>Actif introuvable.</Text></FxCard>
        ) : (
          <>
            <FxCard>
              <Text style={styles.label}>VALEUR</Text>
              <Text style={styles.value}>{eur(asset.value)}</Text>
              {asset.institution ? <Text style={styles.muted}>{asset.institution}</Text> : null}
            </FxCard>

            {symbol ? (
              <FxCard>
                <FxCardHeader title="Cours" sub={symbol} />
                <View style={styles.ranges}>
                  {RANGES.map((r) => (
                    <FxChip key={r.value} label={r.label} active={r.value === range} onPress={() => setRange(r.value)} />
                  ))}
                </View>
                {spark.isLoading ? (
                  <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
                ) : (
                  <LineChart series={[{ label: symbol, color: color.acc, points: (spark.data?.prices ?? []).map((v) => ({ value: v })) }]} />
                )}
              </FxCard>
            ) : null}

            {asset.holdings?.length ? (
              <FxCard>
                <FxCardHeader title="Positions" sub={`${asset.holdings.length}`} />
                {asset.holdings.map((h, i) => (
                  <View key={h.id} style={[styles.row, i > 0 && styles.border]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{h.symbol}</Text>
                      <Text style={styles.sub}>{h.quantity} @ {eur(h.avgBuyPrice, 2)}</Text>
                    </View>
                    {typeof h.pnlPercentEur === 'number' ? (
                      <Text style={[styles.pnl, { color: h.pnlPercentEur >= 0 ? color.up : color.down }]}>
                        {h.pnlPercentEur >= 0 ? '+' : ''}{h.pnlPercentEur.toFixed(1)} %
                      </Text>
                    ) : null}
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

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
  center: { paddingVertical: 40, alignItems: 'center' },
  label: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: color.inkFaint },
  value: { fontFamily: font.display, fontSize: 32, color: color.ink, marginTop: 4, fontVariant: ['tabular-nums'] },
  muted: { fontFamily: font.body, fontSize: 13.5, color: color.inkSoft, marginTop: 4 },
  ranges: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  name: { fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink },
  sub: { fontFamily: font.mono, fontSize: 10.5, color: color.inkFaint, marginTop: 2 },
  pnl: { fontFamily: font.bodySemi, fontSize: 14, fontVariant: ['tabular-nums'] },
  editBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: color.accTint },
})
