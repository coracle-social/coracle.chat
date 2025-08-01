import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { BareEvent } from '@/lib/types/search';
import { toggleFollowProfile } from '@/lib/utils/followUtils';
import { Button, Icon } from '@rneui/themed';
import { pubkey } from '@welshman/app';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface ProfileResultActionsProps {
  result: BareEvent;
  onFollow?: (pubkey: string) => void;
  onShare?: (result: BareEvent) => void;
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
  const colors = useThemeColors();
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const handleFollow = async () => {
    if (isFollowLoading || !result.authorPubkey) return;

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
      const newFollowStatus = await toggleFollowProfile(result.authorPubkey);
      setIsFollowing(newFollowStatus);

      // Update local follower count
      setLocalFollowerCount(newFollowStatus ? localFollowerCount + 1 : Math.max(0, localFollowerCount - 1));

      // Call the parent onFollow callback if provided
      if (onFollow) {
        onFollow(result.authorPubkey);
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
  trustBadge: {
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.5),
    borderRadius: 8,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: spacing(0.5),
  },
});
