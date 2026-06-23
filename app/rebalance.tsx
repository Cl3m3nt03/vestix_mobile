import { useState, useEffect } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxButton } from '@/components/ui/FxButton'
import { Field } from '@/components/ui/Field'
import { useStats, useRebalance } from '@/lib/queries'
import type { AssetType } from '@/lib/types'
import { eur, CAT } from '@/lib/format'
import { color, font } from '@/theme/tokens'

export default function Rebalance() {
  const router = useRouter()
  const stats = useStats()
  const reb = useRebalance()
  const [targets, setTargets] = useState<Record<string, string>>({})

  // Pré-remplit avec l'allocation actuelle (arrondie) des classes présentes.
  useEffect(() => {
    if (stats.data && Object.keys(targets).length === 0) {
      const total = stats.data.totalValue || 1
      const init: Record<string, string> = {}
      for (const [k, v] of Object.entries(stats.data.breakdown)) {
        if (v > 0) init[k] = String(Math.round((v / total) * 100))
      }
      setTargets(init)
    }
  }, [stats.data])

  const sum = Object.values(targets).reduce((s, v) => s + (Number(v) || 0), 0)

  const run = () => {
    const t: Record<string, number> = {}
    for (const [k, v] of Object.entries(targets)) t[k] = Number(v) || 0
    reb.mutate(t)
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow="VESTIX" title="Rééquilibrage" onBack={() => router.back()} />

        {stats.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
        ) : (
          <>
            <FxCard>
              <FxCardHeader title="Allocation cible" sub={`TOTAL ${sum} %`} />
              {Object.keys(targets).map((k) => {
                const cat = CAT[k as AssetType] ?? CAT.OTHER
                return (
                  <View key={k} style={styles.targetRow}>
                    <View style={[styles.dot, { backgroundColor: cat.color }]} />
                    <Text style={styles.tName}>{cat.label}</Text>
                    <View style={styles.pctInput}>
                      <Field label="" keyboardType="number-pad" value={targets[k]}
                        onChangeText={(v) => setTargets((p) => ({ ...p, [k]: v }))} />
                    </View>
                    <Text style={styles.pctSign}>%</Text>
                  </View>
                )
              })}
              {sum !== 100 ? <Text style={styles.warn}>La somme devrait faire 100 % (actuellement {sum} %).</Text> : null}
              <FxButton label={reb.isPending ? '...' : 'Calculer'} onPress={run} style={{ marginTop: 8 }} />
            </FxCard>

            {reb.data ? (
              <FxCard>
                <FxCardHeader title="Suggestions" sub="POUR ATTEINDRE LA CIBLE" />
                {!reb.data.suggestions.length ? (
                  <Text style={styles.muted}>Déjà équilibré 🎯</Text>
                ) : (
                  reb.data.suggestions.map((s, i) => {
                    const cat = CAT[s.type as AssetType] ?? CAT.OTHER
                    const buy = s.delta > 0
                    return (
                      <View key={s.type} style={[styles.sugg, i > 0 && styles.border]}>
                        <View style={[styles.dot, { backgroundColor: cat.color }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.sName}>{cat.label}</Text>
                          <Text style={styles.sSub}>{s.currentPct.toFixed(0)} % → {s.targetPct.toFixed(0)} %</Text>
                        </View>
                        <Text style={[styles.sAct, { color: buy ? color.up : color.down }]}>
                          {buy ? 'Acheter' : 'Vendre'} {eur(Math.abs(s.delta))}
                        </Text>
                      </View>
                    )
                  })
                )}
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
  center: { paddingVertical: 60, alignItems: 'center' },
  muted: { fontFamily: font.body, fontSize: 13.5, color: color.inkSoft },
  warn: { fontFamily: font.bodyMed, fontSize: 12.5, color: color.pop, marginTop: 4 },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  dot: { width: 11, height: 11, borderRadius: 4 },
  tName: { flex: 1, fontFamily: font.bodyMed, fontSize: 14, color: color.ink },
  pctInput: { width: 80 },
  pctSign: { fontFamily: font.bodySemi, fontSize: 14, color: color.inkSoft, marginTop: 8 },
  sugg: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 12 },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  sName: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  sSub: { fontFamily: font.mono, fontSize: 10.5, color: color.inkFaint, marginTop: 2 },
  sAct: { fontFamily: font.bodySemi, fontSize: 13.5, fontVariant: ['tabular-nums'] },
})
