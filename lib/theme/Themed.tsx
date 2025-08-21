/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import { useTheme } from './ThemeContext';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

type ColorName = 'text' | 'background' | 'tint' | 'tabIconDefault' | 'tabIconSelected' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'surface' | 'surfaceVariant' | 'border' | 'divider' | 'disabled' | 'placeholder' | 'interactiveIcon' | 'interactiveBorder' | 'inactiveIcon' | 'sidebarBorder' | 'activeTabBackground' | 'inactiveTabText' | 'activeTabText' | 'buttonBorder';

export function useThemeColor(
  colorName: ColorName,
  props?: { light?: string; dark?: string }
): string {
  const { isDark, getColors } = useTheme();
  const colors = getColors();
  const theme = isDark ? 'dark' : 'light';
  const colorFromProps = props?.[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor('text', { light: lightColor, dark: darkColor });

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor('background', { light: lightColor, dark: darkColor });

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
