import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { SearchResult } from '@/lib/types/search';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface ProfileResultBodyProps {
  result: SearchResult;
  isScrollable?: boolean;
  maxHeight?: number;
}

export const ProfileResultBody: React.FC<ProfileResultBodyProps> = ({
  result,
  isScrollable = false,
  maxHeight,
}) => {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  // Extract description from event
  const profile = result.event;
  const description = profile.about || profile.nip05 || profile.lud06 || profile.lud16;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatActivityTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const content = (
    <>
      {description && (
        <Text
          style={[styles.bio, { color: colors.text }]}
          numberOfLines={isScrollable ? undefined : 2}
        >
          {description}
        </Text>
      )}

      <View style={styles.timestampContainer}>
        {result.metadata.timestamp && (
          <Text style={[styles.timestamp, { color: colors.placeholder }]}>
            Updated: {formatTimestamp(result.metadata.timestamp)}
          </Text>
        )}
        {result.metadata.recentActivityTimestamp && (
          <Text style={[styles.activityTimestamp, { color: colors.primary }]}>
            Active: {formatActivityTimestamp(result.metadata.recentActivityTimestamp)}
          </Text>
        )}
      </View>
    </>
  );

  if (isScrollable) {
    return (
      <ScrollView
        style={[styles.scrollableContainer, maxHeight ? { maxHeight } : undefined]}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing(2),
  },
  scrollableContainer: {
    flex: 1,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing(2),
    opacity: 0.8,
    flexWrap: 'wrap',
  },
  timestamp: {
    fontSize: 13,
    opacity: 0.6,
  },
  timestampContainer: {
    marginTop: spacing(1),
  },
  activityTimestamp: {
    fontSize: 13,
    opacity: 0.8,
  },
});
