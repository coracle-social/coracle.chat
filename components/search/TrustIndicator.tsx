import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TrustIndicatorProps {
  trustLevel: 'high' | 'medium' | 'low' | 'negative';
  networkDistance: number;
  trustScore?: number;
}

export const TrustIndicator: React.FC<TrustIndicatorProps> = ({
  trustLevel,
  networkDistance,
  trustScore
}) => {
  const colors = useThemeColors();

  const getTrustIcon = () => {
    switch (trustLevel) {
      case 'high': return '🛡️';
      case 'medium': return '⚖️';
      case 'low': return '⚠️';
      case 'negative': return '🚫';
      default: return '❓';
    }
  };

  const getTrustColor = () => {
    switch (trustLevel) {
      case 'high': return colors.success || '#4CAF50';
      case 'medium': return colors.warning || '#FF9800';
      case 'low': return colors.error || '#F44336';
      case 'negative': return colors.error || '#F44336';
      default: return colors.text;
    }
  };

  const getTrustLabel = () => {
    switch (trustLevel) {
      case 'high': return 'High Trust';
      case 'medium': return 'Medium Trust';
      case 'low': return 'Low Trust';
      case 'negative': return 'Negative Trust';
      default: return 'Unknown Trust';
    }
  };

  return (
    <View style={styles.trustContainer}>
      <Text style={[styles.trustIcon, { color: getTrustColor() }]}>
        {getTrustIcon()}
      </Text>
      <Text style={[styles.trustText, { color: colors.text }]}>
        {getTrustLabel()} • {networkDistance} hop{networkDistance !== 1 ? 's' : ''}
        {trustScore !== undefined && ` • ${(trustScore * 100).toFixed(0)}%`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  trustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.5),
  },
  trustIcon: {
    fontSize: 12,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '500',
  },
  trustScore: {
    fontSize: 10,
    fontWeight: '400',
    marginLeft: 'auto',
  },
});
