import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { AddButton } from '@/components/ui/AddButton'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxButton } from '@/components/ui/FxButton'
import { FxBadge } from '@/components/ui/FxBadge'
import { Sheet } from '@/components/ui/Sheet'
import { useBankConnections, useBankTransactions, useInstitutions, useConnectBank, useSyncBank } from '@/lib/queries'
import { ApiError } from '@/lib/api'
import { eur, dateFr } from '@/lib/format'
import { color, font } from '@/theme/tokens'

export default function Bank() {
  const router = useRouter()
  const conns = useBankConnections()
  const txs = useBankTransactions()
  const sync = useSyncBank()
  const connect = useConnectBank()

  const [pick, setPick] = useState(false)
  const [q, setQ] = useState('')
  const insts = useInstitutions(q)
  const [err, setErr] = useState<string | null>(null)

  const onConnect = async (institutionId: string, bankName: string) => {
    setErr(null)
    try {
      const { link } = await connect.mutateAsync({ institutionId, bankName })
      setPick(false)
      await WebBrowser.openBrowserAsync(link)
      conns.refetch()
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Échec de la connexion')
    }
  }

  return (
    <AppShell>
      <Sheet visible={pick} onClose={() => setPick(false)} title="Connecter une banque">
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={color.inkFaint} />
          <TextInput style={styles.input} placeholder="Boursorama, Crédit Agricole…" placeholderTextColor={color.inkFaint}
            value={q} onChangeText={setQ} autoFocus />
        </View>
        {err ? <Text style={styles.err}>{err}</Text> : null}
        {insts.isLoading ? <ActivityIndicator color={color.acc} style={{ marginTop: 16 }} /> : null}
        {insts.data?.map((b) => (
          <Pressable key={b.id} onPress={() => onConnect(b.id, b.name)} style={styles.bankRow}>
            <Feather name="home" size={18} color={color.acc} />
            <Text style={styles.bankName}>{b.name}</Text>
            <Feather name="chevron-right" size={18} color={color.inkFaint} />
          </Pressable>
        ))}
      </Sheet>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}
        >
        <ScreenHeader eyebrow="VESTIX" title="Banques" onBack={() => router.back()} right={<AddButton onPress={() => setPick(true)} />} />

        {conns.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
        ) : conns.error ? (
          <FxCard><Text style={styles.err}>{String((conns.error as Error).message)}</Text></FxCard>
        ) : !conns.data!.length ? (
          <FxCard>
            <Text style={styles.muted}>Aucune banque connectée.</Text>
            <FxButton label="Connecter une banque" onPress={() => setPick(true)} style={{ marginTop: 12 }} />
          </FxCard>
        ) : (
          conns.data!.map((c) => (
            <FxCard key={c.id}>
              <FxCardHeader
                title={c.institutionName}
                sub={c.lastSyncAt ? `Sync ${dateFr(c.lastSyncAt)}` : 'Jamais synchronisé'}
                right={<FxBadge label={c.status === 'LINKED' ? 'Lié' : c.status} tone={c.status === 'LINKED' ? 'live' : 'soft'} />}
              />
              {c.accounts.map((a, i) => (
                <View key={a.id} style={[styles.acc, i > 0 && styles.border]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.accName}>{a.name ?? 'Compte'}</Text>
                    {a.iban ? <Text style={styles.iban}>{a.iban}</Text> : null}
                  </View>
                  <Text style={styles.bal}>{eur(a.balance)}</Text>
                </View>
              ))}
              <FxButton label={sync.isPending ? 'Sync…' : 'Synchroniser'} variant="ghost" size="tiny"
                onPress={() => sync.mutate(c.id)} style={{ marginTop: 12, alignSelf: 'flex-start' }} />
            </FxCard>
          ))
        )}

        {txs.data?.transactions.length ? (
          <FxCard>
            <FxCardHeader title="Opérations" sub={`+${eur(txs.data.totals.in)} · −${eur(Math.abs(txs.data.totals.out))}`} />
            {txs.data.transactions.slice(0, 20).map((t, i) => (
              <View key={t.id} style={[styles.tx, i > 0 && styles.border]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txName} numberOfLines={1}>{t.merchant ?? t.reference ?? 'Opération'}</Text>
                  <Text style={styles.txDate}>{dateFr(t.bookingDate)}{t.category ? ` · ${t.category}` : ''}</Text>
                </View>
                <Text style={[styles.txAmt, { color: t.direction === 'CRDT' ? color.up : color.ink }]}>
                  {t.direction === 'CRDT' ? '+' : '−'}{eur(Math.abs(t.amount), 2)}
                </Text>
              </View>
            ))}
          </FxCard>
        ) : null}
        <View style={{ height: 16 }} />
      </ScrollView>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
  center: { paddingVertical: 60, alignItems: 'center' },
  muted: { fontFamily: font.body, fontSize: 13.5, color: color.inkSoft },
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginBottom: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 14,
    borderRadius: 13, backgroundColor: color.white, borderWidth: 1, borderColor: color.glassHi, marginBottom: 8,
  },
  input: { flex: 1, fontFamily: font.body, fontSize: 15, color: color.ink },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderTopWidth: 1, borderTopColor: color.hair2 },
  bankName: { flex: 1, fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink },
  acc: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  accName: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  iban: { fontFamily: font.mono, fontSize: 10.5, color: color.inkFaint, marginTop: 2 },
  bal: { fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink, fontVariant: ['tabular-nums'] },
  tx: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  txName: { fontFamily: font.bodyMed, fontSize: 14, color: color.ink },
  txDate: { fontFamily: font.mono, fontSize: 10, color: color.inkFaint, marginTop: 2 },
  txAmt: { fontFamily: font.bodySemi, fontSize: 14, fontVariant: ['tabular-nums'] },
})
