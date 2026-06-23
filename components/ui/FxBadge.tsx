import { StyleSheet, Text, View } from 'react-native'
import { color, font } from '@/theme/tokens'

type Tone = 'live' | 'premium' | 'soft'

/** Badge mono uppercase. Équivalent natif de `.fx-badge`. */
export function FxBadge({ label, tone = 'soft' }: { label: string; tone?: Tone }) {
  const t = TONES[tone]
  return (
    <View style={[styles.badge, { backgroundColor: t.bg, borderColor: t.border ?? 'transparent', borderWidth: t.border ? 1 : 0 }]}>
      {tone === 'live' ? <View style={styles.dot} /> : null}
      <Text style={[styles.txt, { color: t.fg }]}>{label}</Text>
    </View>
  )
}

const TONES: Record<Tone, { fg: string; bg: string; border?: string }> = {
  live:    { fg: color.up,      bg: 'rgba(0,137,84,0.12)' },
  premium: { fg: color.pop,     bg: 'rgba(230,140,44,0.14)' },
  soft:    { fg: color.inkSoft, bg: 'rgba(255,255,255,0.7)', border: color.hair2 },
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: color.up },
  txt: {
    fontFamily: font.monoSemi,
    fontSize: 9.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
})
