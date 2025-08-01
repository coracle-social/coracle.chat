import { spacing } from '@/core/env/Spacing';
import { CloseButton } from '@/lib/components/CloseButton';
import { SlideUpPopup } from '@/lib/components/SlideUpPopup';
import { useSlideUpPopup } from '@/lib/hooks/useSlideUpPopup';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { BareEvent } from '@/lib/types/search';
import { withBorderRadius, withShadow } from '@/lib/utils/styleUtils';
import { Card, Overlay } from '@rneui/themed';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ContentResultActions } from './ContentResultActions';
import { ContentResultBody } from './ContentResultBody';
import { ContentResultHeader } from './ContentResultHeader';
import { ProfilePopup } from './ProfilePopup';
import { ProfileResultActions } from './ProfileResultActions';
import { ProfileResultBody } from './ProfileResultBody';
import { ProfileResultHeader } from './ProfileResultHeader';
import { TrustIndicator } from './TrustIndicator';

interface SearchResultCardProps {
  result: BareEvent;
  onPress?: (result: BareEvent) => void;
  onFollow?: (pubkey: string) => void;
  onShare?: (result: BareEvent) => void;
  onBookmark?: (result: BareEvent) => void;
  showActions?: boolean;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  onFollow,
  onShare,
  onBookmark,
  showActions = true,
}) => {
  const colors = useThemeColors();
  const [showPopup, setShowPopup] = useState(false);
  const [isFollowing, setIsFollowing] = useState(result.isFollowing || false);
  const [localFollowerCount, setLocalFollowerCount] = useState(result.followerCount || 0);
  const { isVisible, message, type, widthRatio, showPopup: showSlidePopup, hidePopup } = useSlideUpPopup();

  const handleCardPress = () => {
    setShowPopup(true);
  };

  const handleComment = () => {
    console.log('[SEARCH-CARD] Comment button pressed');
  };

  // Check if this is a WoT search result
  const isWotResult = result.id?.startsWith('wot-');

  if (result.type === 'profile') {
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

                {/* Trust indicator for WoT results */}
                {isWotResult && (
                  <View style={styles.trustContainer}>
                    <TrustIndicator
                      trustLevel={result.trustLevel || 'low'}
                      networkDistance={result.networkDistance || 0}
                      trustScore={result.wotScore || 0}
                    />
                  </View>
                )}
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

        {showPopup && (
          <ProfilePopup
            isVisible={showPopup}
            onClose={() => setShowPopup(false)}
            result={result}
            isFollowing={isFollowing}
            setIsFollowing={setIsFollowing}
            localFollowerCount={localFollowerCount}
            setLocalFollowerCount={setLocalFollowerCount}
          />
        )}
      </>
    );
  }

  // Content result
  const ContentPopup = () => (
    <Overlay
      isVisible={showPopup}
      onBackdropPress={() => setShowPopup(false)}
      overlayStyle={[styles.overlay, { backgroundColor: colors.surface }]}
    >
      {/* Header */}
      <View style={styles.overlayHeader}>
        <View style={styles.overlayAuthorInfo}>
          <ContentResultHeader result={result} />
        </View>
        <CloseButton onPress={() => setShowPopup(false)} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.overlayContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.overlayContentContainer}
      >
        {/* Isinpopup is necessary, otherwise if on mini posts the overlay won't take full height*/}
        <ContentResultBody result={result} isInPopup={true} />
      </ScrollView>

      {/* Actions in popup */}
      <ContentResultActions
        result={result}
        onComment={handleComment}
        onLoginRequired={showSlidePopup}
      />
    </Overlay>
  );

  return (
    <>
      <Card containerStyle={[styles.card, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={handleCardPress} activeOpacity={0.9}>
          {/* Header */}
          <ContentResultHeader result={result} />

          {/* Body */}
          <View style={styles.contentBody}>
            <ContentResultBody result={result} />
          </View>
        </TouchableOpacity>

        {/* Actions - Outside TouchableOpacity to prevent overlay trigger */}
        <ContentResultActions
          result={result}
          onComment={handleComment}
          onLoginRequired={showSlidePopup}
        />

        {/* SlideUpPopup at card level for proper centering */}
        <SlideUpPopup
          isVisible={isVisible}
          message={message}
          type={type}
          widthRatio={widthRatio}
          onHide={hidePopup}
        />
      </Card>

      <ContentPopup />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    ...withBorderRadius('md'),
    ...withShadow('medium'),
    marginBottom: spacing(2),
    padding: spacing(2),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftSide: {
    flex: 1,
    marginRight: spacing(2),
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  descriptionContainer: {
    marginTop: spacing(1.5),
  },
  trustContainer: {
    marginTop: spacing(1),
  },
  contentBody: {
    marginTop: spacing(1.5),
  },
  overlay: {
    borderRadius: 12,
    padding: 0,
    width: '90%',
    maxHeight: '80%',
    flexDirection: 'column', // Ensure proper flex layout
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing(2),
    flexShrink: 0, // Prevent header from shrinking
  },
  overlayAuthorInfo: {
    flex: 1,
  },

  overlayContent: {
    flex: 1,
    padding: spacing(2),
  },
  overlayContentContainer: {
    flexGrow: 1,
  },
});
