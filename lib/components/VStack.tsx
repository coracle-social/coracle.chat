import React from 'react';
import { View, ViewStyle } from 'react-native';

interface VStackProps {
  children: React.ReactNode;
  spacing?: number;
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  distribution?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  style?: ViewStyle;
  padding?: number | { horizontal?: number; vertical?: number; top?: number; bottom?: number; left?: number; right?: number };
  margin?: number | { horizontal?: number; vertical?: number; top?: number; bottom?: number; left?: number; right?: number };
}

export const VStack: React.FC<VStackProps> = ({
  children,
  spacing = 0,
  alignment = 'start',
  distribution = 'start',
  style,
  padding,
  margin,
}) => {
  const getAlignmentStyle = (): ViewStyle => {
    switch (alignment) {
      case 'start':
        return { alignItems: 'flex-start' };
      case 'center':
        return { alignItems: 'center' };
      case 'end':
        return { alignItems: 'flex-end' };
      case 'stretch':
        return { alignItems: 'stretch' };
      default:
        return { alignItems: 'flex-start' };
    }
  };

  const getDistributionStyle = (): ViewStyle => {
    switch (distribution) {
      case 'start':
        return { justifyContent: 'flex-start' };
      case 'center':
        return { justifyContent: 'center' };
      case 'end':
        return { justifyContent: 'flex-end' };
      case 'space-between':
        return { justifyContent: 'space-between' };
      case 'space-around':
        return { justifyContent: 'space-around' };
      case 'space-evenly':
        return { justifyContent: 'space-evenly' };
      default:
        return { justifyContent: 'flex-start' };
    }
  };

  const getPaddingStyle = (): ViewStyle => {
    if (typeof padding === 'number') {
      return { padding };
    }
    if (typeof padding === 'object') {
      return {
        paddingTop: padding.top,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left,
        paddingRight: padding.right,
        paddingHorizontal: padding.horizontal,
        paddingVertical: padding.vertical,
      };
    }
    return {};
  };

  const getMarginStyle = (): ViewStyle => {
    if (typeof margin === 'number') {
      return { margin };
    }
    if (typeof margin === 'object') {
      return {
        marginTop: margin.top,
        marginBottom: margin.bottom,
        marginLeft: margin.left,
        marginRight: margin.right,
        marginHorizontal: margin.horizontal,
        marginVertical: margin.vertical,
      };
    }
    return {};
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: spacing,
    ...getAlignmentStyle(),
    ...getDistributionStyle(),
    ...getPaddingStyle(),
    ...getMarginStyle(),
  };

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
};
export default VStack;
