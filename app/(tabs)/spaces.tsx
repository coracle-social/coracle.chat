import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text, View } from '@/lib/theme/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SpacesScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text }}>Spaces</Text>
      </View>
    </SafeAreaView>
  );
}
