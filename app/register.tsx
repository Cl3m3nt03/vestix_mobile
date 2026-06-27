import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { FxCard } from '@/components/ui/FxCard'
import { FxButton } from '@/components/ui/FxButton'
import { Field } from '@/components/ui/Field'
import { api, ApiError } from '@/lib/api'
import { useTheme } from '@/lib/theme-context'
import { color, font } from '@/theme/tokens'

export default function Register() {
  const router = useRouter()
  const { accent } = useTheme()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submitForm = async () => {
    setErr(null)
    if (!consent) { setErr('Accepte la politique de confidentialité pour continuer.'); return }
    setLoading(true)
    try {
      await api.post('/api/auth/register', { name: name.trim(), email: email.trim(), password, consent: true })
      setStep('otp')
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Échec de l’inscription')
    } finally { setLoading(false) }
  }

  const submitOtp = async () => {
    setErr(null)
    setLoading(true)
    try {
      await api.post('/api/auth/register/verify-2fa', { email: email.trim().toLowerCase(), code: otp.trim() })
      router.replace('/login')
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Code incorrect')
    } finally { setLoading(false) }
  }

  return (
    <AppShell>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: accent.acc }]}><Feather name="trending-up" size={22} color={color.white} /></View>
            <Text style={styles.name}>Créer un compte</Text>
          </View>

          <FxCard style={{ gap: 6 }}>
            {step === 'form' ? (
              <>
                <Field label="Nom" value={name} onChangeText={setName} />
                <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
                <Text style={styles.hint}>8 caractères min., 1 majuscule, 1 chiffre.</Text>
                <Pressable onPress={() => setConsent((c) => !c)} style={styles.consent}>
                  <View style={[styles.box, consent && { backgroundColor: accent.acc, borderColor: accent.acc }]}>
                    {consent ? <Feather name="check" size={14} color={color.white} /> : null}
                  </View>
                  <Text style={styles.consentTxt}>J’accepte la politique de confidentialité (RGPD).</Text>
                </Pressable>
                {err ? <Text style={styles.err}>{err}</Text> : null}
                <FxButton label={loading ? '...' : 'Créer le compte'} onPress={submitForm} style={{ marginTop: 6 }} />
              </>
            ) : (
              <>
                <Text style={styles.help}>Code à 6 chiffres envoyé à {email}.</Text>
                <Field label="Code de vérification" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
                {err ? <Text style={styles.err}>{err}</Text> : null}
                <FxButton label={loading ? '...' : 'Vérifier'} onPress={submitOtp} style={{ marginTop: 6 }} />
              </>
            )}
          </FxCard>

          <Pressable onPress={() => router.replace('/login')} style={styles.link}>
            <Text style={[styles.linkTxt, { color: accent.acc }]}>Déjà un compte ? Se connecter</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 18 },
  brand: { alignItems: 'center', gap: 10 },
  logo: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: color.acc },
  name: { fontFamily: font.display, fontSize: 22, color: color.ink },
  hint: { fontFamily: font.body, fontSize: 12, color: color.inkFaint, marginBottom: 6 },
  help: { fontFamily: font.body, fontSize: 13.5, color: color.inkSoft, marginBottom: 4 },
  consent: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, marginBottom: 4 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: color.glassHi, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: color.acc, borderColor: color.acc },
  consentTxt: { flex: 1, fontFamily: font.body, fontSize: 13, color: color.inkSoft },
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginVertical: 4 },
  link: { alignItems: 'center' },
  linkTxt: { fontFamily: font.bodySemi, fontSize: 14, color: color.acc },
})
