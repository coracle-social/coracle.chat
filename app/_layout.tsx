import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { MetaConfig } from '@/core/env/MetaConfig';
import { initializeWelshmanStorage } from '@/core/state/welshman-storage';
import { OverFlowReader } from '@/lib/components/OverFlowReader';
import { PopupManager } from '@/lib/components/popups/PopupManager';
import { usePaperTheme } from '@/lib/theme/PaperTheme';
import { RNEUIThemeWrapper } from '@/lib/theme/RNEUIThemeProvider';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/lib/theme/ThemeContext';
import { routerContext } from '@welshman/router';
import { RelayMode } from '@welshman/util';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  useEffect(() => {
    if ((global as { __welshmanStorageInitialized?: boolean }).__welshmanStorageInitialized) return;

    // Mobile-specific relay testing
    if (Platform.OS !== 'web') {
      console.log('🔌 Mobile relay test:', {
        defaultRelays: MetaConfig.DEFAULT_RELAYS,
        searchRelays: MetaConfig.SEARCH_RELAYS,
        platform: Platform.OS,
        relayCount: MetaConfig.DEFAULT_RELAYS.length + MetaConfig.SEARCH_RELAYS.length
      });
    }

    // Configure default relays for the router
    routerContext.getDefaultRelays = () => [...MetaConfig.DEFAULT_RELAYS];

    // Configure search relays for the router
    routerContext.getSearchRelays = () => [...MetaConfig.SEARCH_RELAYS];

    // Configure getPubkeyRelays to fall back to default relays when no user relays are found
    const originalGetPubkeyRelays = routerContext.getPubkeyRelays;
    routerContext.getPubkeyRelays = (pubkey: string, mode?: RelayMode) => {
      const userRelays = originalGetPubkeyRelays?.(pubkey, mode) || [];
      if (userRelays.length === 0) {
        return routerContext.getDefaultRelays?.() || [];
      }
      return userRelays;
    };

    const initStorage = async () => {
        await initializeWelshmanStorage();
        // Mobile-specific network status check
        if (Platform.OS !== 'web') {
          console.log('📱 Mobile network status:', {
            platform: Platform.OS,
            storageInitialized: true,
            defaultRelaysConfigured: !!routerContext.getDefaultRelays,
            searchRelaysConfigured: !!routerContext.getSearchRelays
          });
        }
    };

    initStorage();
    (global as { __welshmanStorageInitialized?: boolean }).__welshmanStorageInitialized = true;
  }, []);


  return (
    <AppThemeProvider>
      <RNEUIThemeWrapper>
        <SafeAreaProvider>
          <ThemeProviderWrapper />
          <PopupManager />
        </SafeAreaProvider>
      </RNEUIThemeWrapper>
    </AppThemeProvider>
  );
}

function ThemeProviderWrapper() {
  const { isDark, getColors } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = getColors();
  const paperTheme = usePaperTheme();

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <OverFlowReader>
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(modals)" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: '' }} />
            </Stack>
          </View>
        </OverFlowReader>
      </ThemeProvider>
    </PaperProvider>
  );
}
