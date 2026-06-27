import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { AppShell } from '@/components/ui/AppShell'
import { FxCard } from '@/components/ui/FxCard'
import { FxButton } from '@/components/ui/FxButton'
import { login, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { color, font } from '@/theme/tokens'

export default function Login() {
  const router = useRouter()
  const { accent } = useTheme()
  const { setToken } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [needs2FA, setNeeds2FA] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    setErr(null)
    setLoading(true)
    try {
      const res = await login(email.trim(), password, needs2FA ? otp.trim() : undefined)
      if ('requires2FA' in res) {
        setNeeds2FA(true)
      } else {
        setToken(res.token) // déclenche la redirection vers le dashboard
      }
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Connexion impossible. Vérifie l’URL du serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: accent.acc }]}>
              <Feather name="trending-up" size={22} color={color.white} />
            </View>
            <Text style={styles.name}>Vestix</Text>
            <Text style={styles.tag}>PATRIMOINE</Text>
          </View>

          <FxCard style={{ gap: 14 }}>
            <Text style={styles.h}>{needs2FA ? 'Vérification' : 'Connexion'}</Text>

            {!needs2FA ? (
              <>
                <Field icon="mail" placeholder="Email" value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none" />
                <Field icon="lock" placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
              </>
            ) : (
              <>
                <Text style={styles.help}>Code à 6 chiffres envoyé par email.</Text>
                <Field icon="shield" placeholder="Code OTP" value={otp} onChangeText={setOtp}
                  keyboardType="number-pad" />
              </>
            )}

            {err ? <Text style={styles.err}>{err}</Text> : null}

            <FxButton
              label={loading ? '...' : needs2FA ? 'Valider le code' : 'Se connecter'}
              onPress={submit}
            />

            {!needs2FA ? (
              <View style={styles.links}>
                <Pressable onPress={() => router.push('/forgot')}>
                  <Text style={[styles.link, { color: accent.acc }]}>Mot de passe oublié ?</Text>
                </Pressable>
                <Pressable onPress={() => router.push('/register')}>
                  <Text style={[styles.link, { color: accent.acc }]}>Créer un compte</Text>
                </Pressable>
              </View>
            ) : null}
          </FxCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  )
}

function Field({
  icon, placeholder, value, onChangeText, ...rest
}: {
  icon: keyof typeof Feather.glyphMap
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Feather name={icon} size={18} color={color.inkFaint} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={color.inkFaint}
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 24 },
  brand: { alignItems: 'center', gap: 6 },
  logo: {
    width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: color.acc,
  },
  name: { fontFamily: font.display, fontSize: 26, color: color.ink, marginTop: 6 },
  tag: { fontFamily: font.mono, fontSize: 10, letterSpacing: 3, color: color.inkFaint },
  h: { fontFamily: font.display, fontSize: 20, color: color.ink },
  help: { fontFamily: font.body, fontSize: 13, color: color.inkSoft },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: color.glassHi, borderRadius: 14, paddingHorizontal: 14, height: 50,
    backgroundColor: color.glass,
  },
  input: { flex: 1, fontFamily: font.body, fontSize: 15, color: color.ink },
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  link: { fontFamily: font.bodySemi, fontSize: 13, color: color.acc },
})
