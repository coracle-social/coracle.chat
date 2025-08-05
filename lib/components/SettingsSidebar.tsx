import { spacing } from '@/core/env/Spacing';
import { usePaperTheme } from '@/lib/theme/PaperTheme';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { View } from '@/lib/theme/Themed';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, StyleSheet } from 'react-native';
import { Drawer } from 'react-native-paper';

enum SettingsRoutes {
  SETTINGS = 'settings',
  PROFILE = 'profile',
  RELAYS = 'relays',
  USAGE = 'usage',
}

interface SettingsSidebarProps {
  onSettingsPress?: () => void;
  onProfilePress?: () => void;
  onRelaysPress?: () => void;
  onUsagePress?: () => void;
}

export default function SettingsSidebar({
  onSettingsPress,
  onProfilePress,
  onRelaysPress,
  onUsagePress,
}: SettingsSidebarProps) {
  const colors = useThemeColors();
  const paperTheme = usePaperTheme();

  const router = useRouter();
  const segments = useSegments();

  // Settings history management (for consistency with main tabbar)
  const settingsHistory = useRef<SettingsRoutes[]>([]);
  const isNavigatingBack = useRef(false);

  const getCurrentSettingsRoute = (): SettingsRoutes => {
    const currentSegment = segments[segments.length - 1];
    if (currentSegment === 'profile') return SettingsRoutes.PROFILE;
    if (currentSegment === 'relays') return SettingsRoutes.RELAYS;
    if (currentSegment === 'usage') return SettingsRoutes.USAGE;
    return SettingsRoutes.SETTINGS; // Default to settings (main settings page)
  };

  const [activeSettingsRoute, setActiveSettingsRoute] = useState<SettingsRoutes>(getCurrentSettingsRoute);

  useEffect(() => {
    const currentRoute = getCurrentSettingsRoute();
    const previousRoute = activeSettingsRoute;

    // Android history management
    if (Platform.OS === 'android' && currentRoute !== previousRoute && !isNavigatingBack.current) {
      // Add to history only if we're not navigating back
      settingsHistory.current.push(previousRoute);
      console.log('🔧 Settings Sidebar Android: Added to history:', previousRoute, '->', currentRoute);
      console.log('🔧 Settings Sidebar Android: History stack:', settingsHistory.current);
    }

    setActiveSettingsRoute(currentRoute);
  }, [segments, activeSettingsRoute]);

  // Handle back button override for Android only
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    console.log('🔧 Setting up Settings Sidebar Android back button override');

    const handleBackPress = () => {
      const currentRoute = getCurrentSettingsRoute();
      console.log('🔧 Settings Sidebar Android back button pressed! Current route:', currentRoute);
      console.log('🔧 Settings Sidebar Android: History stack:', settingsHistory.current);

      // Only handle back button if we're in settings navigation and have settings history
      if (settingsHistory.current.length > 0) {
        const previousRoute = settingsHistory.current.pop()!;
        console.log('🔧 Settings Sidebar Android: Navigating back to:', previousRoute);
        isNavigatingBack.current = true;

        // Navigate to the previous route
        if (previousRoute === SettingsRoutes.SETTINGS) {
          router.push('/(tabs)/settings');
        } else {
          router.push(`/(tabs)/settings/${previousRoute}`);
        }

        // Reset the flag after a short delay to allow the navigation to complete
        setTimeout(() => {
          isNavigatingBack.current = false;
        }, 100);
        return true; // Prevent default back action
      }

      // If no settings history, let the main tabbar handle it
      console.log('🔧 Settings Sidebar Android: No settings history, letting main tabbar handle back');
      return false;
    };

    console.log('🔧 Setting up Settings Sidebar Android back button listener');
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      console.log('🔧 Cleaning up Settings Sidebar Android back button listener');
      sub.remove();
    };
  }, [segments]);

  // Initialize history with settings if empty
  useEffect(() => {
    if (Platform.OS === 'android' && settingsHistory.current.length === 0) {
      const currentRoute = getCurrentSettingsRoute();
      if (currentRoute !== SettingsRoutes.SETTINGS) {
        settingsHistory.current.push(SettingsRoutes.SETTINGS);
        console.log('🔧 Settings Sidebar Android: Initialized history with settings');
      }
    }
  }, []);

  if (Platform.OS !== 'web') { //will be replaced by android render
    return null;
  }

  // Determine active route based on current segments
  const currentRoute = segments[segments.length - 1];
  const isSettingsActive = currentRoute === 'settings' || segments.length === 2;
  const isProfileActive = currentRoute === 'profile';
  const isRelaysActive = currentRoute === 'relays';
  const isUsageActive = currentRoute === 'usage';

  const handleSettingsPress = () => {
    router.push('/(tabs)/settings');
    onSettingsPress?.();
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/settings/profile');
    onProfilePress?.();
  };

  const handleRelaysPress = () => {
    router.push('/(tabs)/settings/relays');
    onRelaysPress?.();
  };

  const handleUsagePress = () => {
    router.push('/(tabs)/settings/usage');
    onUsagePress?.();
  };

  return (
    <View>
      <View style={styles.drawerItemWrapper}>
        <Drawer.Item
          icon="cog"
          label="Settings"
          active={isSettingsActive}
          onPress={handleSettingsPress}
          style={[
            styles.drawerItem,
            isSettingsActive && { backgroundColor: colors.activeTabBackground }
          ]}
          theme={paperTheme}
        />
      </View>
      <View style={styles.drawerItemWrapper}>
        <Drawer.Item
          icon="account"
          label="Profile"
          active={isProfileActive}
          onPress={handleProfilePress}
          style={[
            styles.drawerItem,
            isProfileActive && { backgroundColor: colors.activeTabBackground }
          ]}
          theme={paperTheme}
        />
      </View>
      <View style={styles.drawerItemWrapper}>
        <Drawer.Item
          icon="wifi"
          label="Relays"
          active={isRelaysActive}
          onPress={handleRelaysPress}
          style={[
            styles.drawerItem,
            isRelaysActive && { backgroundColor: colors.activeTabBackground }
          ]}
          theme={paperTheme}
        />
      </View>
      <View style={styles.drawerItemWrapper}>
        <Drawer.Item
          icon="chart-box"
          label="Usage"
          active={isUsageActive}
          onPress={handleUsagePress}
          style={[
            styles.drawerItem,
            isUsageActive && { backgroundColor: colors.activeTabBackground }
          ]}
          theme={paperTheme}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing(4),
  },
  drawerItemWrapper: {
    width: '100%',
    alignItems: 'center', // Ensures internal content is also centered
  },
  drawerItem: {
    width: '90%', // Keep consistent width, but not full width to prevent shift
    marginVertical: spacing(1),
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
