import { useShimmerConfig } from '@/core/env/ShimmerConfig';
import { spacing } from '@/core/env/Spacing';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { BareEvent } from '@/lib/types/search';
import { Avatar } from '@rneui/themed';
import { deriveProfile } from '@welshman/app';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { ProfilePopup } from './ProfilePopup';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

interface ProfileMiniProps {
  pubkey: string;
  relays?: string[];
  raw: string;
  onProfilePress?: (profile: BareEvent) => void;
  inline?: boolean;
}

export const ProfileMini: React.FC<ProfileMiniProps> = ({
  pubkey,
  relays = [],
  raw,
  onProfilePress,
  inline = false,
}) => {
  const colors = useThemeColors();
  const shimmerConfig = useShimmerConfig();

  // Direct store access - much simpler
  const profileStore = deriveProfile(pubkey, relays);
  const [profile] = useStore(profileStore);

  // Convert store profile to BareEvent format
  const profileData = profile ? {
    id: `profile-${pubkey}`,
    type: 'profile',
    event: profile,
    authorPubkey: pubkey,
  } as BareEvent : undefined;

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

  const renderAvatar = () => {
    if (isLoading) {
      return (
        <ShimmerPlaceholder
          visible={false}
          width={inline ? 24 : 32}
          height={inline ? 24 : 32}
          style={[
            styles.avatar,
            inline && styles.inlineAvatar,
            { borderRadius: inline ? 12 : 16 }
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

    return (
      <Avatar
        size={inline ? 'small' : 'small'}
        rounded
        source={profileData?.event.picture ? { uri: profileData.event.picture } : undefined}
        title={displayName.charAt(0).toUpperCase()}
        containerStyle={[
          styles.avatar,
          { backgroundColor: colors.primary },
          inline && styles.inlineAvatar,
        ]}
        titleStyle={{ color: colors.surface, fontSize: inline ? 10 : 12 }}
      />
    );
  };

  const renderName = () => {
    if (isLoading) {
      return (
        <ShimmerPlaceholder
          visible={false}
          width={inline ? 80 : 120}
          height={inline ? 12 : 14}
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
        style={[styles.name, inline && styles.inlineName, { color: colors.text }]}
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

  return (
    <>
      <View
        style={[
          styles.container,
          inline && styles.inlineContainer,
          { backgroundColor: 'transparent' },
        ]}
      >
        <Pressable
          onPress={handlePress}
          android_ripple={{ color: colors.surfaceVariant }}
        >
          {renderAvatar()}
          {renderName()}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(1),
    borderRadius: spacing(2),
  },
  inlineContainer: {
    paddingVertical: spacing(0.25),
    paddingHorizontal: spacing(0.5),
    borderRadius: spacing(1),
  },
  avatar: {
    marginRight: spacing(1),
  },
  inlineAvatar: {
    marginRight: spacing(0.5),
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
});
