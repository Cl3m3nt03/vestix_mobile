import { ActivityIndicator, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxKpi } from '@/components/ui/FxKpi'
import { useFiscal } from '@/lib/queries'
import { eur, dateFr } from '@/lib/format'
import { useTheme } from '@/lib/theme-context'
import { color, font } from '@/theme/tokens'

export default function Fiscal() {
  const router = useRouter()
  const { accent } = useTheme()
  const q = useFiscal()
  const d = q.data

  return (
    <AppShell>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} tintColor={accent.acc} />}
      >
        <ScreenHeader eyebrow="VESTIX" title={`Fiscalité ${d?.year ?? ''}`} onBack={() => router.back()} />

        {q.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={accent.acc} /></View>
        ) : q.error ? (
          <FxCard><Text style={styles.err}>{String((q.error as Error).message)}</Text></FxCard>
        ) : (
          <>
            <View style={styles.kpis}>
              <FxKpi label="Plus-values" value={eur(d!.plusValues.total)} />
              <FxKpi label="Dividendes" value={eur(d!.dividends.total)} />
            </View>

            <FxCard>
              <FxCardHeader title="Impôt estimé" sub="PFU 30 %" />
              <Row label="Base imposable" value={eur(d!.tax.taxableBase)} />
              <Row label="PFU (30 %)" value={eur(d!.tax.pfuAmount)} strong />
              <Row label="dont IR (12,8 %)" value={eur(d!.tax.irAmount)} muted />
              <Row label="dont PS (17,2 %)" value={eur(d!.tax.socialAmount)} muted />
              {d!.plusValues.exoneres > 0 ? (
                <Row label="PEA exonéré (PS seuls)" value={eur(d!.tax.peaExonereAmount)} />
              ) : null}
            </FxCard>

            <FxCard>
              <FxCardHeader title="Détail plus-values" sub={`CTO ${eur(d!.plusValues.cto)} · PEA ${eur(d!.plusValues.pea)}`} />
              {!d!.plusValues.lines.length ? (
                <Text style={styles.muted}>Aucune vente cette année.</Text>
              ) : (
                d!.plusValues.lines.map((l, i) => (
                  <View key={i} style={[styles.line, i > 0 && styles.border]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sym}>{l.symbol} <Text style={styles.acc}>{l.accountType}{l.exonere ? ' · exo' : ''}</Text></Text>
                      <Text style={styles.date}>{dateFr(l.date)}</Text>
                    </View>
                    <Text style={[styles.pv, { color: l.plusValue >= 0 ? color.up : color.down }]}>
                      {l.plusValue >= 0 ? '+' : ''}{eur(l.plusValue)}
                    </Text>
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

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <View style={styles.kvRow}>
      <Text style={[styles.k, muted && { color: color.inkFaint }]}>{label}</Text>
      <Text style={[styles.v, strong && { fontFamily: font.display, color: color.ink }, muted && { color: color.inkFaint }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
  center: { paddingVertical: 60, alignItems: 'center' },
  muted: { fontFamily: font.body, fontSize: 13.5, color: color.inkSoft },
  err: { fontFamily: font.bodyMed, fontSize: 13.5, color: color.down },
  kpis: { flexDirection: 'row', gap: 12 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  k: { fontFamily: font.body, fontSize: 14, color: color.inkSoft },
  v: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink, fontVariant: ['tabular-nums'] },
  line: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  sym: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  acc: { fontFamily: font.mono, fontSize: 10, color: color.inkFaint },
  date: { fontFamily: font.mono, fontSize: 10.5, color: color.inkFaint, marginTop: 2 },
  pv: { fontFamily: font.bodySemi, fontSize: 14, fontVariant: ['tabular-nums'] },
})
