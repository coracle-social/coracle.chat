import SolarIcon from '@/components/SolarIcons';
import Colors from '@/core/env/Colors';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { TabRoutes, navigateToTab } from '@/lib/utils/routes';
import { useClientOnlyValue } from '@/lib/utils/useClientOnlyValue';
import { useStore } from '@/stores/useWelshmanStore2';
import { pubkey } from '@welshman/app';
import { last } from '@welshman/lib';
import { Link, Tabs, router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const getTabIcons = (colors: typeof Colors.light) => ({
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
  colors: typeof Colors.light;
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

  const getCurrentTab = (): TabRoutes => {
    const currentSegment = last(segments) as TabRoutes
    if (Object.values(TabRoutes).includes(currentSegment)) {
      return currentSegment;
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

    setActiveTab(currentTab);
  }, [segments, activeTab]);

    // Handle back button override for Android only
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    console.log('🔧 Setting up Android back button override for settings tab');

    const handleBackPress = () => {
      const currentTab = getCurrentTab();
      console.log('🔧 Android back button pressed! Current tab:', currentTab);
      console.log('🔧 Is settings tab?', currentTab === TabRoutes.SETTINGS);

      if (currentTab === TabRoutes.SETTINGS) {
        console.log('🔧 ✅ Android back button pressed from settings, navigating to explore');
        router.push('/(tabs)/explore');
        return true; // Prevent default back action
      }
      console.log('🔧 ❌ Not on settings tab, allowing normal back action');
      return false; // Allow default back action
    };

    console.log('🔧 Setting up Android back button listener');
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      console.log('🔧 Cleaning up Android back button listener');
      sub.remove();
    };
  }, [segments]);

  if (isWeb) {
    return (
      <View style={styles.webContainer}>
        {/* Left Sidebar */}
        <View style={[styles.webSidebar, { borderRightColor: colors.sidebarBorder }]}>
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
        <View style={styles.webContent}>
          {/* Header with Login/Logout Button */}
          <View style={[styles.webHeader, { borderBottomColor: colors.sidebarBorder }]}>


            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <View style={[
                    styles.loginButton,
                    {
                      opacity: pressed ? 0.5 : 1,
                      borderColor: colors.buttonBorder
                    }
                  ]}>
                    <Text style={[styles.loginButtonText, { color: colors.primary }]}>
                      {isLoggedIn ? 'Logout' : 'Login'}
                    </Text>
                  </View>
                )}
              </Pressable>
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
        tabBarStyle: { backgroundColor: colors.background },
        headerStyle: { height: 60 },
        headerTitleStyle: { fontSize: 16 },
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
