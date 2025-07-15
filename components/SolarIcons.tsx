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
  color = '#202020',
  fill = 'none',
  strokeWidth = 1.5,
  style,
  ...props
}: SolarIconProps) {
  const Icon = getIconByName(name);

  if (!Icon) {
    console.warn(`Icon "${name}" not found.`);
    return null;
  }

  return (
    <Icon
      width={size}
      height={size}
      stroke={color}
      fill={fill}
      strokeWidth={strokeWidth}
      style={style}
      {...props}
    />
  );
}

// Icon importer with explicit imports
function getIconByName(name: string): React.ComponentType<any> | null {
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
    default:
      console.warn(`Icon "${name}" not found.`);
      return null;
  }
}


//NOTE CURRENT SVGs don't support fill and stroke, this will change in the future
//can also use bolded versions as a simple fix 