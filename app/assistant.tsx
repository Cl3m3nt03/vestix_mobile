import { useState, useRef } from 'react'
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { AppShell } from '@/components/ui/AppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { FxCard } from '@/components/ui/FxCard'
import { FxButton } from '@/components/ui/FxButton'
import { useMe } from '@/lib/queries'
import { sendChat, api, ApiError } from '@/lib/api'
import type { ChatMessage } from '@/lib/types'
import { color, font } from '@/theme/tokens'

export default function Assistant() {
  const router = useRouter()
  const qc = useQueryClient()
  const me = useMe()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [consenting, setConsenting] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const consented = me.data?.assistantConsent

  const giveConsent = async () => {
    setConsenting(true)
    try {
      await api.patch('/api/assistant/consent', { consent: true })
      qc.invalidateQueries({ queryKey: ['me'] })
    } finally { setConsenting(false) }
  }

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setBusy(true)
    try {
      const reply = await sendChat(next)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (e) {
      const msg = e instanceof ApiError && e.message === 'CONSENT_REQUIRED'
        ? 'Active le consentement pour utiliser l’assistant.'
        : e instanceof ApiError ? e.message : 'Erreur de l’assistant'
      setMessages([...next, { role: 'assistant', content: `⚠️ ${msg}` }])
    } finally {
      setBusy(false)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }

  return (
    <AppShell>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <View style={styles.head}>
          <ScreenHeader eyebrow="VESTIX" title="Assistant IA" onBack={() => router.back()} />
        </View>

        {me.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={color.acc} /></View>
        ) : !consented ? (
          <View style={styles.pad}>
            <FxCard>
              <Text style={styles.consentTitle}>Consentement requis</Text>
              <Text style={styles.consentTxt}>
                L’assistant transmet un résumé de ton patrimoine à Google Gemini pour personnaliser ses réponses.
                Aucune donnée n’est partagée sans ton accord (RGPD).
              </Text>
              <FxButton label={consenting ? '...' : 'J’accepte'} onPress={giveConsent} style={{ marginTop: 14 }} />
            </FxCard>
          </View>
        ) : (
          <>
            <ScrollView ref={scrollRef} contentContainerStyle={styles.chat} showsVerticalScrollIndicator={false}>
              {!messages.length ? (
                <Text style={styles.empty}>Pose une question sur ton patrimoine, ta fiscalité, ta stratégie…</Text>
              ) : (
                messages.map((m, i) => (
                  <View key={i} style={[styles.bubble, m.role === 'user' ? styles.user : styles.bot]}>
                    <Text style={[styles.bubbleTxt, m.role === 'user' && { color: color.white }]}>{m.content}</Text>
                  </View>
                ))
              )}
              {busy ? <ActivityIndicator color={color.acc} style={{ marginTop: 8 }} /> : null}
            </ScrollView>

            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                placeholder="Écris ton message…"
                placeholderTextColor={color.inkFaint}
                value={input}
                onChangeText={setInput}
                multiline
              />
              <Pressable onPress={send} style={styles.sendBtn} disabled={busy}>
                <Feather name="arrow-up" size={20} color={color.white} />
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingTop: 8 },
  pad: { paddingHorizontal: 16, paddingTop: 8 },
  center: { paddingVertical: 60, alignItems: 'center' },
  consentTitle: { fontFamily: font.display, fontSize: 17, color: color.ink, marginBottom: 8 },
  consentTxt: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.inkSoft },
  chat: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  empty: { fontFamily: font.body, fontSize: 14, color: color.inkSoft, textAlign: 'center', marginTop: 40, paddingHorizontal: 20 },
  bubble: { maxWidth: '85%', paddingVertical: 11, paddingHorizontal: 14, borderRadius: 16 },
  user: { alignSelf: 'flex-end', backgroundColor: color.acc, borderBottomRightRadius: 4 },
  bot: { alignSelf: 'flex-start', backgroundColor: color.white, borderWidth: 1, borderColor: color.glassHi, borderBottomLeftRadius: 4 },
  bubbleTxt: { fontFamily: font.body, fontSize: 14.5, lineHeight: 21, color: color.ink },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: color.hair2, backgroundColor: color.glassStrong,
  },
  input: {
    flex: 1, maxHeight: 110, minHeight: 44, borderRadius: 22, paddingHorizontal: 16, paddingTop: 11, paddingBottom: 11,
    backgroundColor: color.white, borderWidth: 1, borderColor: color.glassHi, fontFamily: font.body, fontSize: 15, color: color.ink,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.acc, alignItems: 'center', justifyContent: 'center' },
})
