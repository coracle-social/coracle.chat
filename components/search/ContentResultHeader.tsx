import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { BareEvent } from '@/lib/types/search';
import { extractTitle } from '@/lib/utils/contentParser';
import { formatTimestampRelative } from '@/lib/utils/formatNums';
import { createConversationUrl } from '@/lib/utils/nip19Utils';
import { Avatar, Icon } from '@rneui/themed';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ProfileMini } from './ProfileMini';

interface ContentResultHeaderProps {
  result: BareEvent;
  localFollowerCount?: number;
  contentTitle?: string;
}

export const ContentResultHeader: React.FC<ContentResultHeaderProps> = ({
  result,
  localFollowerCount,
  contentTitle,
}) => {
  const colors = useThemeColors();

  // Extract data from event
  const event = result.event;
  const content = event.content || '';
  const imageUrl = event.picture; // Use picture from event if available

  const handleViewConversation = () => {
    const conversationUrl = createConversationUrl(result.event.id, []);
    //temporary fix for the type error, once it becomes a real route path we won't need any
    router.push(conversationUrl as any);
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
        title={result.authorPubkey?.charAt(0).toUpperCase() || 'A'}
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
          {result.authorPubkey ? (
            <ProfileMini
              key={`header-profile-${result.authorPubkey}`}
              pubkey={result.authorPubkey}
              raw={result.authorPubkey}
              relays={[]}
            />
          ) : (
            <>
              {renderAvatar()}
              <View style={styles.authorDetails}>
                <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
                  {result.authorPubkey?.substring(0, 8) + '...' || 'Loading...'}
                </Text>
                <Text style={[styles.timestamp, { color: colors.placeholder }]}>
                  {result.event.created_at ? formatTimestampRelative(result.event.created_at) : ''}
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

        {/* View Full Conversation Button */}
        <TouchableOpacity
          onPress={handleViewConversation}
          style={styles.viewConversationButton}
          activeOpacity={0.7}
        >
          <Icon
            name="chatbubble-outline"
            type="ionicon"
            size={16}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* Verification Icon */}
        {result.verified && (
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
    flexShrink: 1,
    minWidth: 0,
  },
  viewConversationButton: {
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.5),
    minHeight: 32,
  },
  viewConversationTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
});
