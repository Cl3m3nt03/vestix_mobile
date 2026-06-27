import { StyleSheet, Text, View, Pressable } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { useRouter, type Href } from 'expo-router'
import { Sheet } from '@/components/ui/Sheet'
import { useMe, useStats } from '@/lib/queries'
import { useAuth } from '@/lib/auth-context'
import { eur } from '@/lib/format'
import { useTheme } from '@/lib/theme-context'
import { color, font, radius, shadow } from '@/theme/tokens'

type Tone = 'acc' | 'pop' | 'violet' | 'info' | 'down' | 'd2'

interface Link {
  icon: keyof typeof Feather.glyphMap
  label: string
  sub: string
  href: string
  tone: Tone
}

const TONE: Record<Tone, { bg: string; fg: string }> = {
  acc:    { bg: color.accTint,                 fg: color.acc },
  pop:    { bg: 'rgba(230,140,44,0.14)',       fg: color.pop },
  violet: { bg: 'rgba(107,100,186,0.14)',      fg: color.violet },
  info:   { bg: 'rgba(53,144,191,0.14)',       fg: color.info },
  down:   { bg: 'rgba(206,81,77,0.12)',        fg: color.down },
  d2:     { bg: 'rgba(115,166,196,0.14)',      fg: color.d2 },
}

const SECTIONS: { title: string; eyebrow: string; links: Link[] }[] = [
  {
    title: 'Analyse',
    eyebrow: 'INSIGHTS',
    links: [
      { icon: 'bar-chart-2', label: 'Performance',   sub: 'vs CAC, S&P, MSCI',  href: '/performance', tone: 'acc'    },
      { icon: 'file-text',   label: 'Rapport',       sub: 'Synthèse PDF',        href: '/report',      tone: 'violet' },
      { icon: 'percent',     label: 'Fiscalité',     sub: 'PFU, PEA, divid.',    href: '/fiscal',      tone: 'pop'    },
      { icon: 'shuffle',     label: 'Rééquilibrage', sub: 'Cibles d\'allocation', href: '/rebalance',  tone: 'd2'     },
    ],
  },
  {
    title: 'Outils',
    eyebrow: 'EXPLORER',
    links: [
      { icon: 'message-circle', label: 'Assistant IA', sub: 'Questions finance', href: '/assistant', tone: 'acc'    },
      { icon: 'search',         label: 'Recherche',    sub: 'Titres, crypto',    href: '/explorer',  tone: 'info'   },
      { icon: 'sliders',        label: 'Simulateur',   sub: 'Projection capital', href: '/simulator', tone: 'violet' },
      { icon: 'bell',           label: 'Alertes',      sub: 'Seuils de prix',    href: '/alerts',    tone: 'down'   },
    ],
  },
  {
    title: 'Compte',
    eyebrow: 'CONFIG',
    links: [
      { icon: 'target',      label: 'Objectifs',   sub: 'Capital cible',        href: '/goals',    tone: 'acc'    },
      { icon: 'credit-card', label: 'Banques',     sub: 'Synchros agrégateur',  href: '/bank',     tone: 'info'   },
      { icon: 'award',       label: 'Collection',  sub: 'TCG HoloFolio',        href: '/pokemon',  tone: 'pop'    },
      { icon: 'settings',    label: 'Réglages',    sub: 'Compte & sécurité',    href: '/settings', tone: 'd2'     },
    ],
  },
]

/** Feuille « Plus » — hero profil + 3 sections groupées avec micro-cards. */
export function MoreSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter()
  const { accent } = useTheme()
  const me = useMe()
  const stats = useStats()
  const { signOut } = useAuth()

  const go = (href: string) => { onClose(); router.push(href as Href) }
  const initials = (me.data?.name ?? me.data?.email ?? '?').slice(0, 2).toUpperCase()

  return (
    <Sheet visible={visible} onClose={onClose} title="Plus">
      {/* Hero profil */}
      <Animated.View entering={FadeInUp.duration(260)}>
        <Pressable onPress={() => go('/settings')} style={({ pressed }) => [styles.hero, { shadowColor: accent.acc }, pressed && { opacity: 0.95 }]}>
          <LinearGradient colors={accent.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBg}>
            <View style={styles.heroRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{initials}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.heroName} numberOfLines={1}>
                  {me.data?.name ?? 'Mon compte'}
                </Text>
                <Text style={styles.heroEmail} numberOfLines={1}>
                  {me.data?.email ?? ''}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.85)" />
            </View>

            {stats.data ? (
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>PATRIMOINE</Text>
                  <Text style={styles.heroStatValue}>{eur(stats.data.totalValue)}</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>PLUS-VALUE</Text>
                  <Text
                    style={[styles.heroStatValue, {
                      color: stats.data.totalPnl >= 0 ? '#cffce0' : '#ffd2cf',
                    }]}
                  >
                    {stats.data.totalPnl >= 0 ? '+' : ''}{eur(stats.data.totalPnl)}
                  </Text>
                </View>
              </View>
            ) : null}
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Sections groupées */}
      {SECTIONS.map((section, sIdx) => (
        <Animated.View
          key={section.title}
          entering={FadeInUp.duration(260).delay(80 + sIdx * 60)}
          style={styles.section}
        >
          <View style={styles.sectionHead}>
            <Text style={styles.sectionEyebrow}>{section.eyebrow}</Text>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          <View style={styles.grid}>
            {section.links.map((l, i) => {
              const tone = l.tone === 'acc' ? { bg: accent.accTint, fg: accent.acc } : TONE[l.tone]
              return (
                <Animated.View
                  key={l.href}
                  entering={FadeInUp.duration(220).delay(120 + sIdx * 60 + i * 25)}
                  style={styles.cellWrap}
                >
                  <Pressable
                    onPress={() => go(l.href)}
                    style={({ pressed }) => [styles.cell, pressed && [styles.cellPressed, { borderColor: accent.acc }]]}
                  >
                    <View style={[styles.cellIco, { backgroundColor: tone.bg }]}>
                      <Feather name={l.icon} size={18} color={tone.fg} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.cellLabel} numberOfLines={1}>{l.label}</Text>
                      <Text style={styles.cellSub} numberOfLines={1}>{l.sub}</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              )
            })}
          </View>
        </Animated.View>
      ))}

      {/* Déconnexion */}
      <Animated.View entering={FadeInUp.duration(220).delay(380)}>
        <Pressable
          onPress={() => { onClose(); signOut() }}
          style={({ pressed }) => [styles.logout, pressed && { opacity: 0.85 }]}
        >
          <Feather name="log-out" size={15} color={color.down} />
          <Text style={styles.logoutTxt}>Se déconnecter</Text>
        </Pressable>
      </Animated.View>
    </Sheet>
  )
}

const styles = StyleSheet.create({
  // Hero
  hero: { borderRadius: 22, overflow: 'hidden', ...shadow.sm, shadowColor: color.acc, marginBottom: 18 },
  heroBg: { padding: 16, gap: 14 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarTxt: { fontFamily: font.display, fontSize: 17, color: color.white },
  heroName: { fontFamily: font.display, fontSize: 18, color: color.white },
  heroEmail: { fontFamily: font.body, fontSize: 12.5, color: 'rgba(255,255,255,0.78)', marginTop: 2 },
  heroStats: {
    flexDirection: 'row', alignItems: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14, padding: 12, gap: 12,
  },
  heroStat: { flex: 1 },
  heroStatLabel: { fontFamily: font.mono, fontSize: 9.5, letterSpacing: 0.8, color: 'rgba(255,255,255,0.70)' },
  heroStatValue: { fontFamily: font.monoSemi, fontSize: 15, color: color.white, marginTop: 3, fontVariant: ['tabular-nums'] },
  heroDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.18)' },

  // Sections
  section: { marginBottom: 16 },
  sectionHead: { marginBottom: 8, paddingHorizontal: 2 },
  sectionEyebrow: { fontFamily: font.mono, fontSize: 9.5, letterSpacing: 1.4, color: color.inkFaint },
  sectionTitle: { fontFamily: font.display, fontSize: 15, color: color.ink, marginTop: 2 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cellWrap: { width: '48.5%' },
  cell: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 11, paddingHorizontal: 11,
    borderRadius: radius.sm,
    borderWidth: 1, borderColor: color.glassHi,
    backgroundColor: color.white,
  },
  cellPressed: { opacity: 0.92, transform: [{ scale: 0.985 }], borderColor: color.acc },
  cellIco: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  cellLabel: { fontFamily: font.bodySemi, fontSize: 13, color: color.ink },
  cellSub: { fontFamily: font.mono, fontSize: 9.5, letterSpacing: 0.3, color: color.inkFaint, marginTop: 2 },

  // Logout
  logout: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, marginTop: 6, borderRadius: radius.sm,
    borderWidth: 1, borderColor: 'rgba(206,81,77,0.25)',
    backgroundColor: 'rgba(206,81,77,0.06)',
  },
  logoutTxt: { fontFamily: font.bodySemi, fontSize: 13, color: color.down },
})
