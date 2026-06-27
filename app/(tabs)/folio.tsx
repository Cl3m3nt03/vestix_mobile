import { useState, useRef } from 'react'
import { ActivityIndicator, Alert, Animated as RNAnimated, ScrollView, StyleSheet, Text, View, RefreshControl, Pressable } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { Swipeable } from 'react-native-gesture-handler'
import { Feather } from '@expo/vector-icons'
import { useRouter, type Href } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { AddButton } from '@/components/ui/AddButton'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxPill } from '@/components/ui/FxPill'
import { Donut, Slice } from '@/components/ui/Donut'
import { AddAsset } from '@/components/forms/AddAsset'
import { useStats, useAssets, useDeleteAsset } from '@/lib/queries'
import type { AssetType, Asset } from '@/lib/types'
import { eur, CAT } from '@/lib/format'
import { tapLight } from '@/lib/haptics'
import { useTheme } from '@/lib/theme-context'
import { color, font, radius } from '@/theme/tokens'

const ACTION_WIDTH = 96

export default function Folio() {
  const router = useRouter()
  const { accent } = useTheme()
  const stats = useStats()
  const assets = useAssets()
  const loading = stats.isLoading || assets.isLoading
  const error = stats.error || assets.error
  const refreshing = stats.isRefetching || assets.isRefetching
  const refetch = () => { stats.refetch(); assets.refetch() }

  const [add, setAdd] = useState(false)

  const slices: Slice[] = stats.data
    ? (Object.entries(stats.data.breakdown) as [AssetType, number][])
        .filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
        .map(([k, v]) => ({ label: CAT[k].label, value: v, color: CAT[k].color }))
    : []

  return (
    <AppShell>
      <AddAsset visible={add} onClose={() => setAdd(false)} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={accent.acc} />}
      >
        <ScreenHeader eyebrow="VESTIX" title="Portefeuille" right={<AddButton onPress={() => setAdd(true)} />} />

        {loading ? (
          <View style={styles.center}><ActivityIndicator color={accent.acc} /></View>
        ) : error ? (
          <FxCard><Text style={styles.err}>{String((error as Error).message)}</Text></FxCard>
        ) : (
          <>
            <FxCard>
              <FxCardHeader title="Répartition" sub={eur(stats.data!.totalValue)} />
              {slices.length ? <Donut centerValue={eur(stats.data!.totalValue)} centerLabel="Total" slices={slices} />
                : <Text style={styles.muted}>Aucun actif.</Text>}
            </FxCard>

            <FxCard>
              <FxCardHeader title="Tous les actifs" sub={`${assets.data!.length} LIGNES`} />
              {assets.data!.map((a, i) => (
                <Animated.View key={a.id} entering={FadeInUp.duration(280).delay(i * 30)}>
                  <AssetRow
                    asset={a}
                    first={i === 0}
                    onPress={() => router.push(`/product/${a.id}` as Href)}
                  />
                </Animated.View>
              ))}
            </FxCard>
          </>
        )}
        <View style={{ height: 16 }} />
      </ScrollView>
    </AppShell>
  )
}

/** Ligne d'actif avec swipe-to-delete vers la gauche (action poubelle rouge). */
function AssetRow({
  asset, first, onPress,
}: {
  asset: Asset
  first: boolean
  onPress: () => void
}) {
  const cat = CAT[asset.type] ?? CAT.OTHER
  const pnl = asset.holdings?.[0]?.pnlPercentEur
  const del = useDeleteAsset()
  const ref = useRef<Swipeable | null>(null)

  const askDelete = () => {
    Alert.alert(
      'Supprimer cet actif ?',
      `« ${asset.name} » sera retiré du portefeuille.`,
      [
        { text: 'Annuler', style: 'cancel', onPress: () => ref.current?.close() },
        { text: 'Supprimer', style: 'destructive', onPress: () => del.mutate(asset.id) },
      ],
      { cancelable: true, onDismiss: () => ref.current?.close() },
    )
  }

  const renderRightActions = (
    _progress: RNAnimated.AnimatedInterpolation<number>,
    dragX: RNAnimated.AnimatedInterpolation<number>,
  ) => {
    // Le bouton « suit » le doigt depuis la droite : tant que le swipe n'est
    // pas complet, il translate avec le drag et ne se superpose pas à la row.
    const translateX = dragX.interpolate({
      inputRange: [-ACTION_WIDTH, 0],
      outputRange: [0, ACTION_WIDTH],
      extrapolate: 'clamp',
    })
    return (
      <RNAnimated.View style={[styles.deleteWrap, { transform: [{ translateX }] }]}>
        <Pressable onPress={askDelete} style={({ pressed }) => [styles.deleteAction, pressed && { opacity: 0.85 }]}>
          <Feather name="trash-2" size={22} color={color.white} />
          <Text style={styles.deleteTxt}>Supprimer</Text>
        </Pressable>
      </RNAnimated.View>
    )
  }

  return (
    <Swipeable
      ref={ref}
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
      friction={2}
    >
      <Pressable
        onPress={() => {
          tapLight()
          onPress()
        }}
        style={({ pressed }) => [styles.row, !first && styles.border, pressed && styles.pressed]}
      >
        <View style={[styles.logo, { backgroundColor: cat.color + '22' }]}>
          <Text style={[styles.logoTxt, { color: cat.color }]}>{asset.name.slice(0, 3).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{asset.name}</Text>
          <Text style={styles.cat}>{cat.label}{asset.institution ? ` · ${asset.institution}` : ''}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={styles.val}>{eur(asset.value)}</Text>
          {typeof pnl === 'number' ? <FxPill dir={pnl >= 0 ? 'up' : 'down'} label={`${Math.abs(pnl).toFixed(1)} %`} /> : null}
        </View>
      </Pressable>
    </Swipeable>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
  center: { paddingVertical: 60, alignItems: 'center' },
  muted: { fontFamily: font.body, fontSize: 13.5, color: color.inkSoft },
  err: { fontFamily: font.bodyMed, fontSize: 13.5, color: color.down },
  // bg opaque : la row masque le bouton supprimer tant qu'elle n'a pas glissé
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 13, paddingHorizontal: 2, backgroundColor: color.card },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  pressed: { opacity: 0.96, transform: [{ scale: 0.985 }] },
  logo: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  logoTxt: { fontFamily: font.display, fontSize: 12 },
  name: { fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink },
  cat: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', color: color.inkFaint, marginTop: 2 },
  val: { fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink, fontVariant: ['tabular-nums'] },
  deleteWrap: { width: ACTION_WIDTH, justifyContent: 'center' },
  deleteAction: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: color.down, borderRadius: radius.sm,
    marginLeft: 8, marginVertical: 4,
  },
  deleteTxt: { fontFamily: font.bodySemi, fontSize: 11, color: color.white, letterSpacing: 0.3 },
})
