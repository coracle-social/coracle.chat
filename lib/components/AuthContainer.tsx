import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { View } from '@/lib/theme/Themed';
import { withBorderRadius, withShadow } from '@/lib/utils/styleUtils';
import { StyleSheet } from 'react-native';

interface AuthContainerProps {
  children: React.ReactNode;
  style?: any;
}

export default function AuthContainer({ children, style }: AuthContainerProps) {
  const colors = useThemeColors();

  return (
    <View style={[
      styles.authContainer,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    width: '100%',
    maxWidth: 400,
    padding: spacing(6),
    ...withBorderRadius('lg'),
    borderWidth: 1,
    alignItems: 'center',
    alignSelf: 'flex-start',
    ...withShadow('medium'),
  },
});
