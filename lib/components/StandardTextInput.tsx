import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

interface StandardTextInputProps extends TextInputProps {
  containerStyle?: any;
}

export function StandardTextInput({
  style,
  containerStyle,
  placeholderTextColor,
  ...props
}: StandardTextInputProps) {
  const colors = useThemeColors();

  return (
    <TextInput
      style={[
        styles.textInput,
        {
          color: colors.text,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style
      ]}
      placeholderTextColor={placeholderTextColor || colors.placeholder}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    minHeight: 50,
    maxHeight: 100,
    borderRadius: 12,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    outlineWidth: 0, //removes web automatic outline
  },
});
