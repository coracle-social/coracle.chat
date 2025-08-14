import SolarIcon from '@/components/SolarIcons';
import { TabRoutes, navigateToTab } from '@/core/state/routes';
import { OptionButton } from '@/lib/components/OptionButton';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { useClientOnlyValue } from '@/lib/utils/useClientOnlyValue';
import { pubkey, userProfile } from '@welshman/app';
import { last } from '@welshman/lib';
import { displayPubkey } from '@welshman/util';
import { Link, Tabs, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Drawer } from 'react-native-paper';

const getTabIcons = (colors: any) => ({
  [TabRoutes.DASHBOARD]: colors.tabIcons.dashboard,
  [TabRoutes.EXPLORE]: colors.tabIcons.explore,
  [TabRoutes.SPACES]: colors.tabIcons.spaces,
  [TabRoutes.MESSAGES]: colors.tabIcons.messages,
  [TabRoutes.SEARCH]: colors.tabIcons.search,
  [TabRoutes.PROFILE]: colors.tabIcons.profile,
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

function ExpandedTabItem({
  iconName,
  route,
  active,
  colors,
  profile,
  currentPubkey,
  isLoggedIn
}: {
  iconName: string;
  route: TabRoutes;
  active: boolean;
  colors: any;
  profile?: any;
  currentPubkey?: string;
  isLoggedIn?: boolean;
}) {
  // Special handling for profile tab when expanded and user is logged in
  if (route === TabRoutes.PROFILE && isLoggedIn && profile) {
    return (
      <View style={styles.drawerItemWrapper}>
        <Drawer.Item
          icon={() => (
            <View style={styles.profilePictureContainer}>
              {profile?.picture ? (
                <Image
                  source={{ uri: profile.picture }}
                  style={styles.profilePicture}
                />
              ) : (
                <View style={[styles.profilePicturePlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.profilePictureText, { color: colors.surfaceDark }]}>
                    {profile?.name?.charAt(0)?.toUpperCase() || currentPubkey?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          )}
          label={profile?.name || displayPubkey(currentPubkey || '')}
          active={active}
          onPress={() => navigateToTab(route)}
          style={[
            styles.drawerItem,
            active && {
              backgroundColor: colors.surfaceDark === '#ffffff' ? '#f0f0f0' : '#404040'
            },
            { maxWidth: 180, }
          ]}
        />
      </View>
    );
  }

  // Default behavior for other tabs
  return (
    <View style={styles.drawerItemWrapper}>
      <Drawer.Item
      //kept active collor changing for when icons can be filled
        icon={() => <SolarTabIcon name={iconName} color={active ? colors.text : colors.text} strokeWidth={active ? 2.5 : 1.5} size={24} />}
        label={route.charAt(0).toUpperCase() + route.slice(1)}
        active={active}
        onPress={() => navigateToTab(route)}
        style={[
          styles.drawerItem,
          active && { backgroundColor: colors.activeTabBackground },
          { maxWidth: 180, }
        ]}
      />
    </View>
  );
}

// Reusable tab press component
function TabBarPressIcon({
  iconName,
  route,
  active,
  colors,
  profile,
  currentPubkey,
  isLoggedIn
}: {
  iconName: string;
  route: TabRoutes;
  active: boolean;
  colors: any;
  profile?: any;
  currentPubkey?: string;
  isLoggedIn?: boolean;
}) {
  // Special handling for profile tab to show profile picture
  if (route === TabRoutes.PROFILE && isLoggedIn && profile) {
    return (
      <Pressable
        style={[
          styles.webTabIconButton,
          active && {
            backgroundColor: colors.surfaceDark === '#ffffff' ? '#f0f0f0' : '#404040',
            borderRadius: 20
          }
        ]}
        onPress={(e) => {
          navigateToTab(route);
        }}>
        <View style={styles.profilePictureContainer}>
          {profile?.picture ? (
            <Image
              source={{ uri: profile.picture }}
              style={styles.profilePicture}
            />
          ) : (
            <View style={[styles.profilePicturePlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={[styles.profilePictureText, { color: colors.surfaceDark }]}>
                {profile?.name?.charAt(0)?.toUpperCase() || currentPubkey?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  }

  // Default behavior for other tabs
  return (
    <Pressable
      style={[
        styles.webTabIconButton,
        active && { backgroundColor: colors.activeTabBackground, borderRadius: 20 }
      ]}
      onPress={(e) => {
        navigateToTab(route);
      }}>
      <SolarTabIcon
        name={iconName}
        color={active ? colors.text : colors.text}
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
  const [profile] = useStore(userProfile);
  const isLoggedIn = !!currentPubkey;
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

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

    // Only update history and push state if we actually changed between main tabs
    if (Platform.OS === 'web' && currentTab !== previousTab) {
      // Check if this is a real tab change (not just settings sub-page navigation)
      const isRealTabChange = !(
        (currentTab === TabRoutes.SETTINGS && previousTab === TabRoutes.SETTINGS) ||
        (segments.length > 2 && segments[1] === 'settings')
      );

      if (isRealTabChange) {
        const url = `/${currentTab}`;
        if (window.location.pathname !== url) {
          history.pushState({ tab: currentTab }, '', url);
        }
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
        <Pressable
          style={[
            styles.webSidebar,
            {
              borderRightColor: colors.sidebarBorder,
              backgroundColor: colors.surfaceDark,
              width: isSidebarExpanded ? 180 : 60,
            }
          ]}
          onPress={() => setIsSidebarExpanded(!isSidebarExpanded)}
        >
          {/* Top tabs */}
          <View style={styles.topTabs}>
            {Object.entries(tabIcons).slice(0, -2).map(([route, iconName]) => (
              <View key={route} style={styles.webTabButton}>
                {isSidebarExpanded ? (
                  <ExpandedTabItem
                    iconName={iconName as string}
                    route={route as TabRoutes}
                    active={activeTab === (route as TabRoutes)}
                    colors={colors}
                    profile={profile}
                    currentPubkey={currentPubkey}
                    isLoggedIn={isLoggedIn}
                  />
                ) : (
                  <TabBarPressIcon
                    iconName={iconName as string}
                    route={route as TabRoutes}
                    active={activeTab === (route as TabRoutes)}
                    colors={colors}
                    profile={profile}
                    currentPubkey={currentPubkey}
                    isLoggedIn={isLoggedIn}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Settings tab */}
          <View style={styles.bottomTab}>
            {Object.entries(tabIcons).slice(-1).map(([route, iconName]) => (
              <View key={route} style={styles.webTabButton}>
                {isSidebarExpanded ? (
                  <ExpandedTabItem
                    iconName={iconName as string}
                    route={route as TabRoutes}
                    active={activeTab === (route as TabRoutes)}
                    colors={colors}
                    profile={profile}
                    currentPubkey={currentPubkey}
                    isLoggedIn={isLoggedIn}
                  />
                ) : (
                  <TabBarPressIcon
                    iconName={iconName as string}
                    route={route as TabRoutes}
                    active={activeTab === (route as TabRoutes)}
                    colors={colors}
                    profile={profile}
                    currentPubkey={currentPubkey}
                    isLoggedIn={isLoggedIn}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Profile tab */}
          <View style={styles.bottomTab}>
            {Object.entries(tabIcons).slice(-2,-1).map(([route, iconName]) => (
              <View key={route} style={styles.webTabButton}>
                {isSidebarExpanded ? (
                  <ExpandedTabItem
                    iconName={iconName as string}
                    route={route as TabRoutes}
                    active={activeTab === (route as TabRoutes)}
                    colors={colors}
                    profile={profile}
                    currentPubkey={currentPubkey}
                    isLoggedIn={isLoggedIn}
                  />
                ) : (
                  <TabBarPressIcon
                    iconName={iconName as string}
                    route={route as TabRoutes}
                    active={activeTab === (route as TabRoutes)}
                    colors={colors}
                    profile={profile}
                    currentPubkey={currentPubkey}
                    isLoggedIn={isLoggedIn}
                  />
                )}
              </View>
            ))}
          </View>
        </Pressable>

        {/* Main Content Area */}
        <View style={[styles.webContent, { backgroundColor: colors.background }]}>
          {/* Header with Login/Logout Button */}
          <View style={[
            styles.webHeader,
            {
              borderBottomColor: colors.sidebarBorder,
              backgroundColor: colors.surfaceDark
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
          backgroundColor: colors.surfaceDark,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          height: 60,
          backgroundColor: colors.surfaceDark,
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
    width: 60,
    borderRightWidth: 1,
    paddingTop: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topTabs: {
    flex: 1,
    alignItems: 'center',
  },
  bottomTab: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  webTabButton: {
    width: '100%',
    height: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webTabIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerItemWrapper: {
    width: '100%',
    alignItems: 'flex-start', // Align content to the left
  },
  drawerItem: {
    width: '100%', // Full width to extend background across entire sidebar
    marginVertical: 4,
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
  profilePictureContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  profilePicturePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  profilePictureText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
