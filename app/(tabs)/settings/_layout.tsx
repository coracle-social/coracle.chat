import { spacing } from '@/core/env/Spacing';
import SettingsSidebar from '@/lib/components/SettingsSidebar';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { View } from '@/lib/theme/Themed';
import { Slot, Stack } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

export default function SettingsLayout() {
  const colors = useThemeColors();

  // 📌 WEB: Keep sidebar layout
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.layout}>
          <SettingsSidebar />
          <View style={styles.mainContentWrapper}>
            <View style={styles.mainContent}>
              <Slot />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // 📌 MOBILE: Use stack navigation
  return (
    <>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Settings',
            // headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="generalSettings"
          options={{
            title: 'General Settings',
            presentation: Platform.OS === 'ios' ? 'modal' : 'card',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Profile Settings',
            presentation: Platform.OS === 'ios' ? 'modal' : 'card',
          }}
        />
        <Stack.Screen
          name="relays"
          options={{
            title: 'Relay Settings',
            presentation: Platform.OS === 'ios' ? 'modal' : 'card',
          }}
        />
        <Stack.Screen
          name="usage"
          options={{
            title: 'Usage Statistics',
            presentation: Platform.OS === 'ios' ? 'modal' : 'card',
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing(4),
    paddingHorizontal: spacing(1),
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  mainContentWrapper: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    maxWidth: 950,
    minWidth: 0,
  },
});
