import { BorderRadius } from '@/core/env/BorderRadius';
import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { common, text } from '@/lib/utils/styleUtils';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface OptionButtonProps {
  title: string;
  onPress?: () => void;
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

  const getButtonMode = () => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
        return 'outlined';
      case 'danger':
        return 'contained';
      default:
        return 'outlined';
    }
  };

  return (
    <Button
      mode={getButtonMode()}
      onPress={onPress}
      disabled={disabled}
      icon={({ color, size }) => (
        <Feather
          name={icon as any}
          size={sizeStyles.iconSize}
          color={variantColors.iconColor}
        />
      )}
      style={[
        styles.optionButton,
        {
          borderRadius: sizeStyles.borderRadius,
        },
        style,
      ]}
      contentStyle={styles.buttonContent}
      labelStyle={[
        sizeStyles.textStyle,
        { color: variantColors.textColor },
      ]}
      buttonColor={variant === 'primary' || variant === 'danger' ? variantColors.backgroundColor : undefined}
      textColor={variantColors.textColor}
    >
      {title}
    </Button>
  );
};

const styles = StyleSheet.create({
  optionButton: {
    ...common.flexRow,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
