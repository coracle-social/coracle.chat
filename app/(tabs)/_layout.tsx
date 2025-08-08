import SolarIcon from '@/components/SolarIcons';
import { TabRoutes, navigateToTab } from '@/core/state/routes';
import { OptionButton } from '@/lib/components/OptionButton';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { useClientOnlyValue } from '@/lib/utils/useClientOnlyValue';
import { pubkey } from '@welshman/app';
import { last } from '@welshman/lib';
import { Link, Tabs, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, View } from 'react-native';

const getTabIcons = (colors: any) => ({
  [TabRoutes.DASHBOARD]: colors.tabIcons.dashboard,
  [TabRoutes.EXPLORE]: colors.tabIcons.explore,
  [TabRoutes.SPACES]: colors.tabIcons.spaces,
  [TabRoutes.MESSAGES]: colors.tabIcons.messages,
  [TabRoutes.SEARCH]: colors.tabIcons.search,
  [TabRoutes.SETTINGS]: colors.tabIcons.settings,
});

function SolarTabIcon({
  name,
  color,
  size = 28,
  strokeWidth = 1.5
}: {
  name: string;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  return <SolarIcon size={size} color={color} name={name} strokeWidth={strokeWidth} />;
}

// Reusable tab press component
function TabBarPressIcon({
  iconName,
  route,
  active,
  colors
}: {
  iconName: string;
  route: TabRoutes;
  active: boolean;
  colors: any;
}) {
  return (
    <Pressable
      style={[
        styles.webTabIconButton,
        active && { backgroundColor: colors.activeTabBackground, borderRadius: 8 }
      ]}
      onPress={() => {
        navigateToTab(route);
      }}>
      <SolarTabIcon
        name={iconName}
        color={active ? colors.tint : colors.inactiveIcon}
        strokeWidth={active ? 2.5 : 1.5}
      />
    </Pressable>
  );
}

export default function TabLayout() {
  const colors = useThemeColors();
  const tabIcons = getTabIcons(colors);
  const isWeb = Platform.OS === 'web';
  const segments = useSegments();
  const [currentPubkey] = useStore(pubkey);
  const isLoggedIn = !!currentPubkey;

  // Android history management
  const tabHistory = useRef<TabRoutes[]>([]);
  const isNavigatingBack = useRef(false);

    const getCurrentTab = (): TabRoutes => {
    const currentSegment = last(segments);

    // Handle nested settings routes - if we're in settings sub-routes, stay on settings tab
    if (segments.length > 2 && segments[1] === 'settings') {
      return TabRoutes.SETTINGS;
    }

    if (Object.values(TabRoutes).includes(currentSegment as TabRoutes)) {
      return currentSegment as TabRoutes;
    }
    return TabRoutes.DASHBOARD;
  };

  const [activeTab, setActiveTab] = useState<TabRoutes>(getCurrentTab);

  useEffect(() => {
    const currentTab = getCurrentTab();
    const previousTab = activeTab;

    // Only push history state if we actually changed tabs
    if (Platform.OS === 'web' && currentTab !== previousTab) {
      const url = `/${currentTab}`;
      if (window.location.pathname !== url) {
        history.pushState({ tab: currentTab }, '', url);
      }
    }

    // Android history management
    if (Platform.OS === 'android' && currentTab !== previousTab && !isNavigatingBack.current) {
      // Add to history only if we're not navigating back
      tabHistory.current.push(previousTab);
      console.log('🔧 Android: Added to history:', previousTab, '->', currentTab);
      console.log('🔧 Android: History stack:', tabHistory.current);
    }

    setActiveTab(currentTab);
  }, [segments, activeTab]);

  // Handle back button override for Android only
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    console.log('🔧 Setting up Android back button override with history management');

    const handleBackPress = () => {
      const currentTab = getCurrentTab();
      const currentSegment = last(segments);

      // If we're in settings sub-pages, let the default back button handle it
      if (currentTab === TabRoutes.SETTINGS && segments.length > 2) {
        console.log('🔧 Android: In settings sub-page, letting default back handle it');
        return false; // Let default back button handle settings navigation
      }

      // If we have history, navigate back to the previous tab
      if (tabHistory.current.length > 0) {
        const previousTab = tabHistory.current.pop()!;
        console.log('🔧 Android: Navigating back to:', previousTab);
        isNavigatingBack.current = true;
        navigateToTab(previousTab);
        // Reset the flag after a short delay to allow the navigation to complete
        setTimeout(() => {
          isNavigatingBack.current = false;
        }, 100);
        return true; // Prevent default back action
      }

      // If no history, allow default back action (exit app)
      console.log('🔧 Android: No history, allowing default back action');
      return false;
    };

    console.log('🔧 Setting up Android back button listener');
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      console.log('🔧 Cleaning up Android back button listener');
      sub.remove();
    };
  }, [segments]);

  // Initialize history with dashboard if empty
  useEffect(() => {
    if (Platform.OS === 'android' && tabHistory.current.length === 0) {
      const currentTab = getCurrentTab();
      if (currentTab !== TabRoutes.DASHBOARD) {
        tabHistory.current.push(TabRoutes.DASHBOARD);
        console.log('🔧 Android: Initialized history with dashboard');
      }
    }
  }, []);

  if (isWeb) {
    return (
      <View style={[styles.webContainer, { backgroundColor: colors.background }]}>
        {/* Left Sidebar */}
        <View style={[
          styles.webSidebar,
          {
            borderRightColor: colors.sidebarBorder,
            backgroundColor: colors.surface
          }
        ]}>
          {Object.entries(tabIcons).map(([route, iconName]) => (
            <View key={route} style={styles.webTabButton}>
              <TabBarPressIcon
                iconName={iconName as string}
                route={route as TabRoutes}
                active={activeTab === (route as TabRoutes)}
                colors={colors}
              />
            </View>
          ))}
        </View>

        {/* Main Content Area */}
        <View style={[styles.webContent, { backgroundColor: colors.background }]}>
          {/* Header with Login/Logout Button */}
          <View style={[
            styles.webHeader,
            {
              borderBottomColor: colors.sidebarBorder,
              backgroundColor: colors.surface
            }
          ]}>


            <Link href="/modal" asChild>
              <OptionButton
                title={isLoggedIn ? 'Logout' : 'Login'}
                icon={isLoggedIn ? 'log-out' : 'log-in'}
                variant="secondary"
                size="medium"
              />
            </Link>
          </View>

          {/* Tab Content */}
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: colors.tint,
              headerShown: false,
              tabBarStyle: { display: 'none' },
            }}>
            {Object.entries(tabIcons).map(([route, iconName]) => (
              <Tabs.Screen
                key={route}
                name={route}
                options={{
                  title: route.charAt(0).toUpperCase() + route.slice(1),
                  tabBarIcon: ({ color }) => <SolarTabIcon name={iconName as string} color={color} strokeWidth={activeTab === route ? 2.5 : 1.5} />,
                }}
              />
            ))}
          </Tabs>
        </View>
      </View>
    );
  }

  // Mobile layout
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          height: 60,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontSize: 16,
          color: colors.text,
        },
        headerShown: useClientOnlyValue(false, true),
      }}>
      {Object.entries(tabIcons).map(([route, iconName]) => (
        <Tabs.Screen
          key={route}
          name={route}
          options={{
            title: '',
            tabBarIcon: ({ color }) => <SolarTabIcon name={iconName as string} color={color} strokeWidth={activeTab === route ? 2.5 : 1.5} />,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  webSidebar: {
    width: 80,
    borderRightWidth: 1,
    paddingTop: 20,
    alignItems: 'center',
  },
  webTabButton: {
    width: '100%',
    height: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webTabIconButton: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webContent: {
    flex: 1,
  },
  webHeader: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  loginButton: {
    marginRight: 15,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
