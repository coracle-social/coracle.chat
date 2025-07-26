import { SlideUpPopup } from '@/components/generalUI/SlideUpPopup';
import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import { useSlideUpPopup } from '@/lib/hooks/useSlideUpPopup';
import { useTheme } from '@/lib/theme/ThemeContext';
import { SearchResult } from '@/lib/types/search';
import { Card } from '@rneui/themed';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ProfilePopup } from './ProfilePopup';
import { ProfileResultActions } from './ProfileResultActions';
import { ProfileResultBody } from './ProfileResultBody';
import { ProfileResultHeader } from './ProfileResultHeader';

interface ProfileResultCardProps {
  result: SearchResult;
  onPress?: (result: SearchResult) => void;
  onFollow?: (pubkey: string) => void;
  onShare?: (result: SearchResult) => void;
  showActions?: boolean;
}

export const ProfileResultCard: React.FC<ProfileResultCardProps> = ({
  result,
  onFollow,
  onShare,
  showActions = true,
}) => {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];
  const [showPopup, setShowPopup] = useState(false);
  const [isFollowing, setIsFollowing] = useState(result.metadata.isFollowing || false);
  const [localFollowerCount, setLocalFollowerCount] = useState(result.metadata.followerCount || 0);
  const { isVisible, message, type, widthRatio, showPopup: showSlidePopup, hidePopup } = useSlideUpPopup();

  const handleCardPress = () => {
    setShowPopup(true);
  };

  return (
    <>
      <Card containerStyle={[styles.card, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={handleCardPress} activeOpacity={0.9}>
          <View style={styles.container}>
            {/* Left side - Profile image and basic info */}
            <View style={styles.leftSide}>
              <ProfileResultHeader
                result={result}
                localFollowerCount={localFollowerCount}
              />
            </View>

            {/* Right side - Actions */}
            <View style={styles.rightSide}>
              <ProfileResultActions
                result={result}
                onFollow={onFollow}
                onShare={onShare}
                showActions={showActions}
                isFollowing={isFollowing}
                setIsFollowing={setIsFollowing}
                localFollowerCount={localFollowerCount}
                setLocalFollowerCount={setLocalFollowerCount}
                onLoginRequired={showSlidePopup}
              />
            </View>
          </View>

          {/* Description - Full width below */}
          <View style={styles.descriptionContainer}>
            <ProfileResultBody
              result={result}
              isScrollable={true}
              maxHeight={80}
            />
          </View>
        </TouchableOpacity>

        {/* SlideUpPopup at card level for proper centering */}
        <SlideUpPopup
          isVisible={isVisible}
          message={message}
          type={type}
          widthRatio={widthRatio}
          onHide={hidePopup}
        />
      </Card>

      <ProfilePopup
        isVisible={showPopup}
        onClose={() => setShowPopup(false)}
        result={result}
        onFollow={onFollow}
        onShare={onShare}
        isFollowing={isFollowing}
        setIsFollowing={setIsFollowing}
        localFollowerCount={localFollowerCount}
        setLocalFollowerCount={setLocalFollowerCount}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing(2),
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing(2),
  },
  leftSide: {
    flex: 1,
    marginRight: spacing(2),
  },
  rightSide: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minWidth: 100,
  },
  descriptionContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: spacing(2),
  },
});
