import { LayoutPresets } from '@/core/env/LayoutPresets';
import { PUBLIC_RELAYS } from '@/core/env/MetaConfig';
import { spacing } from '@/core/env/Spacing';
import { ExternalLink } from '@/lib/components/ExternalLink';
import { PubkeyDisplay } from '@/lib/components/PubkeyDisplay';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { BareEvent } from '@/lib/types/search';
import { parseContent } from '@/lib/utils/contentParser';
import { formatTimestampRelative } from '@/lib/utils/formatNums';
import { getRecentActivityTimestamp } from '@/lib/utils/profileLoadingUtility';
import { withBorderRadius } from '@/lib/utils/styleUtils';
import { Avatar, Button, Divider, Icon, Overlay } from '@rneui/themed';
import { repository } from '@welshman/app';
import { load } from '@welshman/net';
import React, { useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ProfileResultActions } from './ProfileResultActions';

interface ProfilePopupProps {
  isVisible: boolean;
  onClose: () => void;
  result: BareEvent;
  onFollow?: (pubkey: string) => void;
  onShare?: (result: BareEvent) => void;
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
  const colors = useThemeColors();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [isLoadingBanner, setIsLoadingBanner] = useState(false);
  const [recentActivityTimestamp, setRecentActivityTimestamp] = useState<number | null>(null);

  // Load banner image when popup is opened
  useEffect(() => {
    if (isVisible && !bannerImage && !isLoadingBanner) {
      loadBannerImage();
    }
  }, [isVisible, bannerImage, isLoadingBanner]);

  // Load recent activity timestamp when popup is opened
  useEffect(() => {
    if (isVisible && result.authorPubkey && !recentActivityTimestamp) {
      getRecentActivityTimestamp(result.authorPubkey).then(timestamp => {
        if (timestamp) {
          setRecentActivityTimestamp(timestamp);
        }
      });
    }
  }, [isVisible, result.authorPubkey, recentActivityTimestamp]);

  const loadBannerImage = async () => {
    if (!result.authorPubkey) return;

    setIsLoadingBanner(true);
    try {
      // Check if we have banner info in the current profile data
      const currentBanner = result.event.banner ||
                           result.event.cover_image ||
                           result.event.cover ||
                           result.event.header_image;

      if (currentBanner) {
        setBannerImage(currentBanner);
        setIsLoadingBanner(false);
        return;
      }

      // First check repository for fresh profile data
      const profileFilter = { kinds: [0], authors: [result.authorPubkey] };
      let localEvents = repository.query([profileFilter]);

      if (localEvents.length > 0) {
        const event = localEvents[0];
        const profile = JSON.parse(event.content || '{}');

        const newBanner = profile.banner ||
                         profile.cover_image ||
                         profile.cover ||
                         profile.header_image;

        if (newBanner) {
          setBannerImage(newBanner);
          setIsLoadingBanner(false);
          return;
        }
      }

      // Load from relays if not found locally
      const presetPublicRelays = PUBLIC_RELAYS.slice(0, 8);
      const relayUrls = presetPublicRelays.slice(0, 6);

      const profileEvents = await load({
        relays: relayUrls,
        filters: [{ kinds: [0], authors: [result.authorPubkey] }],
      }) as any[];

      if (profileEvents && profileEvents.length > 0) {
        const event = profileEvents[0];
        const profile = JSON.parse(event.content || '{}');

        const newBanner = profile.banner ||
                         profile.cover_image ||
                         profile.cover ||
                         profile.header_image;

        if (newBanner) {
          setBannerImage(newBanner);
        }
      }
    } catch (error) {
      console.error('[PROFILE-POPUP] Failed to load banner:', error);
    } finally {
      setIsLoadingBanner(false);
    }
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
      {/* Header with banner image - only show if banner exists */}
      {bannerImage && (
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: bannerImage }}
            style={styles.bannerImage}
            resizeMode="cover"
          />

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
      )}

      {/* Close button when no banner */}
      {!bannerImage && (
        <View style={styles.closeButtonContainerNoBanner}>
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
      )}

      <Divider />

      <ScrollView style={styles.overlayContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Left side - Profile info and description */}
          <View style={styles.leftSide}>
                        {/* Pubkey section */}
            <View style={styles.pubkeyContainer}>
              <PubkeyDisplay
                pubkey={result.authorPubkey || ''}
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
                {result.event.name || result.event.display_name || 'Loading...'}
              </Text>

              {/* Handle */}
              <View style={styles.handleTextContainer}>
                {(result.event.website || result.event.lud06 || result.event.lud16 || result.event.nip05) && (
                  <ExternalLink
                    href={result.event.website || result.event.lud06 || result.event.lud16 || result.event.nip05 || ''}
                    style={[styles.handleText, { color: colors.primary }]}
                    numberOfLines={1}
                  >
                    {result.event.website || result.event.lud06 || result.event.lud16 || result.event.nip05 || ''}
                  </ExternalLink>
                )}
              </View>

              {/* Verification badge */}
              {result.verified && (
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
                {localFollowerCount || result.followerCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.placeholder }]}>
                Followers
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {result.followingCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.placeholder }]}>
                Following
              </Text>
            </View>
            {result.event.created_at && (
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {formatTimestampRelative(result.event.created_at)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.placeholder }]}>
                  Created
                </Text>
              </View>
            )}
            {recentActivityTimestamp && (
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {formatTimestampRelative(recentActivityTimestamp)}
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
    ...withBorderRadius('xxl'),
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

  closeButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? spacing(4) : spacing(3),
    right: Platform.OS === 'web' ? spacing(4) : spacing(3),
    zIndex: 10,
  },
  closeButtonContainerNoBanner: {
    position: 'absolute',
    top: Platform.OS === 'web' ? spacing(4) : spacing(3),
    right: Platform.OS === 'web' ? spacing(4) : spacing(3),
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    ...withBorderRadius('round'),
  },
  overlayContent: {
    padding: Platform.OS === 'web' ? spacing(4) : spacing(3),
    flex: 1,
  },
  container: {
    ...LayoutPresets.rowStart,
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
    ...withBorderRadius('md'),
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
    ...LayoutPresets.row,
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
    ...LayoutPresets.center,
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
  handleTextContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing(2),
    maxWidth: 200,
  },
  handleText: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: 180,
  },
  verifiedBadge: {
    ...LayoutPresets.row,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    ...withBorderRadius('md'),
    marginBottom: spacing(2),
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: spacing(1),
  },

  actionsContainer: {
    width: '100%',
  },
});
