import Colors from '@/core/env/Colors';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  // Fallback colors in case theme isn't loaded yet
  const backgroundColor = colors?.background || '#ffffff';
  const tintColor = colors?.tint || '#007AFF';

  return (
    <View style={{
      flex: 1,
      backgroundColor: backgroundColor,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <ActivityIndicator size="large" color={tintColor} />
      <Redirect href="/(tabs)/dashboard" />
    </View>
  );
}
