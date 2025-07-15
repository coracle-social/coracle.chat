import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useTheme } from '../components/theme/ThemeContext';
import { pubkey, sessions, Session } from '@welshman/app';
import { routerContext } from '@welshman/router';
import { initializeWelshmanStorage, persistentPubkey, persistentSessions } from '../utils/welshman-storage';
import { establishRelayConnections } from '../utils/dataHandling';
import {  SafeAreaProvider } from 'react-native-safe-area-context';
import { overFlowReader as OverFlowReader } from '../components/generalUI/overFlowReader';
import { ThemeProvider as AppThemeProvider } from '../components/theme/ThemeContext';
import { RNEUIThemeWrapper } from '../components/theme/RNEUIThemeProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
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
    Icomoon: require('../assets/fonts/icomoon.ttf'),
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
    if ((global as any).__welshmanStorageInitialized) return;    
    // Configure default relays for the router
    routerContext.getDefaultRelays = () => ["wss://relay.damus.io/", "wss://nos.lol/"];
    console.log("Configured default relays:", routerContext.getDefaultRelays());
    
    // Establish initial relay connections
    establishRelayConnections();
    
    const initStorage = async () => {
      try {
        // Initialize the persistent stores
        await initializeWelshmanStorage();
        
        // Sync persistent stores with main Welshman stores
        let syncing = false;
        
        // Sync pubkey
        const unsubPersistentPubkey = persistentPubkey.subscribe((value: unknown) => {
          if (!syncing && pubkey.get() !== value) {
            syncing = true;
            pubkey.set(value as string | undefined);
            syncing = false;
          }
        });
        
        const unsubMainPubkey = pubkey.subscribe((value: string | undefined) => {
          if (!syncing && persistentPubkey.get() !== value) {
            syncing = true;
            persistentPubkey.set(value);
            syncing = false;
          }
        });
        
        // Sync sessions
        const unsubPersistentSessions = persistentSessions.subscribe((value: unknown) => {
          const current = sessions.get();
          const isSame = JSON.stringify(current) === JSON.stringify(value);
          if (!syncing && !isSame) {
            syncing = true;
            sessions.set(value as Record<string, Session>);
            syncing = false;
          }
        });
        
        const unsubMainSessions = sessions.subscribe((value: Record<string, Session>) => {
          const current = persistentSessions.get();
          const isSame = JSON.stringify(current) === JSON.stringify(value);
          if (!syncing && !isSame) {
            syncing = true;
            persistentSessions.set(value);
            syncing = false;
          }
        });
        
        console.log("Welshman storage synced successfully");
        
        return () => {
          unsubPersistentPubkey();
          unsubMainPubkey();
          unsubPersistentSessions();
          unsubMainSessions();
        };
      } catch (error) {
        console.error("Failed to initialize Welshman storage:", error);
      }
    };
    
    initStorage();
    (global as any).__welshmanStorageInitialized = true;
  }, []);
  

  return (
    <AppThemeProvider>
      <RNEUIThemeWrapper>
        <SafeAreaProvider>
          <ThemeProviderWrapper />
        </SafeAreaProvider>
      </RNEUIThemeWrapper>
    </AppThemeProvider>
  );
}

function ThemeProviderWrapper() {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <OverFlowReader>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: '' }} />
        </Stack>
      </OverFlowReader>
    </ThemeProvider>
  );
}
