import { useThemeColors } from '@/lib/theme/ThemeContext';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

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

  // Use provided color or theme-aware default (black for light, white for dark)
  const iconColor = color || colors.text;

  const Icon = getIconByName(name);

  if (!Icon) {
    console.warn(`Icon "${name}" not found.`);
    return null;
  }

  // Apply color through style to use currentColor in SVGs
  const iconStyle = [
    { color: iconColor }, // This sets the currentColor for the SVG
    style
  ];

  return (
    <Icon
      width={size}
      height={size}
      stroke={iconColor}
      fill={fill}
      strokeWidth={strokeWidth}
      style={iconStyle}
      {...props}
    />
  );
}

// Icon importer with explicit imports
function getIconByName(name: string): React.ComponentType<Record<string, unknown>> | null {
  switch (name) {
    case 'Home Smile':
      return require('../assets/icons/solar/Home Smile.svg').default;
    case 'compass':
      return require('../assets/icons/solar/compass.svg').default;
    case 'Settings Minimalistic':
      return require('../assets/icons/solar/Settings Minimalistic.svg').default;
    case 'Letter':
      return require('../assets/icons/solar/Letter.svg').default;
    case 'Widget Add':
      return require('../assets/icons/solar/Widget Add.svg').default;
    case 'Info Circle':
      return require('../assets/icons/solar/Info Circle.svg').default;
    case 'Settings':
      return require('../assets/icons/solar/Settings.svg').default;
    case 'Magnifier':
      return require('../assets/icons/solar/Magnifer.svg').default;
    case 'User Rounded':
      return require('../assets/icons/solar/User Rounded.svg').default;
    default:
      console.warn(`Icon "${name}" not found.`);
      return null;
  }
}

// NOTE: SVGs now use currentColor for stroke, so color prop will work properly
// The color prop is applied through the style to set currentColor
