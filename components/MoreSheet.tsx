import { StyleSheet, Text, View, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter, type Href } from 'expo-router'
import { Sheet } from '@/components/ui/Sheet'
import { FxButton } from '@/components/ui/FxButton'
import { useMe } from '@/lib/queries'
import { useAuth } from '@/lib/auth-context'
import { color, font } from '@/theme/tokens'

const LINKS: { icon: keyof typeof Feather.glyphMap; label: string; href: string }[] = [
  { icon: 'search', label: 'Recherche', href: '/explorer' },
  { icon: 'target', label: 'Objectifs', href: '/goals' },
  { icon: 'bar-chart-2', label: 'Performance', href: '/performance' },
  { icon: 'file-text', label: 'Rapport', href: '/report' },
  { icon: 'percent', label: 'Fiscalité', href: '/fiscal' },
  { icon: 'shuffle', label: 'Rééquilibrage', href: '/rebalance' },
  { icon: 'credit-card', label: 'Banques', href: '/bank' },
  { icon: 'message-circle', label: 'Assistant IA', href: '/assistant' },
  { icon: 'bell', label: 'Alertes', href: '/alerts' },
  { icon: 'sliders', label: 'Simulateur', href: '/simulator' },
  { icon: 'award', label: 'Collection', href: '/pokemon' },
  { icon: 'settings', label: 'Réglages', href: '/settings' },
]

/** Feuille « Plus » qui monte du bas — grille d'accès + profil + déconnexion. */
export function MoreSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter()
  const me = useMe()
  const { signOut } = useAuth()

  const go = (href: string) => { onClose(); router.push(href as Href) }

  return (
    <Sheet visible={visible} onClose={onClose} title="Plus">
      <Pressable style={styles.profile} onPress={() => go('/settings')}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{(me.data?.name ?? me.data?.email ?? '?').slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{me.data?.name ?? 'Mon compte'}</Text>
          <Text style={styles.email} numberOfLines={1}>{me.data?.email ?? ''}</Text>
        </View>
        <Feather name="chevron-right" size={18} color={color.inkFaint} />
      </Pressable>

      <View style={styles.grid}>
        {LINKS.map((l) => (
          <Pressable key={l.href} style={styles.cell} onPress={() => go(l.href)}>
            <View style={styles.cellIco}><Feather name={l.icon} size={20} color={color.acc} /></View>
            <Text style={styles.cellTxt} numberOfLines={1}>{l.label}</Text>
          </Pressable>
        ))}
      </View>

      <FxButton label="Se déconnecter" variant="danger" onPress={() => { onClose(); signOut() }} style={{ marginTop: 10 }} />
    </Sheet>
  )
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16,
    backgroundColor: color.white, borderWidth: 1, borderColor: color.glassHi, marginBottom: 14,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: color.acc3 },
  avatarTxt: { fontFamily: font.display, fontSize: 15, color: color.white },
  name: { fontFamily: font.display, fontSize: 16, color: color.ink },
  email: { fontFamily: font.body, fontSize: 12.5, color: color.inkSoft, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: {
    width: '31%', flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16,
    borderRadius: 16, backgroundColor: color.white, borderWidth: 1, borderColor: color.glassHi,
  },
  cellIco: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: color.accTint },
  cellTxt: { fontFamily: font.bodySemi, fontSize: 12, color: color.ink, textAlign: 'center' },
})
