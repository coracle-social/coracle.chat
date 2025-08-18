import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { BareEvent } from '@/lib/types/search';
import { extractNostrEntities } from '@/lib/utils/contentEntityRenderer';
import { parseContent } from '@/lib/utils/contentParser';
import { formatTimestampDate } from '@/lib/utils/formatNums';
import { sortBy } from '@welshman/lib';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ContentMini } from './ContentMini';
import { ProfileMini } from './ProfileMini';

interface CommentViewProps {
  comment: BareEvent | any; // Support both BareEvent and raw comment data
  isReply?: boolean;
  totalReplies?: number;
  isTopLevel?: boolean;
}

export const CommentView: React.FC<CommentViewProps> = ({
  comment,
  isReply = false,
  totalReplies = 0,
  isTopLevel = false,
}) => {
  const colors = useThemeColors();

  // Handle both BareEvent and raw comment data structures
  const commentData = 'event' in comment ? comment.event : comment;
  const content = commentData.content || '';
  const pubkey = commentData.pubkey || '';
  const createdAt = commentData.created_at || 0;

  // Extract Nostr entities using the utility
  const { profiles, events, hashtags, urls } = extractNostrEntities(
    content,
    commentData.tags || [],
    pubkey
  );

  // Parse content for media and URLs
  const parsedContent = parseContent(content) || {
    text: content,
    urls: [],
    mediaUrls: [],
    websiteUrls: [],
    hashtags: []
  };

  const renderContentWithEntities = (text: string) => {
    if (!text) return null;

    if (profiles.length === 0 && events.length === 0 && hashtags.length === 0 && urls.length === 0) {
      return (
        <Text style={[styles.commentText, { color: colors.text }]}>
          {text}
        </Text>
      );
    }

    const renderTextWithEntities = () => {
      let processedText = text;
      const elements: React.ReactNode[] = [];
      let elementIndex = 0;

      // Sort entities by their position in the text
      const allEntities = sortBy(
        (entity) => processedText.indexOf(entity.raw),
        [
        ...profiles.map(profile => ({ ...profile, type: 'profile' as const })),
        ...events.map(event => ({ ...event, type: 'event' as const })),
        ...hashtags.map(hashtag => ({ raw: hashtag, type: 'hashtag' as const })),
        ...urls.map(url => ({ raw: url, type: 'url' as const }))
      ]);

      allEntities.forEach(entity => {
        const index = processedText.indexOf(entity.raw);
        if (index !== -1) {
          // Add text before the entity
          if (index > 0) {
            elements.push(
              <Text key={`text-${elementIndex++}`} style={[styles.commentText, { color: colors.text }]}>
                {processedText.substring(0, index)}
              </Text>
            );
          }

          // Add the entity with inline styling
          if (entity.type === 'profile' && entity.pubkey) {
            elements.push(
              <View key={`profile-${elementIndex++}`}>
                <ProfileMini
                  pubkey={entity.pubkey}
                  relays={entity.relays}
                  raw={entity.raw}
                  inline={true}
                />
              </View>
            );
          } else if (entity.type === 'event' && entity.id) {
            elements.push(
              <View key={`event-${elementIndex++}`}>
                <ContentMini
                  eventId={entity.id}
                  relays={entity.relays}
                  raw={entity.raw}
                />
              </View>
            );
          } else if (entity.type === 'hashtag') {
            elements.push(
              <Text key={`hashtag-${elementIndex++}`} style={[styles.hashtag, { color: colors.primary }]}>
                #{entity.raw}
              </Text>
            );
          } else if (entity.type === 'url') {
            elements.push(
              <Text key={`url-${elementIndex++}`} style={[styles.url, { color: colors.primary }]}>
                {entity.raw}
              </Text>
            );
          }

          processedText = processedText.substring(index + entity.raw.length);
        }
      });

      // Add remaining text
      if (processedText.length > 0) {
        elements.push(
          <Text key={`text-${elementIndex++}`} style={[styles.commentText, { color: colors.text }]}>
            {processedText}
          </Text>
        );
      }

      return elements;
    };

    return renderTextWithEntities();
  };

  return (
    <View style={styles.commentContainer}>
      {/* Comment Header */}
      <View style={styles.commentHeader}>
        <ProfileMini
          pubkey={pubkey}
          raw={pubkey}
          relays={[]}
        />
        <Text style={[styles.timestamp, { color: colors.placeholder }]}>
          {formatTimestampDate(createdAt)}
        </Text>
      </View>

      {/* Comment Content */}
      <View style={styles.commentContent}>
        {renderContentWithEntities(parsedContent.text)}
      </View>

      {/* Reply Count */}
      {isTopLevel && totalReplies > 0 && (
        <View style={styles.replyInfo}>
          <Text style={[styles.replyCount, { color: colors.placeholder }]}>
            {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    marginVertical: spacing(1),
    paddingVertical: spacing(1),
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(0.5),
  },
  timestamp: {
    fontSize: 12,
    marginLeft: spacing(1),
  },
  commentContent: {
    marginBottom: spacing(0.5),
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  replyInfo: {
    marginTop: spacing(0.5),
  },
  replyCount: {
    fontSize: 12,
  },
  repliesContainer: {
    marginTop: spacing(1),
  },
  moreRepliesButton: {
    paddingVertical: spacing(0.5),
    marginTop: spacing(0.5),
  },
  moreRepliesText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing(4),
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing(4),
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing(4),
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing(2),
  },
  retryButton: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewAllContainer: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  viewAllButton: {
    paddingVertical: spacing(1),
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  hashtag: {
    fontSize: 14,
    fontWeight: '500',
  },
  url: {
    fontSize: 14,
    fontWeight: '500',
  },
});
