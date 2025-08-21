import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';

export default function UsageSettings() {
  const colors = useThemeColors();

  return (
    <Text>Usage</Text>
  );
}
