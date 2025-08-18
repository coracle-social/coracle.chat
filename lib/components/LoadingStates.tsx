import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

//For The Search Implementation, may be moved

interface LoadingStatesProps {
  type: 'searching' | 'loading-more' | 'initial' | 'empty' | 'error';
  message?: string;
  showSpinner?: boolean;
}

export const LoadingStates: React.FC<LoadingStatesProps> = ({
  type,
  message,
  showSpinner = true,
}) => {
  const colors = useThemeColors();

  const getDefaultMessage = () => {
    switch (type) {
      case 'searching':
        return 'Searching...';
      case 'loading-more':
        return 'Loading more results...';
      case 'initial':
        return 'Loading...';
      case 'empty':
        return 'No results found';
      case 'error':
        return 'Something went wrong';
      default:
        return 'Loading...';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'empty':
        return '📭';
      case 'error':
        return '⚠️';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showSpinner && type !== 'empty' && type !== 'error' && (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.spinner}
        />
      )}
      <Text style={[styles.icon, { color: colors.placeholder }]}>
        {getIcon()}
      </Text>
      <Text style={[styles.message, { color: colors.placeholder }]}>
        {message || getDefaultMessage()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(8),
    paddingBottom: spacing(30),
    borderRadius: 12,
    overflow: 'hidden',
  },
  spinner: {
    marginBottom: spacing(2),
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing(2),
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});
