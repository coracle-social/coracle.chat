import { SlideUpPopup } from '@/components/generalUI/SlideUpPopup';
import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import { useSlideUpPopup } from '@/lib/hooks/useSlideUpPopup';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { SearchResult } from '@/lib/types/search';
import { getUserReaction, likePost, unlikePost } from '@/lib/utils/reactionUtils';
import { Button, Icon } from '@rneui/themed';
import { pubkey } from '@welshman/app';
import { int } from '@welshman/lib/src/Tools';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ContentResultActionsProps {
  result: SearchResult;
  onShare?: (result: SearchResult) => void;
  onBookmark?: (result: SearchResult) => void;
  showActions?: boolean;
}

export const ContentResultActions: React.FC<ContentResultActionsProps> = ({
  result,
  onShare,
  onBookmark,
  showActions = true,
}) => {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(result.metadata.likeCount || 0);
  const { isVisible, message, type, widthRatio, showPopup, hidePopup } = useSlideUpPopup();

  const formatNumber = (num: number) => {
    return int(num);
  };

  useEffect(() => {
    const checkExistingReaction = async () => {
      try {
        const userReaction = await getUserReaction(result.event.id);
        if (userReaction === '+') {
          setIsLiked(true);
        }
      } catch (error) {
        console.error('[CONTENT-ACTIONS] Error checking existing reaction:', error);
      }
    };

    checkExistingReaction();
  }, [result.event.id]);

  const handleLike = async () => {
    if (isLiking) return;

    // Check if user is logged in
    const currentUserPubkey = pubkey.get();
    if (!currentUserPubkey) {
      showPopup('You must login to react', 'warning');
      return;
    }

    try {
      setIsLiking(true);

      if (isLiked) {
        // Unlike
        await unlikePost(result.event);
        setIsLiked(false);
        setLocalLikeCount(prev => Math.max(0, prev - 1));
        console.log('[CONTENT-ACTIONS] Post unliked successfully');
      } else {
        // Like
        await likePost(result.event);
        setIsLiked(true);
        setLocalLikeCount(prev => prev + 1);
        console.log('[CONTENT-ACTIONS] Post liked successfully');
      }
    } catch (error) {
      console.error('[CONTENT-ACTIONS] Error handling like:', error);
      Alert.alert('Error', 'Failed to update reaction. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const renderEngagementStats = () => (
    <View style={styles.engagementContainer}>
      <TouchableOpacity
        style={styles.engagementButton}
        onPress={handleLike}
        disabled={isLiking}
        activeOpacity={0.7}
      >
        <Icon
          name={isLiked ? 'heart' : 'heart-outline'}
          type="ionicon"
          size={18}
          color={isLiked ? colors.error : colors.placeholder}
        />
        {localLikeCount > 0 && (
          <Text style={[styles.engagementText, { color: colors.placeholder }]}>
            {formatNumber(localLikeCount)}
          </Text>
        )}
      </TouchableOpacity>

      {result.metadata.replyCount !== undefined && (
        <View style={styles.engagementButton}>
          <Icon
            name="chatbubble-outline"
            type="ionicon"
            size={18}
            color={colors.placeholder}
          />
          <Text style={[styles.engagementText, { color: colors.placeholder }]}>
            {formatNumber(result.metadata.replyCount)}
          </Text>
        </View>
      )}

      {result.metadata.repostCount !== undefined && (
        <View style={styles.engagementButton}>
          <Icon
            name="repeat-outline"
            type="ionicon"
            size={18}
            color={colors.placeholder}
          />
          <Text style={[styles.engagementText, { color: colors.placeholder }]}>
            {formatNumber(result.metadata.repostCount)}
          </Text>
        </View>
      )}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      {onShare && (
        <Button
          type="clear"
          icon={
            <Icon
              name="share-outline"
              type="ionicon"
              size={18}
              color={colors.placeholder}
            />
          }
          onPress={() => onShare(result)}
          buttonStyle={styles.actionButton}
        />
      )}

      {onBookmark && (
        <Button
          type="clear"
          icon={
            <Icon
              name="bookmark-outline"
              type="ionicon"
              size={18}
              color={colors.placeholder}
            />
          }
          onPress={() => onBookmark(result)}
          buttonStyle={styles.actionButton}
        />
      )}
    </View>
  );

  if (!showActions) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        {renderEngagementStats()}
        {renderActionButtons()}
      </View>

      <SlideUpPopup
        isVisible={isVisible}
        message={message}
        type={type}
        widthRatio={widthRatio}
        onHide={hidePopup}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  engagementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: 20,
    marginRight: spacing(2),
  },
  engagementText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: spacing(1),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: spacing(2),
    marginLeft: spacing(1),
    borderRadius: 20,
  },
});
