import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { SearchResult } from '@/lib/types/search';
import { extractTitle } from '@/lib/utils/contentParser';
import { Avatar, Icon } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ProfileMini } from './ProfileMini';

interface ContentResultHeaderProps {
  result: SearchResult;
  localFollowerCount?: number;
  contentTitle?: string;
}

export const ContentResultHeader: React.FC<ContentResultHeaderProps> = ({
  result,
  localFollowerCount,
  contentTitle,
}) => {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  // Extract data from event
  const event = result.event;
  const content = event.content || '';
  const imageUrl = result.imageUrl;

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

  const renderAvatar = () => {
    if (imageUrl) {
      return (
        <Avatar
          size="medium"
          rounded
          source={{ uri: imageUrl }}
          containerStyle={styles.avatarContainer}
        />
      );
    }

    return (
      <Avatar
        size="medium"
        rounded
        title={result.metadata.author?.charAt(0).toUpperCase() || 'A'}
        containerStyle={[styles.avatarContainer, { backgroundColor: colors.primary }]}
        titleStyle={{ color: colors.surface, fontWeight: '700' }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Author Info Row with Title */}
      <View style={styles.authorRow}>
        <View style={styles.authorInfo}>
          {result.metadata.authorPubkey ? (
            <ProfileMini
              key={`header-profile-${result.metadata.authorPubkey}`}
              pubkey={result.metadata.authorPubkey}
              raw={result.metadata.authorPubkey}
              relays={result.relays}
            />
          ) : (
            <>
              {renderAvatar()}
              <View style={styles.authorDetails}>
                <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
                  {result.metadata.author || 'Anonymous'}
                </Text>
                <Text style={[styles.timestamp, { color: colors.placeholder }]}>
                  {result.metadata.timestamp ? formatTimestamp(result.metadata.timestamp) : ''}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Title - moved to same line */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {contentTitle || extractTitle(content)}
          </Text>
        </View>

        {/* Verification Icon */}
        {result.metadata.verified && (
          <Icon
            name="checkmark-circle"
            type="ionicon"
            size={20}
            color={colors.success}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing(2),
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(1),
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 0,
  },
  avatarContainer: {
    marginRight: spacing(2),
    flexShrink: 0,
  },
  authorDetails: {
    flex: 1,
    minWidth: 0,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 1,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: spacing(2),
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    flexWrap: 'wrap',
    flex: 1,
    minWidth: 0,
  },
});
