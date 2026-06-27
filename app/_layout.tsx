import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
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
import { ThemeProvider } from '@/lib/theme-context'
import { ErrorBoundary } from '@/components/ErrorBoundary'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      retry: 1,
      placeholderData: (prev: unknown) => prev,
    },
  },
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
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 220,
          contentStyle: { backgroundColor: '#efede7' },
        }}
      >
        {/* (tabs) en fondu (changement de contexte), écrans secondaires en slide */}
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        {/* assistant : le rendu est un Sheet (slide depuis le bas). Route en
            transparentModal + fond transparent → le dashboard reste visible
            DERRIÈRE le backdrop du Sheet (sinon on verrait le fond crème opaque
            de la route, pas l'écran précédent). animation 'none' : c'est le
            Sheet (reanimated) qui anime, pas la transition de route. */}
        <Stack.Screen
          name="assistant"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
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
            <ThemeProvider>
              <StatusBar style="dark" />
              <AuthGate />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
