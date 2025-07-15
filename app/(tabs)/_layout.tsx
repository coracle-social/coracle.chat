import { useState, useEffect } from 'react';
import { Link, Tabs, router, useSegments } from 'expo-router';
import { Pressable, Platform, View, StyleSheet } from 'react-native';
import SolarIcon from '../../components/SolarIcons';
import Colors from '../../constants/Colors';
import { useTheme } from '../../components/theme/ThemeContext';
import { useClientOnlyValue } from '../../utils/useClientOnlyValue';

enum TabRoutes {
  DASHBOARD = 'dashboard',
  EXPLORE = 'explore',
  SPACES = 'spaces',
  MESSAGES = 'messages',
  SEARCH = 'search',
  SETTINGS = 'settings',
}

// Icon mapping for each tab
const TAB_ICONS = {
  [TabRoutes.DASHBOARD]: 'Home Smile',
  [TabRoutes.EXPLORE]: 'compass',
  [TabRoutes.SPACES]: 'Settings Minimalistic',
  [TabRoutes.MESSAGES]: 'Letter',
  [TabRoutes.SEARCH]: 'Magnifier',
  [TabRoutes.SETTINGS]: 'Settings',
} as const;

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
  activeTabValue,
  activeTab
}: { 
  iconName: string; 
  activeTabValue: TabRoutes;
  activeTab: TabRoutes;
}) {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  
  return (
    <Pressable
      style={[styles.webTabIconButton, activeTab === activeTabValue && styles.webTabIconButtonActive]}
      onPress={() => {
        router.navigate(`/(tabs)/${activeTabValue}` as any);
      }}>
      <SolarTabIcon 
        name={iconName}
        color={activeTab === activeTabValue ? Colors[colorScheme].tint : '#666'}
        strokeWidth={activeTab === activeTabValue ? 2.5 : 1.5}
      />
    </Pressable>
  );
}

export default function TabLayout() {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const isWeb = Platform.OS === 'web';
  const segments = useSegments();
  
  const getCurrentTab = (): TabRoutes => {
    if (segments.length > 0) {
      const currentSegment = segments[segments.length - 1];
      if (Object.values(TabRoutes).includes(currentSegment as TabRoutes)) {
        return currentSegment as TabRoutes;
      }
    }
    return TabRoutes.DASHBOARD;
  };
  
  const [activeTab, setActiveTab] = useState<TabRoutes>(getCurrentTab);

  useEffect(() => {
    const currentTab = getCurrentTab();
    setActiveTab(currentTab);
  }, [segments]);

  if (isWeb) {
    return (
      <View style={styles.webContainer}>
        {/* Left Sidebar */}
        <View style={styles.webSidebar}>
          {Object.entries(TAB_ICONS).map(([route, iconName]) => (
            <View key={route} style={styles.webTabButton}>
              <TabBarPressIcon 
                iconName={iconName} 
                activeTabValue={route as TabRoutes} 
                activeTab={activeTab}
              />
            </View>
          ))}
        </View>
        
        {/* Main Content Area */}
        <View style={styles.webContent}>
          {/* Header with Info Button */}
          <View style={styles.webHeader}>
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <View style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}>
                    <SolarTabIcon
                      name="Info Circle"
                      size={25}
                      color={Colors[colorScheme].text}
                    />
                  </View>
                )}
              </Pressable>
            </Link>
          </View>
          
          {/* Tab Content */}
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: Colors[colorScheme].tint,
              headerShown: false,
              tabBarStyle: { display: 'none' },
            }}>
            {Object.entries(TAB_ICONS).map(([route, iconName]) => (
              <Tabs.Screen
                key={route}
                name={route}
                options={{
                  title: route.charAt(0).toUpperCase() + route.slice(1),
                  tabBarIcon: ({ color }) => <SolarTabIcon name={iconName} color={color} strokeWidth={activeTab === route ? 2.5 : 1.5} />,
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
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].text,
        tabBarStyle: { backgroundColor: Colors[colorScheme].background },
        headerStyle: { height: 60 },
        headerTitleStyle: { fontSize: 16 },
        headerShown: useClientOnlyValue(false, true),
      }}>
      {Object.entries(TAB_ICONS).map(([route, iconName]) => (
        <Tabs.Screen
          key={route}
          name={route}
          options={{
            title: '',
            tabBarIcon: ({ color }) => <SolarTabIcon name={iconName} color={color} strokeWidth={activeTab === route ? 2.5 : 1.5} />,
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
    borderRightColor: '#e0e0e0',
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
  webTabIconButtonActive: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  webTabButtonActive: {
    backgroundColor: '#e0e0e0',
  },
  webTabText: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  webTabTextActive: {
    color: '#007AFF',
    fontWeight: 'bold',
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
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 20,
  },
});
