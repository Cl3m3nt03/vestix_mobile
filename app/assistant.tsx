import { useState, useRef, useEffect } from 'react'
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native'
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { Sheet } from '@/components/ui/Sheet'
import { FxCard } from '@/components/ui/FxCard'
import { FxButton } from '@/components/ui/FxButton'
import { TypingDots } from '@/components/ui/TypingDots'
import { useMe } from '@/lib/queries'
import { sendChatStream, api, ApiError } from '@/lib/api'
import type { ChatMessage } from '@/lib/types'
import { color, font, radius } from '@/theme/tokens'
import { useTheme } from '@/lib/theme-context'

const SUGGESTIONS = [
  { icon: 'pie-chart' as const,   text: 'Mon allocation est-elle équilibrée ?' },
  { icon: 'percent' as const,     text: 'Comment optimiser ma fiscalité ?' },
  { icon: 'target' as const,      text: 'Suis-je sur la bonne trajectoire ?' },
  { icon: 'trending-up' as const, text: 'Que penses-tu du marché actuel ?' },
]

/**
 * Assistant IA en feuille modale (slide depuis le bas) — l'écran reste
 * accessible via la route /assistant, mais son rendu est un Sheet qui se
 * ferme en revenant à l'écran précédent.
 */
export default function Assistant() {
  const router = useRouter()
  const { accent } = useTheme()
  const qc = useQueryClient()
  const me = useMe()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [pending, setPending] = useState('')
  const [consenting, setConsenting] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const consented = me.data?.assistantConsent

  const scrollToEnd = () => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }))
  }

  useEffect(() => { if (streaming) scrollToEnd() }, [pending, streaming])

  const giveConsent = async () => {
    setConsenting(true)
    try {
      await api.patch('/api/assistant/consent', { consent: true })
      qc.invalidateQueries({ queryKey: ['me'] })
    } finally { setConsenting(false) }
  }

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || streaming) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setStreaming(true)
    setPending('')
    scrollToEnd()
    try {
      let acc = ''
      await sendChatStream(next, (chunk) => {
        acc += chunk
        setPending(acc)
      })
      setMessages([...next, { role: 'assistant', content: acc }])
    } catch (e) {
      const msg = e instanceof ApiError && e.message === 'CONSENT_REQUIRED'
        ? 'Active le consentement pour utiliser l’assistant.'
        : e instanceof ApiError ? e.message : 'Erreur de l’assistant'
      setMessages([...next, { role: 'assistant', content: `⚠️ ${msg}` }])
    } finally {
      setStreaming(false)
      setPending('')
      scrollToEnd()
    }
  }

  return (
    <Sheet visible onClose={() => router.back()} title="Assistant IA" bodyScroll={false} fullHeight>
      {me.isLoading ? (
        <View style={styles.center}><ActivityIndicator color={accent.acc} /></View>
      ) : !consented ? (
        <Animated.View entering={FadeInUp.duration(280)} style={styles.consentPad}>
          <FxCard>
            <View style={styles.consentHead}>
              <View style={[styles.consentIco, { backgroundColor: accent.accTint }]}>
                <Feather name="shield" size={18} color={accent.acc} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.consentEyebrow}>RGPD</Text>
                <Text style={styles.consentTitle}>Consentement requis</Text>
              </View>
            </View>
            <Text style={styles.consentTxt}>
              L'assistant transmet un résumé de ton patrimoine à Groq (Llama 3.3) pour
              personnaliser ses réponses. Aucune donnée n'est partagée sans ton accord.
            </Text>
            <FxButton label={consenting ? '…' : 'J’accepte'} onPress={giveConsent} style={{ marginTop: 14 }} />
          </FxCard>
        </Animated.View>
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.chat}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToEnd}
            keyboardShouldPersistTaps="handled"
          >
            {!messages.length && !streaming ? (
              <Animated.View entering={FadeIn.duration(260)} style={styles.emptyWrap}>
                <LinearGradient colors={accent.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emptyBadge}>
                  <Feather name="message-circle" size={24} color={color.white} />
                </LinearGradient>
                <Text style={styles.emptyTitle}>Pose ta question finance</Text>
                <Text style={styles.emptySub}>
                  Patrimoine, fiscalité, allocation, PEA/CTO… Je m'appuie sur ton portefeuille pour personnaliser.
                </Text>
                <View style={styles.suggestList}>
                  {SUGGESTIONS.map((s, i) => (
                    <Animated.View key={s.text} entering={FadeInUp.duration(260).delay(100 + i * 60)}>
                      <Pressable onPress={() => send(s.text)} style={({ pressed }) => [styles.suggest, pressed && [styles.suggestPressed, { borderColor: accent.acc }]]}>
                        <View style={[styles.suggestIco, { backgroundColor: accent.accTint }]}>
                          <Feather name={s.icon} size={14} color={accent.acc} />
                        </View>
                        <Text style={styles.suggestTxt}>{s.text}</Text>
                        <Feather name="arrow-up-right" size={13} color={color.inkFaint} />
                      </Pressable>
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            ) : null}

            {messages.map((m, i) => (
              <Animated.View key={i} entering={FadeInUp.duration(220)}>
                <View style={[styles.bubble, m.role === 'user' ? [styles.user, { backgroundColor: accent.acc }] : styles.bot]}>
                  <Text style={[styles.bubbleTxt, m.role === 'user' && { color: color.white }]}>{m.content}</Text>
                </View>
              </Animated.View>
            ))}

            {streaming ? (
              <Animated.View entering={FadeIn.duration(160)}>
                <View style={[styles.bubble, styles.bot]}>
                  {pending ? <Text style={styles.bubbleTxt}>{pending}</Text> : <TypingDots />}
                </View>
              </Animated.View>
            ) : null}
          </ScrollView>

          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Écris ta question finance…"
              placeholderTextColor={color.inkFaint}
              value={input}
              onChangeText={setInput}
              multiline
              editable={!streaming}
            />
            <Pressable
              onPress={() => send()}
              style={({ pressed }) => [
                styles.sendBtn,
                { backgroundColor: accent.acc },
                (!input.trim() || streaming) && { opacity: 0.4 },
                pressed && { transform: [{ scale: 0.94 }] },
              ]}
              disabled={!input.trim() || streaming}
            >
              <Feather name="arrow-up" size={20} color={color.white} />
            </Pressable>
          </View>
        </>
      )}
    </Sheet>
  )
}

const styles = StyleSheet.create({
  center: { paddingVertical: 60, alignItems: 'center' },

  // Consentement
  consentPad: { paddingTop: 8 },
  consentHead: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 12 },
  consentIco: { width: 36, height: 36, borderRadius: 11, backgroundColor: color.accTint, alignItems: 'center', justifyContent: 'center' },
  consentEyebrow: { fontFamily: font.mono, fontSize: 9.5, letterSpacing: 1.4, color: color.inkFaint },
  consentTitle: { fontFamily: font.display, fontSize: 17, color: color.ink, marginTop: 2 },
  consentTxt: { fontFamily: font.body, fontSize: 13.5, lineHeight: 20, color: color.inkSoft },

  // Chat
  chat: { paddingVertical: 4, gap: 10, paddingBottom: 12, flexGrow: 1 },
  emptyWrap: { alignItems: 'center', gap: 10, marginTop: 24, paddingHorizontal: 8 },
  emptyBadge: {
    width: 58, height: 58, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { fontFamily: font.display, fontSize: 18, color: color.ink },
  emptySub: { fontFamily: font.body, fontSize: 13, color: color.inkSoft, textAlign: 'center', lineHeight: 19, paddingHorizontal: 16 },
  suggestList: { gap: 7, width: '100%', marginTop: 14 },
  suggest: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    borderRadius: radius.sm,
    backgroundColor: color.white, borderWidth: 1, borderColor: color.glassHi,
  },
  suggestPressed: { borderColor: color.acc, opacity: 0.92, transform: [{ scale: 0.985 }] },
  suggestIco: { width: 26, height: 26, borderRadius: 9, backgroundColor: color.accTint, alignItems: 'center', justifyContent: 'center' },
  suggestTxt: { flex: 1, fontFamily: font.bodyMed, fontSize: 13, color: color.ink },

  // Bulles
  bubble: { maxWidth: '85%', paddingVertical: 11, paddingHorizontal: 14, borderRadius: 16 },
  user: { alignSelf: 'flex-end', backgroundColor: color.acc, borderBottomRightRadius: 4 },
  bot: { alignSelf: 'flex-start', backgroundColor: color.white, borderWidth: 1, borderColor: color.glassHi, borderBottomLeftRadius: 4 },
  bubbleTxt: { fontFamily: font.body, fontSize: 14.5, lineHeight: 21, color: color.ink },

  // Input
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingVertical: 10, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: color.hair2,
  },
  input: {
    flex: 1, maxHeight: 110, minHeight: 44, borderRadius: 22, paddingHorizontal: 16, paddingTop: 11, paddingBottom: 11,
    backgroundColor: color.white, borderWidth: 1, borderColor: color.glassHi, fontFamily: font.body, fontSize: 15, color: color.ink,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.acc, alignItems: 'center', justifyContent: 'center' },
})
