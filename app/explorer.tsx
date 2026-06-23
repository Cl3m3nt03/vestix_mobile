import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter, type Href } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { useSearch } from '@/lib/queries'
import { eur } from '@/lib/format'
import { color, font } from '@/theme/tokens'

export default function Explorer() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const search = useSearch(q)
  const r = search.data

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow="VESTIX" title="Recherche" onBack={() => router.back()} />

        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={color.inkFaint} />
          <TextInput
            style={styles.input}
            placeholder="Actif, transaction, objectif…"
            placeholderTextColor={color.inkFaint}
            value={q}
            onChangeText={setQ}
            autoFocus
            autoCapitalize="none"
          />
          {q ? <Pressable onPress={() => setQ('')} hitSlop={8}><Feather name="x" size={18} color={color.inkFaint} /></Pressable> : null}
        </View>

        {q.trim().length < 2 ? (
          <Text style={styles.hint}>Tape au moins 2 caractères.</Text>
        ) : search.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
        ) : !r || (!r.assets.length && !r.transactions.length && !r.goals.length) ? (
          <Text style={styles.hint}>Aucun résultat.</Text>
        ) : (
          <>
            {r.assets.length ? (
              <FxCard>
                <FxCardHeader title="Actifs" sub={`${r.assets.length}`} />
                {r.assets.map((a, i) => (
                  <Pressable key={a.id} onPress={() => router.push(`/product/${a.id}` as Href)} style={[styles.row, i > 0 && styles.border]}>
                    <Text style={styles.name} numberOfLines={1}>{a.name}</Text>
                    <Text style={styles.val}>{eur(a.value)}</Text>
                  </Pressable>
                ))}
              </FxCard>
            ) : null}

            {r.transactions.length ? (
              <FxCard>
                <FxCardHeader title="Transactions" sub={`${r.transactions.length}`} />
                {r.transactions.map((t, i) => (
                  <View key={t.id} style={[styles.row, i > 0 && styles.border]}>
                    <Text style={styles.name} numberOfLines={1}>{t.type}{t.symbol ? ` · ${t.symbol}` : ''}</Text>
                    <Text style={styles.val}>{eur(t.price, 2)}</Text>
                  </View>
                ))}
              </FxCard>
            ) : null}

            {r.goals.length ? (
              <FxCard>
                <FxCardHeader title="Objectifs" sub={`${r.goals.length}`} />
                {r.goals.map((g, i) => (
                  <View key={g.id} style={[styles.row, i > 0 && styles.border]}>
                    <Text style={styles.name} numberOfLines={1}>{g.name}</Text>
                    <Text style={styles.val}>{eur(g.targetValue)}</Text>
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
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, paddingHorizontal: 16,
    borderRadius: 28, backgroundColor: color.white, borderWidth: 1, borderColor: color.glassHi,
  },
  input: { flex: 1, fontFamily: font.body, fontSize: 15, color: color.ink },
  hint: { fontFamily: font.body, fontSize: 13.5, color: color.inkSoft, paddingVertical: 20, textAlign: 'center' },
  center: { paddingVertical: 40, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 12 },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  name: { flex: 1, fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink },
  val: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink, fontVariant: ['tabular-nums'] },
})
