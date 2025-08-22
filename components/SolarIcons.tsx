// SolarIcon.tsx
import { useThemeColors } from '@/lib/theme/ThemeContext';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

// Dynamically import all SVGs in the solar folder
const req = require.context('../assets/icons/solar', false, /\.svg$/);

const iconMap: Record<string, React.ComponentType<any>> = {};
req.keys().forEach((fileName: string) => {
  const cleanName = fileName
    .replace('./', '')           // remove ./ prefix
    .replace('.svg', '');        // remove extension
  iconMap[cleanName] = req(fileName).default;
});

interface SolarIconProps {
  name: string;
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export default function SolarIcon({
  name,
  size = 24,
  color,
  fill = 'none',
  strokeWidth = 1.5,
  style,
  ...props
}: SolarIconProps) {
  const colors = useThemeColors();
  const iconColor = color || colors.text;

  const Icon = iconMap[name];
  if (!Icon) {
    console.warn(`Icon "${name}" not found in solar icons.`);
    return null;
  }

  return (
    <Icon
      width={size}
      height={size}
      stroke={iconColor}
      fill={fill}
      strokeWidth={strokeWidth}
      style={[{ color: iconColor }, style]}
      {...props}
    />
  );
}
