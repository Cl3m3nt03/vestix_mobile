import { useState, useMemo } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxKpi } from '@/components/ui/FxKpi'
import { Field } from '@/components/ui/Field'
import { LineChart } from '@/components/ui/LineChart'
import { eur } from '@/lib/format'
import { useTheme } from '@/lib/theme-context'
import { color, font } from '@/theme/tokens'

const num = (s: string) => Number(s.replace(',', '.')) || 0

export default function Simulator() {
  const router = useRouter()
  const { accent } = useTheme()
  const [initial, setInitial] = useState('1000')
  const [monthly, setMonthly] = useState('200')
  const [rate, setRate] = useState('7')
  const [years, setYears] = useState('20')

  const sim = useMemo(() => {
    const P0 = num(initial)
    const m = num(monthly)
    const r = num(rate) / 100 / 12
    const months = Math.min(Math.max(Math.round(num(years) * 12), 1), 1200)
    const curve: { value: number }[] = []
    let bal = P0
    let invested = P0
    for (let i = 0; i < months; i++) {
      bal = bal * (1 + r) + m
      invested += m
      if (i % 3 === 0 || i === months - 1) curve.push({ value: bal })
    }
    return { final: bal, invested, gain: bal - invested, curve }
  }, [initial, monthly, rate, years])

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow="VESTIX" title="Simulateur" onBack={() => router.back()} />

        <FxCard>
          <FxCardHeader title="Paramètres" sub="INTÉRÊTS COMPOSÉS" />
          <Field label="Capital initial (€)" keyboardType="decimal-pad" value={initial} onChangeText={setInitial} />
          <Field label="Versement mensuel (€)" keyboardType="decimal-pad" value={monthly} onChangeText={setMonthly} />
          <Field label="Rendement annuel (%)" keyboardType="decimal-pad" value={rate} onChangeText={setRate} />
          <Field label="Durée (années)" keyboardType="number-pad" value={years} onChangeText={setYears} />
        </FxCard>

        <View style={styles.kpis}>
          <FxKpi label="Capital final" value={eur(sim.final)} icon={undefined} />
          <FxKpi label="Plus-value" value={eur(sim.gain)} trend={{ dir: 'up', text: `Investi ${eur(sim.invested)}` }} />
        </View>

        <FxCard>
          <FxCardHeader title="Projection" sub={`${years} ANS`} />
          <LineChart series={[{ label: 'Capital', color: accent.acc, points: sim.curve }]} />
        </FxCard>
        <View style={{ height: 16 }} />
      </ScrollView>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
  kpis: { flexDirection: 'row', gap: 12 },
})
