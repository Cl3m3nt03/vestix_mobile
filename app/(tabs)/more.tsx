import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter, type Href } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxCard } from '@/components/ui/FxCard'
import { Touchable } from '@/components/ui/Touchable'
import { useTheme } from '@/lib/theme-context'
import { FxButton } from '@/components/ui/FxButton'
import { useMe } from '@/lib/queries'
import { useAuth } from '@/lib/auth-context'
import { color, font } from '@/theme/tokens'

const LINKS: { icon: keyof typeof Feather.glyphMap; label: string; href?: string }[] = [
  { icon: 'search', label: 'Recherche', href: '/explorer' },
  { icon: 'target', label: 'Objectifs', href: '/goals' },
  { icon: 'bar-chart-2', label: 'Performance', href: '/performance' },
  { icon: 'file-text', label: 'Rapport', href: '/report' },
  { icon: 'percent', label: 'Fiscalité', href: '/fiscal' },
  { icon: 'shuffle', label: 'Rééquilibrage', href: '/rebalance' },
  { icon: 'settings', label: 'Réglages', href: '/settings' },
  { icon: 'credit-card', label: 'Comptes bancaires', href: '/bank' },
  { icon: 'message-circle', label: 'Assistant IA', href: '/assistant' },
  { icon: 'bell', label: 'Alertes de prix', href: '/alerts' },
  { icon: 'sliders', label: 'Simulateur', href: '/simulator' },
  { icon: 'award', label: 'Collection TCG', href: '/pokemon' },
]

export default function More() {
  const me = useMe()
  const router = useRouter()
  const { accent } = useTheme()
  const { signOut } = useAuth()

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="VESTIX" title="Plus" />

        <FxCard>
          <View style={styles.profile}>
            <View style={[styles.avatar, { backgroundColor: accent.acc3 }]}>
              <Text style={styles.avatarTxt}>{(me.data?.name ?? me.data?.email ?? '?').slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{me.data?.name ?? 'Mon compte'}</Text>
              <Text style={styles.email} numberOfLines={1}>{me.data?.email ?? ''}</Text>
            </View>
          </View>
        </FxCard>

        <FxCard style={{ padding: 8 }}>
          {LINKS.map((l, i) => (
            <Touchable
              key={l.label}
              disabled={!l.href}
              onPress={() => l.href && router.push(l.href as Href)}
              style={[styles.link, i > 0 && styles.border, !l.href && { opacity: 0.45 }]}
            >
              <Feather name={l.icon} size={19} color={color.inkSoft} />
              <Text style={styles.linkTxt}>{l.label}</Text>
              <Feather name="chevron-right" size={18} color={color.inkFaint} />
            </Touchable>
          ))}
        </FxCard>

        <FxButton label="Se déconnecter" variant="danger" onPress={signOut} />
        <View style={{ height: 16 }} />
      </ScrollView>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: color.acc3 },
  avatarTxt: { fontFamily: font.display, fontSize: 16, color: color.white },
  name: { fontFamily: font.display, fontSize: 17, color: color.ink },
  email: { fontFamily: font.body, fontSize: 13, color: color.inkSoft, marginTop: 2 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, paddingHorizontal: 10 },
  border: { borderTopWidth: 1, borderTopColor: color.hair2 },
  linkTxt: { flex: 1, fontFamily: font.bodyMed, fontSize: 14.5, color: color.ink },
})
