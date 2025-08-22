import { useShimmerConfig } from '@/core/env/ShimmerConfig';
import { spacing } from '@/core/env/Spacing';
import { HStack } from '@/lib/components/HStack';
import { KaleidoscopeAvatar } from '@/lib/components/KaleidoscopeAvatar';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { BareEvent } from '@/lib/types/search';
import { Avatar } from '@rneui/themed';
import { deriveProfile } from '@welshman/app';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { ProfilePopup } from './ProfilePopup';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

interface ProfileMiniProps {
  pubkey: string;
  relays?: string[];
  raw: string;
  onProfilePress?: (profile: BareEvent) => void;
  inline?: boolean;
  showNameOnly?: boolean; // When false, only shows avatar
  vertical?: boolean; // When true, shows vertical layout with image, name, and URL
  result?: BareEvent; // Optional full result data for follow information
}

export const ProfileMini: React.FC<ProfileMiniProps> = ({
  pubkey,
  relays = [],
  raw,
  onProfilePress,
  inline = false,
  showNameOnly = true, // Default to true to preserve existing behavior
  vertical = false, // Default to false to preserve existing behavior
  result,
}) => {
  const colors = useThemeColors();
  const shimmerConfig = useShimmerConfig();

  // Proportion-based responsive sizing (iPhone 14 regular = 390px baseline)
  const screenWidth = Dimensions.get('window').width;
  const baselineWidth = 390; // iPhone 14 regular
  const scaleFactor = screenWidth / baselineWidth;

  // Scale the base dimensions proportionally
  const baseWidth = 120;
  const baseHeight = 100;
  const scaledWidth = Math.round(baseWidth * scaleFactor);
  const scaledHeight = Math.round(baseHeight * scaleFactor);

  // Direct store access - much simpler
  const profileStore = deriveProfile(pubkey, relays);
  const [profile] = useStore(profileStore);

  // Use result data if available, otherwise create from store profile
  const profileData = result || (profile ? {
    id: `profile-${pubkey}`,
    type: 'profile',
    event: profile,
    authorPubkey: pubkey,
  } as BareEvent : undefined);

  const isLoading = !profileData;

  const [showPopup, setShowPopup] = useState(false);
  const [isFollowing, setIsFollowing] = useState(profileData?.isFollowing || false);
  const [localFollowerCount, setLocalFollowerCount] = useState(profileData?.followerCount || 0);

  const handlePress = () => {
    if (profileData) {
      if (onProfilePress) {
        onProfilePress(profileData);
      } else {
        setShowPopup(true);
      }
    }
  };

  const displayName =
    profileData?.event.name ||
    profileData?.event.display_name ||
    'Loading...';

  const displayUrl = profileData?.event.website || '';

  const renderAvatar = () => {
    if (isLoading) {
      return (
        <ShimmerPlaceholder
          visible={false}
          width={vertical ? 48 : (inline ? 24 : 32)}
          height={vertical ? 48 : (inline ? 24 : 32)}
          style={[
            vertical && styles.verticalAvatar,
            { borderRadius: vertical ? 24 : (inline ? 12 : 16) }
          ]}
          shimmerStyle={shimmerConfig.shimmerStyle}
          shimmerColors={shimmerConfig.shimmerColors}
          duration={shimmerConfig.duration}
          shimmerWidthPercent={shimmerConfig.shimmerWidthPercent}
          location={shimmerConfig.location}
          isInteraction={false}
        />
      );
    }

    if (profileData?.event.picture) {
      return (
        <Avatar
          size={vertical ? 'medium' : (inline ? 'small' : 'small')}
          rounded
          source={{ uri: profileData.event.picture }}
          title={displayName.charAt(0).toUpperCase()}
          containerStyle={[
            { backgroundColor: colors.primary },
            vertical && styles.verticalAvatar,
          ]}
          titleStyle={{ color: colors.surface, fontSize: vertical ? 16 : (inline ? 10 : 12) }}
        />
      );
    }

    // Use KaleidoscopeAvatar when no profile picture
    const avatarSize = vertical ? 48 : (inline ? 24 : 32);
    return (
      <View style={[
        vertical && styles.verticalAvatar,
        { borderRadius: avatarSize / 2 }
      ]}>
        <KaleidoscopeAvatar size={avatarSize} />
      </View>
    );
  };

  const renderName = () => {
    if (isLoading) {
      return (
        <ShimmerPlaceholder
          visible={false}
          width={vertical ? 120 : (inline ? 80 : 120)}
          height={vertical ? 16 : (inline ? 12 : 14)}
          style={[styles.name, { borderRadius: 4 }]}
          shimmerStyle={shimmerConfig.shimmerStyle}
          shimmerColors={shimmerConfig.shimmerColors}
          duration={shimmerConfig.duration}
          shimmerWidthPercent={shimmerConfig.shimmerWidthPercent}
          location={shimmerConfig.location}
          isInteraction={false}
        />
      );
    }

    return (
      <Text
        style={[styles.name, inline && styles.inlineName, vertical && styles.verticalName, { color: colors.text }]}
        numberOfLines={1}
      >
        {inline
          ? displayName.length > 12
            ? displayName.substring(0, 12) + '...'
            : displayName
          : displayName}
      </Text>
    );
  };

  const renderUrl = () => {
    if (!showNameOnly) return null;

    if (isLoading) {
      return (
        <ShimmerPlaceholder
          visible={false}
          width={100}
          height={12}
          style={[styles.url, { borderRadius: 4 }]}
          shimmerStyle={shimmerConfig.shimmerStyle}
          shimmerColors={shimmerConfig.shimmerColors}
          duration={shimmerConfig.duration}
          shimmerWidthPercent={shimmerConfig.shimmerWidthPercent}
          location={shimmerConfig.location}
          isInteraction={false}
        />
      );
    }

    return (
      <Text
        style={[styles.url, { color: displayUrl ? colors.secondary : colors.text }]}
        numberOfLines={1}
      >
        {displayUrl || ''}
      </Text>
    );
  };

  return (
    <>
      <View
        style={[
          styles.container,
          inline && styles.inlineContainer,
          vertical && styles.verticalContainer,
          vertical && {
            width: scaledWidth,
            height: scaledHeight,
          },
          { backgroundColor: vertical ? colors.surface : 'transparent' },
        ]}
      >
        <Pressable
          onPress={handlePress}
          android_ripple={{ color: colors.surfaceVariant }}
          style={vertical && styles.verticalPressable}
        >

          {vertical ? (
  <>
    {renderAvatar()}
    {showNameOnly && (
      <View style={styles.textContainer}>
        {renderName()}
        {renderUrl()}
      </View>
    )}
  </>
) : (
  <HStack spacing={8}>
    {renderAvatar()}
    {showNameOnly && (
      <View style={styles.textContainer}>
        {renderName()}
        {renderUrl()}
      </View>
    )}
  </HStack>
)}

        </Pressable>
      </View>

      {showPopup && profileData && (
        <ProfilePopup
          isVisible={showPopup}
          onClose={() => setShowPopup(false)}
          result={profileData}
          isFollowing={isFollowing}
          setIsFollowing={setIsFollowing}
          localFollowerCount={localFollowerCount}
          setLocalFollowerCount={setLocalFollowerCount}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingVertical: spacing(0.5),
    paddingHorizontal: spacing(0.5),
    borderRadius: spacing(2),
  },
  inlineContainer: {
    paddingVertical: spacing(0.25),
    paddingHorizontal: spacing(0.5),
    borderRadius: spacing(1),
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(1.5),
    borderRadius: spacing(3),
  },
  verticalPressable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  inlineName: {
    fontSize: 12,
    fontWeight: '400',
  },
  verticalAvatar: {
    marginBottom: spacing(0.5),
  },
  verticalName: {
    textAlign: 'center',
    marginBottom: spacing(0.25),
    width: '100%',
  },
  url: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: spacing(0.25),
  },
});
