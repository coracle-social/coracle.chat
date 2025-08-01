import { BorderRadius } from '@/core/env/BorderRadius';
import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { common, text } from '@/lib/utils/styleUtils';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface OptionButtonProps {
  title: string;
  onPress: () => void;
  icon: string;
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: any;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  title,
  onPress,
  icon,
  variant = 'default',
  size = 'medium',
  disabled = false,
  style,
}) => {
  const colors = useThemeColors();

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          textColor: colors.surface,
          iconColor: colors.surface,
        };
      case 'secondary':
        return {
          backgroundColor: colors.surfaceVariant,
          borderColor: colors.border,
          textColor: colors.text,
          iconColor: colors.primary,
        };
      case 'danger':
        return {
          backgroundColor: colors.error,
          borderColor: colors.error,
          textColor: colors.surface,
          iconColor: colors.surface,
        };
      default:
        return {
          backgroundColor: colors.surfaceVariant,
          borderColor: colors.border,
          textColor: colors.text,
          iconColor: colors.primary,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: spacing(2),
          paddingVertical: spacing(1),
          borderRadius: BorderRadius.xs,
          iconSize: 12,
          textStyle: text.sm,
        };
      case 'large':
        return {
          paddingHorizontal: spacing(4),
          paddingVertical: spacing(3),
          borderRadius: BorderRadius.md,
          iconSize: 20,
          textStyle: text.lg,
        };
      default: // medium
        return {
          paddingHorizontal: spacing(3),
          paddingVertical: spacing(2),
          borderRadius: BorderRadius.sm,
          iconSize: 16,
          textStyle: text.md,
        };
    }
  };

  const variantColors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        {
          backgroundColor: variantColors.backgroundColor,
          borderColor: variantColors.borderColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          borderRadius: sizeStyles.borderRadius,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Feather
        name={icon as any}
        size={sizeStyles.iconSize}
        color={variantColors.iconColor}
      />
      <Text
        style={[
          styles.optionText,
          sizeStyles.textStyle,
          { color: variantColors.textColor },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionButton: {
    ...common.flexRow,
    borderWidth: 1,
    gap: spacing(2),
  },
  optionText: {
    ...text.medium,
  },
  disabled: {
    opacity: 0.5,
  },
});
