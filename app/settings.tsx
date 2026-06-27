import { useState, useEffect } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, {
  FadeInUp, FadeOut, LinearTransition, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxButton } from '@/components/ui/FxButton'
import { Field } from '@/components/ui/Field'
import { useMe, useUpdateProfile, useAssets } from '@/lib/queries'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { tapLight } from '@/lib/haptics'
import { eur } from '@/lib/format'
import { color, font, radius, shadow, THEME_META, type ThemeKey } from '@/theme/tokens'

const THEME_ORDER: ThemeKey[] = ['emerald', 'orange', 'violet', 'blue']

type Section = 'profil' | 'theme' | 'security' | 'data' | 'danger'

export default function Settings() {
  const router = useRouter()
  const qc = useQueryClient()
  const me = useMe()
  const assets = useAssets()
  const update = useUpdateProfile()
  const { signOut } = useAuth()
  const { key: themeKey, setTheme, accent } = useTheme()

  // Accordéon : une seule section ouverte à la fois (null = tout fermé).
  const [open, setOpen] = useState<Section | null>(null)
  const toggle = (s: Section) => {
    tapLight()
    setOpen((cur) => (cur === s ? null : s))
  }

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  // 2FA
  const [code, setCode] = useState('')
  const [mode, setMode] = useState<null | 'enable' | 'disable'>(null)
  const [busy, setBusy] = useState(false)
  const [tfaErr, setTfaErr] = useState<string | null>(null)

  useEffect(() => {
    if (me.data) { setName(me.data.name ?? ''); setEmail(me.data.email) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.data?.id])

  const saveProfile = async () => {
    setMsg(null)
    try {
      await update.mutateAsync({ name: name.trim(), email: email.trim() })
      setMsg('Profil enregistré ✓')
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'Échec')
    }
  }

  const enabled = me.data?.twoFactorEnabled

  const startTfa = async (m: 'enable' | 'disable') => {
    setTfaErr(null); setBusy(true)
    try {
      await api.post(m === 'enable' ? '/api/auth/2fa/setup' : '/api/auth/2fa/disable', {})
      setMode(m)
    } catch (e) {
      setTfaErr(e instanceof ApiError ? e.message : 'Échec')
    } finally { setBusy(false) }
  }

  const confirmTfa = async () => {
    setTfaErr(null); setBusy(true)
    try {
      if (mode === 'enable') await api.post('/api/auth/2fa/verify', { code: code.trim() })
      else await api.post('/api/auth/2fa/disable', { code: code.trim() })
      setMode(null); setCode('')
      qc.invalidateQueries({ queryKey: ['me'] })
    } catch (e) {
      setTfaErr(e instanceof ApiError ? e.message : 'Code incorrect')
    } finally { setBusy(false) }
  }

  // Compte
  const [exporting, setExporting] = useState(false)
  const [delPwd, setDelPwd] = useState('')
  const [delErr, setDelErr] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const exportData = async () => {
    setExporting(true)
    try {
      const data = await api.get<unknown>('/api/users/export')
      const uri = FileSystem.documentDirectory + `vestix-export-${new Date().toISOString().slice(0, 10)}.json`
      await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2))
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri)
      else Alert.alert('Export', `Données enregistrées : ${uri}`)
    } catch (e) {
      Alert.alert('Export', e instanceof ApiError ? e.message : 'Échec de l’export')
    } finally { setExporting(false) }
  }

  const confirmDeleteAccount = () => {
    Alert.alert('Supprimer le compte', 'Action IRRÉVERSIBLE : toutes tes données seront effacées. Continuer ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: doDeleteAccount },
    ])
  }

  const doDeleteAccount = async () => {
    setDelErr(null)
    if (!delPwd) { setDelErr('Mot de passe requis pour confirmer'); return }
    setDeleting(true)
    try {
      await api.post('/api/users/delete-account', { password: delPwd })
      await signOut()
    } catch (e) {
      setDelErr(e instanceof ApiError ? e.message : 'Échec de la suppression')
    } finally { setDeleting(false) }
  }

  const initials = (me.data?.name ?? me.data?.email ?? '?').slice(0, 2).toUpperCase()
  const assetCount = assets.data?.length ?? 0

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow="VESTIX" title="Réglages" onBack={() => router.back()} />

        {me.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={accent.acc} /></View>
        ) : (
          <>
            {/* Hero profil */}
            <Animated.View entering={FadeInUp.duration(260)}>
              <View style={[styles.hero, { shadowColor: accent.acc }]}>
                <LinearGradient colors={accent.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBg}>
                  <View style={styles.heroTop}>
                    <View style={styles.avatar}><Text style={styles.avatarTxt}>{initials}</Text></View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.heroName} numberOfLines={1}>{me.data?.name ?? 'Mon compte'}</Text>
                      <Text style={styles.heroEmail} numberOfLines={1}>{me.data?.email}</Text>
                    </View>
                  </View>
                  <View style={styles.heroStats}>
                    <View style={styles.heroStat}>
                      <Text style={styles.heroStatLabel}>ACTIFS</Text>
                      <Text style={styles.heroStatValue}>{assetCount}</Text>
                    </View>
                    <View style={styles.heroDivider} />
                    <View style={styles.heroStat}>
                      <Text style={styles.heroStatLabel}>2FA</Text>
                      <Text style={styles.heroStatValue}>{enabled ? 'Active' : 'Off'}</Text>
                    </View>
                    <View style={styles.heroDivider} />
                    <View style={styles.heroStat}>
                      <Text style={styles.heroStatLabel}>ID</Text>
                      <Text style={styles.heroStatValue} numberOfLines={1}>{(me.data?.id ?? '').slice(0, 6)}…</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>

            {/* Liste de réglages — rangées dépliables */}
            <Animated.View entering={FadeInUp.duration(260).delay(80)} layout={LinearTransition.duration(220)} style={styles.list}>
              <Row icon="user" tint={accent.acc} label="Profil" open={open === 'profil'} onPress={() => toggle('profil')}>
                <Field label="Nom" value={name} onChangeText={setName} />
                <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                {msg ? <Text style={[styles.msg, { color: accent.acc }]}>{msg}</Text> : null}
                <FxButton label={update.isPending ? '…' : 'Enregistrer'} onPress={saveProfile} />
              </Row>

              <Row
                icon="droplet"
                tint={accent.acc}
                label="Thème"
                valueDot={THEME_META[themeKey].swatch}
                valueText={THEME_META[themeKey].label}
                open={open === 'theme'}
                onPress={() => toggle('theme')}
              >
                <Text style={styles.muted}>Teinte d'accent de l'app — appliquée partout, gardée sur cet appareil.</Text>
                <View style={styles.themeRow}>
                  {THEME_ORDER.map((k) => {
                    const on = k === themeKey
                    const sw = THEME_META[k].swatch
                    return (
                      <Pressable key={k} onPress={() => { tapLight(); setTheme(k) }} style={styles.themeItem}>
                        <View style={[styles.swatch, { borderColor: on ? sw : 'transparent' }]}>
                          <View style={[styles.swatchFill, { backgroundColor: sw }]}>
                            {on ? <Feather name="check" size={18} color={color.white} /> : null}
                          </View>
                        </View>
                        <Text style={[styles.themeLbl, on && { color: sw, fontFamily: font.bodySemi }]}>{THEME_META[k].label}</Text>
                      </Pressable>
                    )
                  })}
                </View>
              </Row>

              <Row
                icon="shield"
                tint={color.violet}
                label="Double authentification"
                valueText={enabled ? 'Active' : 'Inactive'}
                valueTone={enabled ? color.up : color.inkFaint}
                open={open === 'security'}
                onPress={() => toggle('security')}
              >
                <Text style={styles.muted}>Reçois un code à 6 chiffres par email à chaque connexion. Recommandé.</Text>
                {mode ? (
                  <>
                    <Field label="Code OTP (email)" value={code} onChangeText={setCode} keyboardType="number-pad" />
                    {tfaErr ? <Text style={styles.err}>{tfaErr}</Text> : null}
                    <FxButton label={busy ? '…' : 'Valider'} onPress={confirmTfa} />
                  </>
                ) : (
                  <>
                    {tfaErr ? <Text style={styles.err}>{tfaErr}</Text> : null}
                    <FxButton
                      label={busy ? '…' : enabled ? 'Désactiver la 2FA' : 'Activer la 2FA'}
                      variant={enabled ? 'danger' : 'primary'}
                      onPress={() => startTfa(enabled ? 'disable' : 'enable')}
                    />
                  </>
                )}
              </Row>

              <Row icon="download" tint={color.info} label="Mes données" open={open === 'data'} onPress={() => toggle('data')}>
                <Text style={styles.muted}>Télécharge l'intégralité de tes données au format JSON.</Text>
                <FxButton label={exporting ? 'Export…' : 'Exporter mes données'} variant="ghost" onPress={exportData} />
              </Row>

              <Row icon="alert-triangle" tint={color.down} label="Zone sensible" danger open={open === 'danger'} onPress={() => toggle('danger')} last>
                <Text style={styles.muted}>Suppression définitive du compte et de toutes les données. Saisis ton mot de passe pour confirmer.</Text>
                <Field label="Mot de passe" value={delPwd} onChangeText={setDelPwd} secureTextEntry placeholder="••••••••" />
                {delErr ? <Text style={styles.err}>{delErr}</Text> : null}
                <FxButton label={deleting ? '…' : 'Supprimer mon compte'} variant="danger" onPress={confirmDeleteAccount} />
              </Row>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(240).delay(160)}>
              <Pressable
                onPress={() => { tapLight(); signOut() }}
                style={({ pressed }) => [styles.logout, pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] }]}
              >
                <Feather name="log-out" size={15} color={color.inkSoft} />
                <Text style={styles.logoutTxt}>Se déconnecter</Text>
              </Pressable>
            </Animated.View>
          </>
        )}
        <View style={{ height: 16 }} />
      </ScrollView>
    </AppShell>
  )
}

/** Chevron qui pivote de 90° à l'ouverture. */
function Chevron({ open }: { open: boolean }) {
  const r = useSharedValue(open ? 1 : 0)
  useEffect(() => { r.value = withTiming(open ? 1 : 0, { duration: 200 }) }, [open, r])
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value * 90}deg` }] }))
  return (
    <Animated.View style={st}>
      <Feather name="chevron-right" size={18} color={color.inkFaint} />
    </Animated.View>
  )
}

/** Rangée de réglage style iOS : icône teintée + label + valeur + chevron, dépliable. */
function Row({
  icon, tint, label, valueText, valueDot, valueTone, danger, open, onPress, last, children,
}: {
  icon: keyof typeof Feather.glyphMap
  tint: string
  label: string
  valueText?: string
  valueDot?: string
  valueTone?: string
  danger?: boolean
  open: boolean
  onPress: () => void
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, !last && !open && styles.rowBorder, pressed && { backgroundColor: color.glass }]}
      >
        <View style={[styles.rowIco, { backgroundColor: tint + '1f' }]}>
          <Feather name={icon} size={16} color={tint} />
        </View>
        <Text style={[styles.rowLabel, danger && { color: color.down }]} numberOfLines={1}>{label}</Text>
        {valueDot ? <View style={[styles.valDot, { backgroundColor: valueDot }]} /> : null}
        {valueText ? <Text style={[styles.rowValue, valueTone && { color: valueTone }]} numberOfLines={1}>{valueText}</Text> : null}
        <Chevron open={open} />
      </Pressable>
      {open ? (
        <Animated.View
          entering={FadeInUp.duration(200)}
          exiting={FadeOut.duration(120)}
          style={[styles.rowBody, !last && styles.rowBorder]}
        >
          {children}
        </Animated.View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
  center: { paddingVertical: 60, alignItems: 'center' },
  muted: { fontFamily: font.body, fontSize: 13, color: color.inkSoft, marginBottom: 12, lineHeight: 18 },
  msg: { fontFamily: font.bodyMed, fontSize: 13, marginBottom: 10 },
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginBottom: 10 },

  // Hero
  hero: { borderRadius: 24, overflow: 'hidden', ...shadow.sm },
  heroBg: { padding: 18, gap: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarTxt: { fontFamily: font.display, fontSize: 18, color: color.white },
  heroName: { fontFamily: font.display, fontSize: 19, color: color.white },
  heroEmail: { fontFamily: font.body, fontSize: 12.5, color: 'rgba(255,255,255,0.78)', marginTop: 2 },
  heroStats: {
    flexDirection: 'row', alignItems: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12, gap: 12,
  },
  heroStat: { flex: 1 },
  heroStatLabel: { fontFamily: font.mono, fontSize: 9.5, letterSpacing: 0.8, color: 'rgba(255,255,255,0.70)' },
  heroStatValue: { fontFamily: font.monoSemi, fontSize: 15, color: color.white, marginTop: 3, fontVariant: ['tabular-nums'] },
  heroDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.18)' },

  // Liste
  list: {
    backgroundColor: color.card,
    borderWidth: 1, borderColor: color.glassHi, borderRadius: radius.lg,
    paddingHorizontal: 14, overflow: 'hidden', ...shadow.sm,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, marginHorizontal: -14, paddingHorizontal: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: color.hair2 },
  rowIco: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontFamily: font.bodySemi, fontSize: 14.5, color: color.ink },
  rowValue: { fontFamily: font.bodyMed, fontSize: 13, color: color.inkSoft },
  valDot: { width: 12, height: 12, borderRadius: 6 },
  rowBody: { paddingBottom: 16, paddingTop: 2 },

  // Theme picker
  themeRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  themeItem: { flex: 1, alignItems: 'center', gap: 7 },
  swatch: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center', padding: 3 },
  swatchFill: { flex: 1, alignSelf: 'stretch', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  themeLbl: { fontFamily: font.bodyMed, fontSize: 12, color: color.inkSoft },

  // Logout
  logout: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: radius.sm,
    backgroundColor: color.glass2, borderWidth: 1, borderColor: color.glassHi,
  },
  logoutTxt: { fontFamily: font.bodySemi, fontSize: 13.5, color: color.inkSoft },
})
