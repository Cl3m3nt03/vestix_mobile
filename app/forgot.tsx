import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { FxCard } from '@/components/ui/FxCard'
import { FxButton } from '@/components/ui/FxButton'
import { Field } from '@/components/ui/Field'
import { api, ApiError } from '@/lib/api'
import { color, font } from '@/theme/tokens'

export default function Forgot() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    setErr(null)
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim() })
      setSent(true)
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Échec de l’envoi')
    } finally { setLoading(false) }
  }

  return (
    <AppShell>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}><Feather name="lock" size={22} color={color.white} /></View>
            <Text style={styles.name}>Mot de passe oublié</Text>
          </View>

          <FxCard style={{ gap: 12 }}>
            {sent ? (
              <Text style={styles.help}>
                Si un compte existe pour {email}, un email avec un lien de réinitialisation vient d’être envoyé.
                Ouvre-le pour choisir un nouveau mot de passe.
              </Text>
            ) : (
              <>
                <Text style={styles.help}>Entre ton email, on t’envoie un lien de réinitialisation.</Text>
                <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                {err ? <Text style={styles.err}>{err}</Text> : null}
                <FxButton label={loading ? '...' : 'Envoyer le lien'} onPress={submit} />
              </>
            )}
          </FxCard>

          <Pressable onPress={() => router.replace('/login')} style={styles.link}>
            <Text style={styles.linkTxt}>Retour à la connexion</Text>
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
  help: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.inkSoft },
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down },
  link: { alignItems: 'center' },
  linkTxt: { fontFamily: font.bodySemi, fontSize: 14, color: color.acc },
})
