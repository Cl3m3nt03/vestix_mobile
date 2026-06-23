import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { AppShell } from '@/components/ui/AppShell'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxKpi } from '@/components/ui/FxKpi'
import { FxChip } from '@/components/ui/FxChip'
import { FxBadge } from '@/components/ui/FxBadge'
import { FxPill } from '@/components/ui/FxPill'
import { Donut } from '@/components/ui/Donut'
import { BottomNav, NavItem } from '@/components/ui/BottomNav'
import { color, font, accentGradient, shadow } from '@/theme/tokens'
import { LinearGradient } from 'expo-linear-gradient'

const NAV: NavItem[] = [
  { key: 'home',   label: 'Accueil',    icon: (a) => <Feather name="home" size={21} color={a ? color.acc : color.inkSoft} /> },
  { key: 'folio',  label: 'Portefeuille', icon: (a) => <Feather name="pie-chart" size={21} color={a ? color.acc : color.inkSoft} /> },
  { key: 'tx',     label: 'Transactions', icon: (a) => <Feather name="repeat" size={21} color={a ? color.acc : color.inkSoft} /> },
  { key: 'budget', label: 'Budget',     icon: (a) => <Feather name="trending-up" size={21} color={a ? color.acc : color.inkSoft} /> },
  { key: 'more',   label: 'Plus',       icon: (a) => <Feather name="grid" size={21} color={a ? color.acc : color.inkSoft} /> },
]

const ASSETS = [
  { tick: 'CW8',  name: 'Amundi MSCI World', cat: 'PEA',    val: '12 480 €', dir: 'up' as const, chg: '4,2 %' },
  { tick: 'BTC',  name: 'Bitcoin',           cat: 'Crypto', val: '6 920 €',  dir: 'up' as const, chg: '11,8 %' },
  { tick: 'AAPL', name: 'Apple',             cat: 'CTO',    val: '3 150 €',  dir: 'down' as const, chg: '1,4 %' },
  { tick: 'LIV',  name: 'Livret A',          cat: 'Épargne', val: '8 200 €', dir: 'up' as const, chg: '0,2 %' },
]

export default function Dashboard() {
  const [tab, setTab] = useState('home')
  const [period, setPeriod] = useState('1M')

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Topbar */}
        <View style={styles.topbar}>
          <View>
            <Text style={styles.eyebrow}>VESTIX</Text>
            <Text style={styles.h1}>Patrimoine</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>CL</Text>
          </View>
        </View>

        {/* KPIs */}
        <View style={styles.kpis}>
          <FxKpi
            label="Total"
            value="30 750 €"
            icon={<Feather name="layers" size={17} color={color.acc} />}
            trend={{ dir: 'up', text: '+5,7 % ce mois' }}
          />
          <FxKpi
            label="Plus-value"
            value="+4 210 €"
            icon={<Feather name="trending-up" size={17} color={color.acc} />}
            trend={{ dir: 'up', text: '+15,8 %' }}
          />
        </View>

        {/* Évolution */}
        <FxCard>
          <FxCardHeader
            title="Évolution"
            sub="VALORISATION"
            right={<FxBadge label="Live" tone="live" />}
          />
          <View style={styles.periods}>
            {['1S', '1M', '1A', 'Max'].map((p) => (
              <FxChip key={p} label={p} active={p === period} onPress={() => setPeriod(p)} />
            ))}
          </View>
          {/* Placeholder graphe (victory-native à brancher) */}
          <View style={styles.chartStub}>
            <Feather name="activity" size={22} color={color.accBr} />
            <Text style={styles.chartStubTxt}>Graphe d'évolution ({period})</Text>
          </View>
        </FxCard>

        {/* Répartition */}
        <FxCard>
          <FxCardHeader title="Répartition" sub="PAR CLASSE D'ACTIF" />
          <Donut
            centerValue="30,7 k€"
            centerLabel="Total"
            slices={[
              { label: 'Actions / ETF', value: 15630, color: color.acc },
              { label: 'Crypto', value: 6920, color: color.pop },
              { label: 'Épargne', value: 8200, color: color.d2 },
            ]}
          />
        </FxCard>

        {/* Actifs */}
        <FxCard>
          <FxCardHeader title="Mes actifs" sub="4 LIGNES" />
          {ASSETS.map((a, i) => (
            <View key={a.tick} style={[styles.assetRow, i > 0 && styles.assetBorder]}>
              <View style={styles.tickLogo}>
                <Text style={styles.tickTxt}>{a.tick.slice(0, 3)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.assetName}>{a.name}</Text>
                <Text style={styles.assetCat}>{a.cat}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={styles.assetVal}>{a.val}</Text>
                <FxPill dir={a.dir} label={a.chg} />
              </View>
            </View>
          ))}
        </FxCard>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* FAB assistant */}
      <Pressable style={styles.fab}>
        <LinearGradient colors={accentGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabInner}>
          <Feather name="message-circle" size={24} color={color.white} />
        </LinearGradient>
      </Pressable>

      <BottomNav items={NAV} active={tab} onSelect={setTab} />
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
  periods: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  chartStub: {
    height: 130, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: color.accTint,
  },
  chartStubTxt: { fontFamily: font.bodyMed, fontSize: 13, color: color.inkSoft },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 13 },
  assetBorder: { borderTopWidth: 1, borderTopColor: color.hair2 },
  tickLogo: {
    width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
    backgroundColor: color.accTint,
  },
  tickTxt: { fontFamily: font.display, fontSize: 12, color: color.acc },
  assetName: { fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink },
  assetCat: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: color.inkFaint, marginTop: 2 },
  assetVal: { fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink, fontVariant: ['tabular-nums'] },
  fab: {
    position: 'absolute', right: 16, bottom: 92, width: 58, height: 58, borderRadius: 18,
    ...shadow.lg, shadowColor: color.acc,
  },
  fabInner: { flex: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
})
