import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts, Outfit_300Light, Outfit_600SemiBold } from '@expo-google-fonts/outfit'
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
} from '@expo-google-fonts/hanken-grotesk'
import { JetBrainsMono_400Regular, JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { ErrorBoundary } from '@/components/ErrorBoundary'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

/** Redirige selon la présence du JWT : pas de token → /login, token → dashboard. */
function AuthGate() {
  const { token, ready } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    const seg = segments[0] as string | undefined
    const onAuthScreen = seg === 'login' || seg === 'register' || seg === 'forgot'
    if (!token && !onAuthScreen) router.replace('/login')
    else if (token && onAuthScreen) router.replace('/(tabs)')
  }, [token, ready, segments])

  return (
    <ErrorBoundary>
      <Slot />
    </ErrorBoundary>
  )
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Outfit_300Light,
    Outfit_600SemiBold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_600SemiBold,
  })

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync()
  }, [loaded])

  if (!loaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#efede7' }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="dark" />
            <AuthGate />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
