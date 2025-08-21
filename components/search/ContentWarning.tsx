import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { getContentWarning } from '@/lib/utils/contentParser';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

interface ContentWarningProps {
  tags: string[][];
  hideSensitiveContent: 'enabled' | 'disabled';
  children: React.ReactNode;
}

export const ContentWarning: React.FC<ContentWarningProps> = ({
  tags,
  hideSensitiveContent,
  children,
}) => {
  const colors = useThemeColors();
  const [isContentVisible, setIsContentVisible] = useState(false);

  const contentWarning = getContentWarning(tags);

  // If no content warning or user has disabled hiding, show content normally
  if (!contentWarning || hideSensitiveContent === 'disabled') {
    return <>{children}</>;
  }

  // If content is hidden and user hasn't chosen to show it
  if (!isContentVisible) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {children}
        </View>

        <View style={styles.overlay}>
          <View style={styles.warningContainer}>
            <Text style={[styles.warningText, { color: colors.text }]}>
              Warning: {contentWarning}
            </Text>
            <TouchableOpacity
              style={[styles.viewButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsContentVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewButtonText, { color: colors.onPrimary }]}>
                👁 View Anyway
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Content is visible, show it normally
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  contentContainer: {
    opacity: 0.3,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: spacing(3),
  },
  warningContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    padding: spacing(4),
    alignItems: 'center',
    maxWidth: '80%',
  },
  warningText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing(3),
    lineHeight: 22,
  },
  viewButton: {
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(4),
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
