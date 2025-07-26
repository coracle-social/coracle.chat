import Colors from '@/core/env/Colors';
import { PUBLIC_RELAYS } from '@/core/env/MetaConfig';
import { spacing } from '@/core/env/Spacing';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { SearchResult } from '@/lib/types/search';
import { getProfileData } from '@/lib/utils/profileLoadingUtility';
import { Avatar } from '@rneui/themed';
import { load } from '@welshman/net';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ProfilePopup } from './ProfilePopup';

interface ProfileMiniProps {
  pubkey: string;
  relays?: string[];
  raw: string;
  onProfilePress?: (profile: SearchResult) => void;
}

export const ProfileMini: React.FC<ProfileMiniProps> = ({
  pubkey,
  relays = [],
  raw,
  onProfilePress,
}) => {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const [profileData, setProfileData] = useState<SearchResult | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [localFollowerCount, setLocalFollowerCount] = useState(0);
  const fetchedPubkeyRef = useRef<string | null>(null);

  useEffect(() => {
    // Only fetch if we haven't already fetched data for this pubkey
    if (fetchedPubkeyRef.current === pubkey) {
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        fetchedPubkeyRef.current = pubkey;

        const presetPublicRelays = PUBLIC_RELAYS.slice(0, 4); // Limit to 4 relays to prevent hanging

        const validRelays = relays.filter(relay =>
          relay &&
          (relay.startsWith('wss://') || relay.startsWith('ws://')) &&
          !relay.includes('nostr-idb://')
        );

        const allRelays = [...new Set([...validRelays, ...presetPublicRelays])];
        const relayUrls = allRelays.slice(0, 6); // Limit total relays to 6

        console.log(`[PROFILE-MINI] Loading profile for pubkey: ${pubkey.substring(0, 8)}...`);
        console.log(`[PROFILE-MINI] Original relays:`, relays);
        console.log(`[PROFILE-MINI] Valid relays:`, validRelays);
        console.log(`[PROFILE-MINI] Final relays:`, relayUrls);
        console.log(`[PROFILE-MINI] Total unique relays: ${relayUrls.length}`);

                // Load profile data with timeout
        const profileEvent = await Promise.race([
          load({
            relays: relayUrls,
            filters: [{ kinds: [0], authors: [pubkey] }],
          }) as Promise<any[]>,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Profile load timeout')), 5000)
          )
        ]);

        if (profileEvent && profileEvent.length > 0) {
          const event = profileEvent[0];
          const profile = JSON.parse(event.content || '{}');

          const profileDataResult = await getProfileData(event.pubkey, profile);

          // Create SearchResult format - use the requested pubkey, not the event pubkey
          const searchResult: SearchResult = {
            id: event.id,
            type: 'profile',
            title: profile.name || profile.display_name || 'Anonymous', // Add missing title property
            event: {
              id: event.id,
              pubkey: pubkey, // Use the requested pubkey, not event.pubkey
              created_at: event.created_at,
              kind: event.kind,
              tags: event.tags,
              content: event.content,
              sig: event.sig,
              // Profile fields
              name: profile.name || '',
              display_name: profile.display_name || '',
              picture: profile.picture || '',
              about: profile.about || '',
              website: profile.website || '',
              lud06: profile.lud06 || '',
              lud16: profile.lud16 || '',
              nip05: profile.nip05 || '',
              // Banner image fields
              banner: profile.banner || '',
              cover_image: profile.cover_image || '',
              cover: profile.cover || '',
              header_image: profile.header_image || '',
            },
            metadata: {
              authorPubkey: pubkey, // Use the requested pubkey
              author: profile.name || profile.display_name || 'Anonymous',
              timestamp: event.created_at, // Creation timestamp
              verified: profileDataResult.verification.isVerified,
              trustScore: profileDataResult.verification.verificationScore,
              followerCount: profileDataResult.followerCount,
              followingCount: profileDataResult.followingCount,
              isFollowing: profileDataResult.isUserFollowing,
            },
            description: profile.about || '',
            imageUrl: profile.picture || '',
          };

          // Initialize local state with profile data
          setIsFollowing(profileDataResult.isUserFollowing);
          setLocalFollowerCount(profileDataResult.followerCount);

          setProfileData(searchResult);

          // Update with recent activity when available
          if (profileDataResult.recentActivityTimestamp) {
            setProfileData(prev => prev ? {
              ...prev,
              metadata: {
                ...prev.metadata,
                recentActivityTimestamp: profileDataResult.recentActivityTimestamp ?? undefined
              }
            } : null);
          }
        }
      } catch (error) {
        console.error('[PROFILE-MINI] Failed to fetch profile:', error);
        // Reset the ref so we can retry if needed
        fetchedPubkeyRef.current = null;
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();

    // Cleanup function to reset ref when pubkey changes
    return () => {
      if (fetchedPubkeyRef.current !== pubkey) {
        fetchedPubkeyRef.current = null;
      }
    };
  }, [pubkey, relays]);

  const handlePress = () => {
    if (profileData) {
      if (onProfilePress) {
        onProfilePress(profileData);
      } else {
        setShowPopup(true);
      }
    }
  };

  if (isLoading && !profileData) {
    return (
      <TouchableOpacity style={styles.container} disabled>
        <Avatar
          size="small"
          rounded
          title="..."
          containerStyle={[styles.avatar, { backgroundColor: colors.surfaceVariant }]}
          titleStyle={{ color: colors.placeholder, fontSize: 12 }}
        />
        <Text style={[styles.name, { color: colors.placeholder }]}>
          Loading...
        </Text>
      </TouchableOpacity>
    );
  }

  if (!profileData) {
    return (
      <TouchableOpacity style={styles.container} disabled>
        <Avatar
          size="small"
          rounded
          title={pubkey.charAt(0).toUpperCase()}
          containerStyle={[styles.avatar, { backgroundColor: colors.primary }]}
          titleStyle={{ color: colors.surface, fontSize: 12 }}
        />
        <Text style={[styles.name, { color: colors.placeholder }]}>
          {pubkey.substring(0, 8)}...
        </Text>
      </TouchableOpacity>
    );
  }

  const displayName = profileData.event.name ||
                     profileData.event.display_name ||
                     profileData.metadata.author ||
                     'Anonymous';

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        {profileData.event.picture ? (
          <Avatar
            size="small"
            rounded
            source={{ uri: profileData.event.picture }}
            containerStyle={styles.avatar}
          />
        ) : (
          <Avatar
            size="small"
            rounded
            title={displayName.charAt(0).toUpperCase()}
            containerStyle={[styles.avatar, { backgroundColor: colors.primary }]}
            titleStyle={{ color: colors.surface, fontSize: 12 }}
          />
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {displayName}
          </Text>
          {profileData.metadata.timestamp && (
            <Text style={[styles.timestamp, { color: colors.placeholder }]}>
              {formatTimestamp(profileData.metadata.timestamp)}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {profileData && (
        <ProfilePopup
          isVisible={showPopup}
          onClose={() => {
            setShowPopup(false);
          }}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: spacing(1),
    marginBottom: spacing(1),
  },
  avatar: {
    marginRight: spacing(2),
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  timestamp: {
    fontSize: 12,
    marginTop: spacing(0.5),
  },
});
