import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, Image } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { color, font, radius } from '@/theme/tokens'
import { useAssetSearch, usePrices } from '@/lib/queries'
import { eur } from '@/lib/format'
import type { AssetType, AssetSearchResult } from '@/lib/types'

const ISIN_RE = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/i

/**
 * Recherche débounce d'un titre / crypto / ETF avec dropdown des résultats
 * + prix temps réel (équivalent native du bloc « Rechercher un titre » du
 * formulaire web). Détecte l'ISIN automatiquement.
 */
export function SearchPicker({
  type, selected, onSelect, onClear,
}: {
  type: AssetType
  selected: AssetSearchResult | null
  onSelect: (r: AssetSearchResult) => void
  onClear: () => void
}) {
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 300)
    return () => clearTimeout(t)
  }, [q])

  const search = useAssetSearch(debounced, type)
  const results = search.data ?? []
  const prices = usePrices(results.map((r) => r.symbol))
  const priceMap: Record<string, number> = {}
  const pctMap: Record<string, number | undefined> = {}
  ;(prices.data ?? []).forEach((p) => {
    priceMap[p.symbol] = p.price
    pctMap[p.symbol] = p.changePercent24h ?? p.changePct24h
  })

  const isISIN = ISIN_RE.test(q.trim())
  const isCrypto = type === 'CRYPTO'

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {isCrypto ? 'Rechercher une crypto-monnaie' : 'Rechercher un titre boursier'}
        </Text>
        {isISIN ? <Text style={styles.isinBadge}>ISIN détecté</Text> : null}
      </View>

      <View style={styles.inputRow}>
        <Feather name="search" size={15} color={color.inkFaint} style={styles.searchIcon} />
        <TextInput
          value={selected ? `${selected.symbol} — ${selected.name}` : q}
          onChangeText={(v) => {
            if (selected) onClear()
            setQ(v)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={isCrypto ? 'Bitcoin, ETH, Solana…' : 'Apple, AAPL, MC.PA, FR0000131104…'}
          placeholderTextColor={color.inkFaint}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.input}
        />
        {search.isFetching ? (
          <ActivityIndicator size="small" color={color.inkFaint} style={styles.tailIcon} />
        ) : selected ? (
          <Feather name="check" size={16} color={color.up} style={styles.tailIcon} />
        ) : null}
      </View>

      {open && !selected && debounced.length >= 1 && results.length > 0 && (
        <View style={styles.dropdown}>
          {results.slice(0, 8).map((r, i) => (
            <Pressable
              key={`${r.symbol}-${i}`}
              onPress={() => { onSelect(r); setOpen(false) }}
              style={({ pressed }) => [
                styles.resultRow,
                i > 0 && styles.resultBorder,
                pressed && styles.resultPressed,
              ]}
            >
              {r.thumb ? (
                <Image source={{ uri: r.thumb }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbFallback}>
                  <Text style={styles.thumbInitial}>{r.symbol[0]}</Text>
                </View>
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.resultTopRow}>
                  <Text style={styles.resultSymbol} numberOfLines={1}>{r.symbol}</Text>
                  {r.marketCapRank ? <Text style={styles.rank}>#{r.marketCapRank}</Text> : null}
                  {r.isin ? <Text style={styles.isinSmall}>{r.isin}</Text> : null}
                </View>
                <Text style={styles.resultName} numberOfLines={1}>{r.name}</Text>
              </View>
              {priceMap[r.symbol] != null ? (
                <View style={styles.priceCol}>
                  <Text style={styles.price}>{eur(priceMap[r.symbol], 2)}</Text>
                  {pctMap[r.symbol] != null ? (
                    <Text style={[styles.pct, { color: (pctMap[r.symbol] as number) >= 0 ? color.up : color.down }]}>
                      {(pctMap[r.symbol] as number) >= 0 ? '+' : ''}{(pctMap[r.symbol] as number).toFixed(2)}%
                    </Text>
                  ) : null}
                </View>
              ) : r.exchange ? (
                <Text style={styles.exchange}>{r.exchange}</Text>
              ) : null}
              <Feather name="chevron-right" size={14} color={color.inkFaint} />
            </Pressable>
          ))}
        </View>
      )}

      {selected?.isin ? (
        <View style={styles.isinChipRow}>
          <Text style={styles.isinChipLabel}>ISIN</Text>
          <Text style={styles.isinChipValue}>{selected.isin}</Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 4 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: font.bodyMed, fontSize: 13, color: color.inkSoft },
  isinBadge: {
    fontFamily: font.monoSemi, fontSize: 10, color: color.acc,
    backgroundColor: color.accTint, borderWidth: 1, borderColor: color.acc,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  inputRow: { position: 'relative', justifyContent: 'center' },
  searchIcon: { position: 'absolute', left: 12, zIndex: 1 },
  tailIcon: { position: 'absolute', right: 12, zIndex: 1 },
  input: {
    height: 48, paddingLeft: 36, paddingRight: 36,
    borderRadius: radius.sm, borderWidth: 1, borderColor: color.glassHi,
    backgroundColor: color.white, fontFamily: font.body, fontSize: 14.5, color: color.ink,
  },
  dropdown: {
    marginTop: 4, borderRadius: radius.sm, borderWidth: 1, borderColor: color.glassHi,
    backgroundColor: color.card, overflow: 'hidden',
  },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  resultBorder: { borderTopWidth: 1, borderTopColor: color.hair2 },
  resultPressed: { backgroundColor: color.glass },
  thumb: { width: 24, height: 24, borderRadius: 12 },
  thumbFallback: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: color.glassStrong, alignItems: 'center', justifyContent: 'center',
  },
  thumbInitial: { fontFamily: font.monoSemi, fontSize: 11, color: color.inkSoft },
  resultTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultSymbol: { fontFamily: font.bodySemi, fontSize: 13.5, color: color.ink },
  rank: { fontFamily: font.mono, fontSize: 10, color: color.inkFaint, backgroundColor: color.glass, paddingHorizontal: 4, borderRadius: 4 },
  isinSmall: { fontFamily: font.mono, fontSize: 10, color: color.acc, backgroundColor: color.accTint, paddingHorizontal: 5, borderRadius: 4 },
  resultName: { fontFamily: font.body, fontSize: 11.5, color: color.inkFaint, marginTop: 2 },
  priceCol: { alignItems: 'flex-end', gap: 2 },
  price: { fontFamily: font.monoSemi, fontSize: 11.5, color: color.ink },
  pct: { fontFamily: font.bodySemi, fontSize: 10.5 },
  exchange: { fontFamily: font.mono, fontSize: 10, color: color.inkFaint },
  isinChipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  isinChipLabel: { fontFamily: font.bodyMed, fontSize: 11, color: color.inkFaint },
  isinChipValue: {
    fontFamily: font.mono, fontSize: 11, color: color.ink,
    backgroundColor: color.glass, borderWidth: 1, borderColor: color.glassHi,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
  },
})
