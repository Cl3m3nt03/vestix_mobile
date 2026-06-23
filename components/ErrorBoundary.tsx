import { Component, ReactNode } from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import { color, font } from '@/theme/tokens'

/** Capture les erreurs de rendu d'un écran → fallback au lieu d'un écran noir global. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>Oups, cet écran a planté</Text>
          <Text style={styles.msg}>{String(this.state.error.message)}</Text>
          <Pressable style={styles.btn} onPress={() => this.setState({ error: null })}>
            <Text style={styles.btnTxt}>Réessayer</Text>
          </Pressable>
        </View>
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12, backgroundColor: '#eef4f0' },
  title: { fontFamily: font.display, fontSize: 18, color: color.ink, textAlign: 'center' },
  msg: { fontFamily: font.body, fontSize: 13, color: color.inkSoft, textAlign: 'center' },
  btn: { marginTop: 8, paddingHorizontal: 22, height: 46, borderRadius: 24, backgroundColor: color.acc, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { fontFamily: font.bodySemi, fontSize: 14, color: color.white },
})
