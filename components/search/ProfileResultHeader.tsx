import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { SearchResult } from '@/lib/types/search';
import { Avatar, Icon } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProfileResultHeaderProps {
  result: SearchResult;
  localFollowerCount?: number;
}

export const ProfileResultHeader: React.FC<ProfileResultHeaderProps> = ({
  result,
  localFollowerCount,
}) => {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  // Extract data from event
  const profile = result.event;
  const title = profile.name || profile.display_name || 'Anonymous';

  // Determine subtitle: website takes priority over handle
  const website = profile.website || profile.lud06 || profile.lud16;
  const handle = profile.nip05;
  const subtitle = website || handle || '';

  const imageUrl = profile.picture;

  const renderAvatar = () => {
    if (imageUrl) {
      return (
        <Avatar
          size="large"
          rounded
          source={{ uri: imageUrl }}
          containerStyle={styles.avatarContainer}
        />
      );
    }

    return (
      <Avatar
        size="large"
        rounded
        title={title.charAt(0).toUpperCase() || 'A'}
        containerStyle={[styles.avatarContainer, { backgroundColor: colors.primary }]}
        titleStyle={{ color: colors.surface, fontWeight: '700', fontSize: 24 }}
      />
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.profileInfo}>
        <View style={styles.avatarSection}>
          {renderAvatar()}
          {result.metadata.verified && (
            <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
              <Icon
                name="checkmark-circle"
                type="ionicon"
                size={16}
                color={colors.surface}
              />
            </View>
          )}
        </View>

        <View style={styles.profileDetails}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            {result.metadata.trustScore && result.metadata.trustScore > 0 && (
              <View style={[styles.trustBadge, { backgroundColor: colors.info }]}>
                <Text style={[styles.trustText, { color: colors.surface }]}>
                  {result.metadata.trustScore}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.handle, { color: colors.placeholder }]} numberOfLines={1}>
            {subtitle}
          </Text>

          {/* Follower/Following stats */}
          <View style={styles.statsContainer}>
            <Text style={[styles.statText, { color: colors.placeholder }]}>
              <Text style={{ fontWeight: '600', color: colors.text }}>
                {localFollowerCount || result.metadata.followerCount || 0}
              </Text> followers
            </Text>
            <Text style={[styles.statText, { color: colors.placeholder }]}>
              <Text style={{ fontWeight: '600', color: colors.text }}>
                {result.metadata.followingCount || 0}
              </Text> following
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarSection: {
    position: 'relative',
    marginRight: spacing(3),
  },
  avatarContainer: {
    marginRight: 0,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    marginBottom: spacing(1),
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  trustBadge: {
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.5),
    borderRadius: 8,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
  },
  handle: {
    fontSize: 15,
    marginBottom: spacing(1),
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing(3),
  },
  statText: {
    fontSize: 13,
    opacity: 0.7,
  },
});
