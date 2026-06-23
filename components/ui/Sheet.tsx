import { ReactNode } from 'react'
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { color, font, radius } from '@/theme/tokens'

/**
 * Feuille modale par le bas (équivalent natif de `.fx-sheet` / modaux web).
 * Backdrop tap = fermeture, grip, titre, contenu scrollable.
 */
export function Sheet({
  visible, onClose, title, children,
}: {
  visible: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const insets = useSafeAreaInsets()
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <Pressable
            style={[styles.panel, { paddingBottom: 16 + insets.bottom }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.grip} />
            <View style={styles.head}>
              <Text style={styles.title}>{title}</Text>
              <Pressable onPress={onClose} style={styles.close} hitSlop={8}>
                <Feather name="x" size={18} color={color.inkSoft} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,40,33,0.34)', justifyContent: 'flex-end' },
  kav: { justifyContent: 'flex-end' },
  panel: {
    backgroundColor: '#f4f8f5',
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 18, paddingTop: 10, maxHeight: '88%',
  },
  grip: { width: 38, height: 4, borderRadius: 3, backgroundColor: color.hair, alignSelf: 'center', marginBottom: 12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontFamily: font.display, fontSize: 19, color: color.ink },
  close: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: color.glass,
  },
})
