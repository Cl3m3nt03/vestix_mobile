import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { color, font, radius } from '@/theme/tokens'
import { useTheme } from '@/lib/theme-context'
import { eur } from '@/lib/format'
import { quickParseCsv, CsvRow } from './csv-parse'

/**
 * Picker CSV PEA/CTO + preview. Le PDF n'est pas supporté sur mobile (parsing
 * pdfjs-dist est web-only) — le message guide l'utilisateur vers le web.
 */
export function CsvImport({
  rows, csvText, fileName, onParsed,
}: {
  rows: CsvRow[]
  csvText: string
  fileName: string
  onParsed: (rows: CsvRow[], csvText: string, fileName: string) => void
}) {
  const { accent } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function pick() {
    setError(null)
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain', 'application/vnd.ms-excel', '*/*'],
        copyToCacheDirectory: true,
        multiple: false,
      })
      if (res.canceled || !res.assets?.[0]) return
      const asset = res.assets[0]
      if (asset.name?.match(/\.pdf$/i)) {
        setError("Le PDF n'est pas supporté sur mobile — utilisez le web pour les exports PDF.")
        return
      }
      setLoading(true)
      const text = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 })
      const parsed = quickParseCsv(text)
      onParsed(parsed, text, asset.name ?? 'import.csv')
      if (parsed.length === 0) {
        setError("Aucune position détectée. Vérifie les colonnes : Libellé, ISIN, Quantité, PRU.")
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const total = rows.reduce((s, r) => s + r.quantity * r.avgBuyPrice, 0)

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Fichier CSV</Text>
      <Pressable onPress={pick} style={({ pressed }) => [styles.drop, pressed && [styles.dropPressed, { borderColor: accent.acc }]]}>
        {loading
          ? <ActivityIndicator color={accent.acc} />
          : <Feather name="upload" size={18} color={color.inkSoft} />}
        <Text style={styles.dropTxt} numberOfLines={1}>
          {loading ? 'Lecture du fichier…' : fileName || 'Sélectionner un fichier CSV'}
        </Text>
      </Pressable>

      {rows.length > 0 && (
        <View style={styles.preview}>
          <View style={styles.previewHead}>
            <Text style={styles.previewCount}>
              {rows.length} position{rows.length > 1 ? 's' : ''} détectée{rows.length > 1 ? 's' : ''}
            </Text>
            <Text style={[styles.previewTotal, { color: accent.acc }]}>{eur(total, 0)}</Text>
          </View>
          {rows.slice(0, 8).map((r, i) => (
            <View key={i} style={[styles.previewRow, i > 0 && styles.previewBorder]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.previewName} numberOfLines={1}>{r.name}</Text>
                {r.isin ? <Text style={styles.previewIsin}>{r.isin}</Text> : null}
              </View>
              <Text style={styles.previewQty}>
                {r.quantity} × {r.avgBuyPrice.toFixed(2)}
              </Text>
            </View>
          ))}
          {rows.length > 8 && (
            <Text style={styles.previewMore}>+{rows.length - 8} autres</Text>
          )}
        </View>
      )}

      {error ? (
        <View style={styles.error}>
          <Feather name="alert-circle" size={13} color={color.down} />
          <Text style={styles.errorTxt}>{error}</Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  label: { fontFamily: font.bodyMed, fontSize: 13, color: color.inkSoft },
  drop: {
    flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center',
    height: 72, borderRadius: radius.sm,
    borderWidth: 2, borderStyle: 'dashed', borderColor: color.glassHi,
    backgroundColor: color.glass2, paddingHorizontal: 14,
  },
  dropPressed: { opacity: 0.85, borderColor: color.acc },
  dropTxt: { fontFamily: font.bodyMed, fontSize: 13, color: color.inkSoft, flexShrink: 1 },
  preview: {
    borderRadius: radius.sm, borderWidth: 1, borderColor: color.glassHi,
    backgroundColor: color.glass2, overflow: 'hidden',
  },
  previewHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: color.hair2,
  },
  previewCount: { fontFamily: font.bodySemi, fontSize: 11.5, color: color.inkSoft },
  previewTotal: { fontFamily: font.monoSemi, fontSize: 11.5, color: color.acc },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 7 },
  previewBorder: { borderTopWidth: 1, borderTopColor: color.hair2 },
  previewName: { fontFamily: font.bodyMed, fontSize: 12, color: color.ink },
  previewIsin: { fontFamily: font.mono, fontSize: 10, color: color.inkFaint, marginTop: 1 },
  previewQty: { fontFamily: font.mono, fontSize: 11, color: color.inkSoft },
  previewMore: { fontFamily: font.body, fontSize: 11, color: color.inkFaint, textAlign: 'center', paddingVertical: 7 },
  error: {
    flexDirection: 'row', gap: 7, alignItems: 'flex-start',
    backgroundColor: '#fde9e7', borderWidth: 1, borderColor: color.down,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.sm,
  },
  errorTxt: { fontFamily: font.body, fontSize: 12, color: color.down, flex: 1 },
})
