import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface CloseButtonProps {
  onPress: () => void;
  style?: any;
  size?: 'small' | 'medium' | 'large';
  position?: 'absolute' | 'relative';
}

export function CloseButton({
  onPress,
  style,
  size = 'medium',
  position = 'relative'
}: CloseButtonProps) {
  const colors = useThemeColors();

  const buttonSize = {
    small: 24,
    medium: 32,
    large: 40
  }[size];

  const textSize = {
    small: 12,
    medium: 16,
    large: 20
  }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.closeButton,
        {
          width: buttonSize,
          height: buttonSize,
          backgroundColor: colors.surface + 'CC',
          position: position === 'absolute' ? 'absolute' : 'relative',
        },
        style
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={[
        styles.closeButtonText,
        {
          color: colors.text,
          fontSize: textSize
        }
      ]}>
        ✕
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontWeight: '600',
  },
});
