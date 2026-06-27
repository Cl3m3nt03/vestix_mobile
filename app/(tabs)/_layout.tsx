import { useState } from 'react'
import { Tabs } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { BottomNav, NavItem } from '@/components/ui/BottomNav'
import { MoreSheet } from '@/components/MoreSheet'
import { color } from '@/theme/tokens'

const ICON: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'home',
  folio: 'pie-chart',
  transactions: 'repeat',
  budget: 'trending-up',
  more: 'grid',
}
const LABEL: Record<string, string> = {
  index: 'Accueil',
  folio: 'Portefeuille',
  transactions: 'Transactions',
  budget: 'Budget',
  more: 'Plus',
}

export default function TabsLayout() {
  const [moreOpen, setMoreOpen] = useState(false)
  return (
    <>
      <MoreSheet visible={moreOpen} onClose={() => setMoreOpen(false)} />
      <Tabs
        screenOptions={{ headerShown: false, animation: 'shift' }}
        tabBar={({ state, navigation }) => {
          const items: NavItem[] = state.routes.map((r) => ({
            key: r.name,
            label: LABEL[r.name] ?? r.name,
            icon: (a: boolean) => (
              <Feather name={ICON[r.name] ?? 'circle'} size={21} color={a ? color.acc : color.inkSoft} />
            ),
          }))
          const active = moreOpen ? 'more' : state.routes[state.index].name
          return (
            <BottomNav
              items={items}
              active={active}
              onSelect={(key) => (key === 'more' ? setMoreOpen(true) : navigation.navigate(key))}
            />
          )
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="folio" />
        <Tabs.Screen name="transactions" />
        <Tabs.Screen name="budget" />
        {/* 'more' reste dans la barre (item « Plus »), mais son tap ouvre la feuille
            au lieu de naviguer → l'écran more.tsx n'est jamais affiché. */}
        <Tabs.Screen name="more" />
      </Tabs>
    </>
  )
}
