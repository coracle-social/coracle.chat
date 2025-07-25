/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import Colors from '@/core/env/Colors';
import { useTheme } from './ThemeContext';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

type ColorName = Exclude<keyof typeof Colors.light & keyof typeof Colors.dark, 'tabIcons'>;

export function useThemeColor(
  colorName: ColorName,
  props?: { light?: string; dark?: string }
): string {
  const { isDark } = useTheme();
  const theme = isDark ? 'dark' : 'light';
  const colorFromProps = props?.[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
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
