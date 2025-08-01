import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { BareEvent } from '@/lib/types/search';
import { formatTimestampRelative } from '@/lib/utils/formatNums';
import { getRecentActivityTimestamp } from '@/lib/utils/profileLoadingUtility';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface ProfileResultBodyProps {
  result: BareEvent;
  isScrollable?: boolean;
  maxHeight?: number;
}

export const ProfileResultBody: React.FC<ProfileResultBodyProps> = ({
  result,
  isScrollable = false,
  maxHeight,
}) => {
  const colors = useThemeColors();
  const [recentActivityTimestamp, setRecentActivityTimestamp] = useState<number | null>(null);

  // Extract description from event
  const profile = result.event;
  const description = profile.about || profile.nip05;

  // Load recent activity timestamp on-demand
  useEffect(() => {
    if (result.authorPubkey) {
      getRecentActivityTimestamp(result.authorPubkey).then(timestamp => {
        if (timestamp) {
          setRecentActivityTimestamp(timestamp);
        }
      })
    }
  }, [result.authorPubkey]);

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
        {result.event.created_at && (
          <Text style={[styles.timestamp, { color: colors.placeholder }]}>
            Updated: {formatTimestampRelative(result.event.created_at)}
          </Text>
        )}
        {recentActivityTimestamp && (
          <Text style={[styles.activityTimestamp, { color: colors.primary }]}>
            Active: {formatTimestampRelative(recentActivityTimestamp)}
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
