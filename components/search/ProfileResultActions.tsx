import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import { useTheme } from '@/lib/theme/ThemeContext';
import { SearchResult } from '@/lib/types/search';
import { toggleFollowProfile } from '@/lib/utils/followUtils';
import { Button, Icon } from '@rneui/themed';
import { pubkey } from '@welshman/app';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface ProfileResultActionsProps {
  result: SearchResult;
  onFollow?: (pubkey: string) => void;
  onShare?: (result: SearchResult) => void;
  showActions?: boolean;
  isFollowing: boolean;
  setIsFollowing: (following: boolean) => void;
  localFollowerCount: number;
  setLocalFollowerCount: (count: number) => void;
  onLoginRequired?: (message: string, type?: 'info' | 'warning' | 'error' | 'success') => void;
}

export const ProfileResultActions: React.FC<ProfileResultActionsProps> = ({
  result,
  onFollow,
  onShare,
  showActions = true,
  isFollowing,
  setIsFollowing,
  localFollowerCount,
  setLocalFollowerCount,
  onLoginRequired,
}) => {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const handleFollow = async () => {
    if (isFollowLoading || !result.metadata.authorPubkey) return;

    // Check if user is logged in
    const currentUserPubkey = pubkey.get();
    if (!currentUserPubkey) {
      if (onLoginRequired) {
        onLoginRequired('You must login to follow profiles', 'warning');
      }
      return;
    }

    try {
      setIsFollowLoading(true);
      const newFollowStatus = await toggleFollowProfile(result.metadata.authorPubkey);
      setIsFollowing(newFollowStatus);

      // Update local follower count
      setLocalFollowerCount(newFollowStatus ? localFollowerCount + 1 : Math.max(0, localFollowerCount - 1));

      // Call the parent onFollow callback if provided
      if (onFollow) {
        onFollow(result.metadata.authorPubkey);
      }

      console.log('[PROFILE-ACTIONS] Follow status updated:', newFollowStatus);
    } catch (error) {
      console.error('[PROFILE-ACTIONS] Error toggling follow:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <Button
        title={isFollowing ? 'Following' : 'Follow'}
        type={isFollowing ? 'outline' : 'solid'}
        buttonStyle={[
          styles.followButton,
          isFollowing
            ? { borderColor: colors.primary, backgroundColor: 'transparent' }
            : { backgroundColor: colors.primary }
        ]}
        titleStyle={[
          styles.followButtonText,
          { color: isFollowing ? colors.primary : colors.surface }
        ]}
        onPress={handleFollow}
        loading={isFollowLoading}
        disabled={isFollowLoading}
      />

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
    </View>
  );

  if (!showActions) {
    return null;
  }

  return renderActionButtons();
};

const styles = StyleSheet.create({
  actionButtonsContainer: {
    alignItems: 'center',
    gap: spacing(2),
  },
  followButton: {
    borderRadius: 18,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    minWidth: 90,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    padding: spacing(2),
    borderRadius: 18,
  },
});
