import { useState, useEffect } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxCard, FxCardHeader } from '@/components/ui/FxCard'
import { FxButton } from '@/components/ui/FxButton'
import { FxBadge } from '@/components/ui/FxBadge'
import { Field } from '@/components/ui/Field'
import { useMe, useUpdateProfile } from '@/lib/queries'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { color, font } from '@/theme/tokens'

export default function Settings() {
  const router = useRouter()
  const qc = useQueryClient()
  const me = useMe()
  const update = useUpdateProfile()
  const { signOut } = useAuth()

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

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow="VESTIX" title="Réglages" onBack={() => router.back()} />

        {me.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
        ) : (
          <>
            <FxCard>
              <FxCardHeader title="Profil" />
              <Field label="Nom" value={name} onChangeText={setName} />
              <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              {msg ? <Text style={styles.msg}>{msg}</Text> : null}
              <FxButton label={update.isPending ? '...' : 'Enregistrer'} onPress={saveProfile} />
            </FxCard>

            <FxCard>
              <FxCardHeader
                title="Double authentification"
                sub="CODE EMAIL À LA CONNEXION"
                right={enabled ? <FxBadge label="Active" tone="live" /> : <FxBadge label="Inactive" tone="soft" />}
              />
              {mode ? (
                <>
                  <Text style={styles.muted}>Code à 6 chiffres envoyé par email.</Text>
                  <Field label="Code OTP" value={code} onChangeText={setCode} keyboardType="number-pad" />
                  {tfaErr ? <Text style={styles.err}>{tfaErr}</Text> : null}
                  <FxButton label={busy ? '...' : 'Valider'} onPress={confirmTfa} />
                </>
              ) : (
                <>
                  {tfaErr ? <Text style={styles.err}>{tfaErr}</Text> : null}
                  <FxButton
                    label={busy ? '...' : enabled ? 'Désactiver la 2FA' : 'Activer la 2FA'}
                    variant={enabled ? 'danger' : 'primary'}
                    onPress={() => startTfa(enabled ? 'disable' : 'enable')}
                  />
                </>
              )}
            </FxCard>

            <FxButton label="Se déconnecter" variant="ghost" onPress={signOut} />
          </>
        )}
        <View style={{ height: 16 }} />
      </ScrollView>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
  center: { paddingVertical: 60, alignItems: 'center' },
  muted: { fontFamily: font.body, fontSize: 13, color: color.inkSoft, marginBottom: 10 },
  msg: { fontFamily: font.bodyMed, fontSize: 13, color: color.acc, marginBottom: 10 },
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginBottom: 10 },
})
