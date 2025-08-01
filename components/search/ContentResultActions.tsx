import { spacing } from '@/core/env/Spacing';
import { useLazyCommentCounts } from '@/lib/hooks/useLazyCommentCounts';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { BareEvent } from '@/lib/types/search';
import { formatNumber } from '@/lib/utils/formatNums';
import { Icon } from '@rneui/themed';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { EmojiReactions } from './EmojiReactions';
import { InlineCommentView } from './InlineCommentView';

interface ContentResultActionsProps {
  result: BareEvent;
  onComment?: () => void;
  onLoginRequired?: (message: string, type?: 'info' | 'warning' | 'error' | 'success') => void;
}

export const ContentResultActions: React.FC<ContentResultActionsProps> = ({
  result,
  onLoginRequired,
}) => {
  const colors = useThemeColors();

  const [showComments, setShowComments] = useState(false);

  // Use lazy comment counts for better performance
  const { getCommentCount } = useLazyCommentCounts({
    eventIds: [result.event.id],
    enabled: true,
    loadFromRelays: true
  });

  // Get comment count from repository (always fresh)
  const commentCount = getCommentCount(result.event.id);

  const handleComment = () => {
    setShowComments(!showComments);
    // Don't call onComment callback to avoid triggering popups
    // onComment?.();
  };

  const renderEngagementStats = () => (
    <View style={styles.engagementContainer}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.engagementButton}
          onPress={handleComment}
          activeOpacity={0.7}
        >
          <Icon
            name="chatbubble-outline"
            type="ionicon"
            size={22}
            color={showComments ? colors.primary : colors.interactiveIcon}
          />
          <Text style={[styles.engagementText, { color: showComments ? colors.primary : colors.interactiveIcon }]}>
            {formatNumber(commentCount)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Emoji Reactions */}
      <EmojiReactions result={result} maxVisible={4} />
    </View>
  );

  return (
    <>
      {/* Dividing line at the top */}
      <View style={[styles.dividingLine, { backgroundColor: colors.border }]} />

      {renderEngagementStats()}

      {/* Inline Comment View */}
      <InlineCommentView
        eventId={result.event.id}
        isVisible={showComments}
        onClose={() => setShowComments(false)}
        showAllComments={true}
        onLoginRequired={onLoginRequired}
      />
    </>
  );
};

const styles = StyleSheet.create({
  dividingLine: {
    height: 0.5,
    width: '90%',
    alignSelf: 'center',
    marginTop: spacing(1),
  },
  engagementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.25),
    marginTop: spacing(1), // Increased from spacing(0.25) for better separation
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
    borderRadius: 10,
    minWidth: 52,
    justifyContent: 'center',
    marginRight: spacing(0.75),
  },
  engagementText: {
    fontSize: 15,
    marginLeft: spacing(0.75),
    fontWeight: '600',
  },
});
