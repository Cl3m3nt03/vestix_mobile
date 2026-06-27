import { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, RefreshControl, Pressable } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { AddButton } from '@/components/ui/AddButton'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxKpi } from '@/components/ui/FxKpi'
import { Donut, Slice } from '@/components/ui/Donut'
import { Tabs } from '@/components/ui/Tabs'
import { AddBudgetItem } from '@/components/forms/AddBudgetItem'
import { useBudget } from '@/lib/queries'
import type { BudgetCategory, BudgetItem } from '@/lib/types'
import { eur } from '@/lib/format'
import { tapLight } from '@/lib/haptics'
import { useTheme } from '@/lib/theme-context'
import { color, font } from '@/theme/tokens'

const CATS: Record<BudgetCategory, { label: string; color: string; icon: keyof typeof Feather.glyphMap }> = {
  needs:      { label: 'Besoins',        color: color.acc,    icon: 'home' },
  wants:      { label: 'Envies',         color: color.pop,    icon: 'heart' },
  savings:    { label: 'Épargne',        color: color.d2,     icon: 'shield' },
  investment: { label: 'Investissement', color: color.violet, icon: 'trending-up' },
}

type Tab = 'repartition' | 'flux'

export default function Budget() {
  const { accent } = useTheme()
  const q = useBudget()
  const items = q.data?.items ?? []
  const income = q.data?.income ?? 0
  const spent = items.reduce((s, it) => s + it.amount, 0)
  const left = income - spent
  const [add, setAdd] = useState(false)
  const [editing, setEditing] = useState<BudgetItem | null>(null)
  const [tab, setTab] = useState<Tab>('repartition')
  const close = () => { setAdd(false); setEditing(null) }

  const slices: Slice[] = (Object.keys(CATS) as BudgetCategory[])
    .map((c) => ({
      label: CATS[c].label,
      value: items.filter((it) => it.category === c).reduce((s, it) => s + it.amount, 0),
      color: CATS[c].color,
    }))
    .filter((s) => s.value > 0)

  // Échéancier mensuel : items triés par jour, solde courant qui diminue
  const fluxItems = useMemo(
    () => [...items].filter((i) => i.dayOfMonth != null).sort((a, b) => (a.dayOfMonth ?? 0) - (b.dayOfMonth ?? 0)),
    [items],
  )
  const fluxWithBalance = useMemo(() => {
    let balance = income
    return fluxItems.map((item) => {
      balance -= item.amount
      return { ...item, balanceAfter: balance }
    })
  }, [fluxItems, income])

  return (
    <AppShell>
      <AddBudgetItem visible={add || !!editing} editing={editing} onClose={close} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} tintColor={accent.acc} />}
      >
        <ScreenHeader eyebrow="VESTIX" title="Budget" right={<AddButton onPress={() => setAdd(true)} />} />

        {q.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={accent.acc} /></View>
        ) : q.error ? (
          <FxCard><Text style={styles.err}>{String((q.error as Error).message)}</Text></FxCard>
        ) : (
          <>
            <View style={styles.kpis}>
              <FxKpi label="Revenu" value={eur(income)} valueNum={income} format={(n) => eur(n)} />
              <FxKpi
                label="Reste"
                value={eur(left)}
                valueNum={left}
                format={(n) => eur(n)}
                trend={{ dir: left >= 0 ? 'up' : 'down', text: `Dépensé ${eur(spent)}` }}
              />
            </View>

            <Tabs<Tab>
              value={tab}
              onChange={setTab}
              items={[
                { id: 'repartition', label: 'Répartition', icon: <Feather name="pie-chart" size={13} color={tab === 'repartition' ? accent.acc : color.inkSoft} /> },
                { id: 'flux',        label: 'Flux mensuel', icon: <Feather name="calendar"  size={13} color={tab === 'flux'        ? accent.acc : color.inkSoft} /> },
              ]}
            />

            {tab === 'repartition' && (
              <>
                {slices.length ? (
                  <FxCard>
                    <FxCardHeader title="Répartition" sub="PAR CATÉGORIE" />
                    <Donut centerValue={eur(spent)} centerLabel="Dépensé" slices={slices} />
                  </FxCard>
                ) : null}

                {!items.length ? (
                  <FxCard><Text style={styles.muted}>Aucun poste de budget. Ajoute-en depuis le bouton +.</Text></FxCard>
                ) : (
                  (Object.keys(CATS) as BudgetCategory[]).map((c) => {
                    const list = items.filter((it) => it.category === c)
                    if (!list.length) return null
                    const sum = list.reduce((s, it) => s + it.amount, 0)
                    return (
                      <FxCard key={c}>
                        <FxCardHeader title={CATS[c].label} sub={eur(sum)} />
                        {list.map((it, i) => (
                          <Animated.View key={it.id} entering={FadeInUp.duration(240).delay(i * 30)}>
                            <Pressable
                              onPress={() => {
                                tapLight()
                                setEditing(it)
                              }}
                              style={({ pressed }) => [styles.row, i > 0 && styles.border, pressed && styles.pressed]}
                            >
                              <View style={[styles.dot, { backgroundColor: CATS[c].color }]} />
                              <Text style={styles.name} numberOfLines={1}>{it.label}</Text>
                              <Text style={styles.val}>{eur(it.amount)}</Text>
                            </Pressable>
                          </Animated.View>
                        ))}
                      </FxCard>
                    )
                  })
                )}
              </>
            )}

            {tab === 'flux' && (
              <FxCard>
                <FxCardHeader title="Échéancier mensuel" sub="ENTRÉES & PRÉLÈVEMENTS" />

                <FluxRow
                  pillLabel="J-1"
                  pillBg={accent.accTint}
                  pillTxt={accent.acc}
                  title="Salaire / Revenus"
                  sub="Début du mois"
                  amount={income}
                  positive
                  balance={income}
                />

                {fluxWithBalance.length === 0 ? (
                  <Text style={styles.muted}>
                    Ajoute un jour de prélèvement (« Jour ») à tes postes pour les voir ici.
                  </Text>
                ) : (
                  fluxWithBalance.map((it, i) => {
                    const cat = CATS[it.category]
                    return (
                      <Animated.View key={it.id} entering={FadeInUp.duration(240).delay(i * 25)}>
                        <FluxRow
                          pillLabel={String(it.dayOfMonth)}
                          pillBg={cat.color + '22'}
                          pillTxt={cat.color}
                          icon={<Feather name={cat.icon} size={14} color={cat.color} />}
                          title={it.label}
                          sub={cat.label}
                          amount={it.amount}
                          balance={it.balanceAfter}
                          onPress={() => setEditing(it)}
                        />
                      </Animated.View>
                    )
                  })
                )}

                {fluxWithBalance.length > 0 && (
                  <FluxRow
                    pillLabel="Fin"
                    pillBg={color.glass2}
                    pillTxt={color.inkSoft}
                    title="Solde fin de mois"
                    finalBalance={left}
                  />
                )}
              </FxCard>
            )}
          </>
        )}
        <View style={{ height: 16 }} />
      </ScrollView>
    </AppShell>
  )
}

/** Ligne de l'échéancier : day-pill + (icône) + titre/sub + montant + solde. */
function FluxRow({
  pillLabel, pillBg, pillTxt, icon, title, sub, amount, balance, finalBalance, positive, onPress,
}: {
  pillLabel: string
  pillBg: string
  pillTxt: string
  icon?: React.ReactNode
  title: string
  sub?: string
  amount?: number
  balance?: number
  finalBalance?: number
  positive?: boolean
  onPress?: () => void
}) {
  const Wrapper: any = onPress ? Pressable : View
  const handlePress = onPress
    ? () => {
        tapLight()
        onPress()
      }
    : undefined
  return (
    <Wrapper
      onPress={handlePress}
      style={onPress
        ? ({ pressed }: { pressed: boolean }) => [styles.fluxRow, pressed && styles.pressed]
        : styles.fluxRow}
    >
      <View style={[styles.pill, { backgroundColor: pillBg }]}>
        <Text style={[styles.pillTxt, { color: pillTxt }]}>{pillLabel}</Text>
      </View>
      {icon ? <View style={styles.fluxIcon}>{icon}</View> : <View style={styles.fluxIconSpacer} />}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.fluxTitle} numberOfLines={1}>{title}</Text>
        {sub ? <Text style={styles.fluxSub}>{sub}</Text> : null}
      </View>
      {finalBalance != null ? (
        <Text style={[styles.fluxBalance, { color: finalBalance >= 0 ? color.up : color.down }]}>
          {finalBalance >= 0 ? '+' : ''}{eur(finalBalance)}
        </Text>
      ) : (
        <View style={styles.fluxRight}>
          {amount != null ? (
            <Text style={[styles.fluxAmount, { color: positive ? color.up : color.down }]}>
              {positive ? '+' : '−'}{eur(amount)}
            </Text>
          ) : null}
          {balance != null ? (
            <Text style={[styles.fluxBalance, { color: balance >= 0 ? color.ink : color.down }]}>
              {eur(balance)}
            </Text>
          ) : null}
          {balance != null && balance < 0 ? (
            <Text style={styles.fluxNeg}>Découvert !</Text>
          ) : null}
        </View>
      )}
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
  center: { paddingVertical: 60, alignItems: 'center' },
  muted: { fontFamily: font.body, fontSize: 13.5, color: color.inkSoft, paddingVertical: 8 },
  err: { fontFamily: font.bodyMed, fontSize: 13.5, color: color.down },
  kpis: { flexDirection: 'row', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11 },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  pressed: { opacity: 0.96, transform: [{ scale: 0.985 }] },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { flex: 1, fontFamily: font.bodyMed, fontSize: 14, color: color.ink },
  val: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink, fontVariant: ['tabular-nums'] },

  fluxRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 11, borderTopWidth: 1, borderTopColor: color.hair2,
  },
  fluxIcon: { width: 18, alignItems: 'center' },
  fluxIconSpacer: { width: 18 },
  fluxTitle: { fontFamily: font.bodySemi, fontSize: 13.5, color: color.ink },
  fluxSub: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.3, textTransform: 'uppercase', color: color.inkFaint, marginTop: 2 },
  fluxRight: { alignItems: 'flex-end', gap: 2 },
  fluxAmount: { fontFamily: font.monoSemi, fontSize: 12.5 },
  fluxBalance: { fontFamily: font.bodySemi, fontSize: 13.5, fontVariant: ['tabular-nums'] },
  fluxNeg: { fontFamily: font.mono, fontSize: 9.5, color: color.down, marginTop: 1 },
  pill: {
    minWidth: 36, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  pillTxt: { fontFamily: font.monoSemi, fontSize: 11, letterSpacing: 0.4 },
})
