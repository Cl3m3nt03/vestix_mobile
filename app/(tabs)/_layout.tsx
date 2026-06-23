import { Tabs } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { BottomNav, NavItem } from '@/components/ui/BottomNav'
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
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => {
        const items: NavItem[] = state.routes.map((r) => ({
          key: r.name,
          label: LABEL[r.name] ?? r.name,
          icon: (a: boolean) => (
            <Feather name={ICON[r.name] ?? 'circle'} size={21} color={a ? color.acc : color.inkSoft} />
          ),
        }))
        const active = state.routes[state.index].name
        return (
          <BottomNav
            items={items}
            active={active}
            onSelect={(key) => navigation.navigate(key)}
          />
        )
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="folio" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="budget" />
      <Tabs.Screen name="more" />
    </Tabs>
  )
}
