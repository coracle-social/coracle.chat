import { PubkeyDisplay } from '@/components/generalUI/PubkeyDisplay';
import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { SearchResult } from '@/lib/types/search';
import { parseContent } from '@/lib/utils/contentParser';
import { Avatar, Button, Divider, Icon, Overlay } from '@rneui/themed';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ProfileResultActions } from './ProfileResultActions';

interface ProfilePopupProps {
  isVisible: boolean;
  onClose: () => void;
  result: SearchResult;
  onFollow?: (pubkey: string) => void;
  onShare?: (result: SearchResult) => void;
  isFollowing: boolean;
  setIsFollowing: (following: boolean) => void;
  localFollowerCount: number;
  setLocalFollowerCount: (count: number) => void;
}

export const ProfilePopup: React.FC<ProfilePopupProps> = ({
  isVisible,
  onClose,
  result,
  onFollow,
  onShare,
  isFollowing,
  setIsFollowing,
  localFollowerCount,
  setLocalFollowerCount,
}) => {
  const { isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  // Extract banner image from profile data - check common banner fields
  const bannerImage = result.event.banner ||
                     result.event.cover_image ||
                     result.event.cover ||
                     result.event.header_image ||
                     null;

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

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={[
        styles.overlay,
        {
          backgroundColor: colors.surface,
          width: Math.min(windowWidth * 0.9, 600),
          maxHeight: windowHeight * 0.8,
          minHeight: windowHeight * 0.5,
          margin: 0,
          padding: 0,
        }
      ]}
    >
      {/* Header with banner image */}
      <View style={styles.headerContainer}>
        {bannerImage ? (
          <Image
            source={{ uri: bannerImage }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.bannerPlaceholder, { backgroundColor: colors.surfaceVariant }]} />
        )}

        {/* Close button overlay */}
        <View style={styles.closeButtonContainer}>
          <Button
            type="clear"
            icon={
              <Icon
                name="close"
                type="ionicon"
                size={24}
                color={colors.text}
              />
            }
            onPress={onClose}
            buttonStyle={[styles.closeButton, { backgroundColor: colors.surface + 'CC' }]}
          />
        </View>
      </View>

      <Divider />

      <ScrollView style={styles.overlayContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Left side - Profile info and description */}
          <View style={styles.leftSide}>
                        {/* Pubkey section */}
            <View style={styles.pubkeyContainer}>
              <PubkeyDisplay
                pubkey={result.metadata.authorPubkey || ''}
                showLabel={true}
                label="Public Key"
              />
            </View>

            {/* About/Description section */}
            <View style={styles.aboutContainer}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                About
              </Text>
              <ScrollView
                style={[
                  styles.aboutBox,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceVariant,
                  }
                ]}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.aboutText, { color: colors.text }]}>
                  {result.event.about ? parseContent(result.event.about).text : 'No description available'}
                </Text>
              </ScrollView>
            </View>


          </View>

          {/* Right side - Profile picture and actions */}
          <View style={styles.rightSide}>
                        {/* Profile picture */}
            <View style={styles.avatarContainer}>
              {result.event.picture ? (
                <Avatar
                  size={Platform.OS === 'web' ? 90 : 80}
                  rounded
                  source={{ uri: result.event.picture }}
                  title={(result.event.name || result.event.display_name || 'A').charAt(0).toUpperCase()}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.avatarText, { color: colors.surface }]}>
                    {(result.event.name || result.event.display_name || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

              {/* Name */}
              <Text style={[styles.nameText, { color: colors.text }]}>
                {result.event.name || result.event.display_name || 'Anonymous'}
              </Text>

              {/* Handle */}
              <Text style={[styles.handleText, { color: colors.placeholder }]}>
                {result.event.website || result.event.lud06 || result.event.lud16 || result.event.nip05 || ''}
            </Text>

              {/* Verification badge */}
              {result.metadata.verified && (
                <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
                  <Icon
                    name="checkmark-circle"
                    type="ionicon"
                    size={16}
                    color={colors.surface}
                  />
                  <Text style={[styles.verifiedText, { color: colors.surface }]}>
                    Verified
            </Text>
          </View>
              )}

              {/* Trust score */}
              {result.metadata.trustScore && result.metadata.trustScore > 0 && (
                <View style={[styles.trustBadge, { backgroundColor: colors.info }]}>
                  <Text style={[styles.trustText, { color: colors.surface }]}>
                    Trust Score: {result.metadata.trustScore}
            </Text>
          </View>
          )}
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <ProfileResultActions
                result={result}
                onFollow={onFollow}
                onShare={onShare}
                showActions={true}
                isFollowing={isFollowing}
                setIsFollowing={setIsFollowing}
                localFollowerCount={localFollowerCount}
                setLocalFollowerCount={setLocalFollowerCount}
              />
            </View>
          </View>
        </View>

        {/* Stats section - Full width, centered */}
        <View style={styles.fullWidthStatsContainer}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {localFollowerCount || result.metadata.followerCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.placeholder }]}>
                Followers
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {result.metadata.followingCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.placeholder }]}>
                Following
              </Text>
            </View>
            {result.metadata.timestamp && (
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {formatTimestamp(result.metadata.timestamp)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.placeholder }]}>
                  Created
                </Text>
              </View>
            )}
            {result.metadata.recentActivityTimestamp && (
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {formatActivityTimestamp(result.metadata.recentActivityTimestamp)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.primary }]}>
                  Recent Activity
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    borderRadius: 24,
    overflow: 'hidden',
    margin: 0,
    padding: 0,
  },
  headerContainer: {
    position: 'relative',
    height: 120,
    overflow: 'hidden',
    margin: 0,
    padding: 0,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? spacing(4) : spacing(3),
    right: Platform.OS === 'web' ? spacing(4) : spacing(3),
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  overlayContent: {
    padding: Platform.OS === 'web' ? spacing(4) : spacing(3),
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftSide: {
    flex: 1,
    marginRight: Platform.OS === 'web' ? spacing(4) : spacing(2),
  },
  rightSide: {
    alignItems: 'center',
    minWidth: Platform.OS === 'web' ? 200 : 150,
    maxWidth: Platform.OS === 'web' ? '50%' : '40%',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing(2),
  },
  pubkeyContainer: {
    marginBottom: spacing(4),
  },
  aboutContainer: {
    marginBottom: spacing(4),
  },
  aboutBox: {
    minHeight: 100,
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing(3),
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
  },
  statsContainer: {
    marginBottom: spacing(4),
  },
  fullWidthStatsContainer: {
    marginTop: spacing(4),
    marginBottom: spacing(4),
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing(1),
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing(3),
  },
  avatar: {
    width: Platform.OS === 'web' ? 90 : 80,
    height: Platform.OS === 'web' ? 90 : 80,
    borderRadius: Platform.OS === 'web' ? 45 : 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(2),
  },
  avatarText: {
    fontSize: Platform.OS === 'web' ? 36 : 32,
    fontWeight: '700',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing(1),
  },
  handleText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing(2),
    opacity: 0.7,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: 12,
    marginBottom: spacing(2),
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: spacing(1),
  },
  trustBadge: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: 8,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    width: '100%',
  },
});
