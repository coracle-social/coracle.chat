import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import { usePostLength } from '@/lib/hooks/usePostLength';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { SearchResult } from '@/lib/types/search';
import { extractTitle, parseContent } from '@/lib/utils/contentParser';
import { Button, Card, Divider, Icon, Overlay } from '@rneui/themed';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ContentResultActions } from './ContentResultActions';
import { ContentResultBody } from './ContentResultBody';
import { ContentResultHeader } from './ContentResultHeader';

interface ContentResultCardProps {
  result: SearchResult;
  onPress?: (result: SearchResult) => void;
  onShare?: (result: SearchResult) => void;
  onBookmark?: (result: SearchResult) => void;
  showActions?: boolean;
}

export const ContentResultCard: React.FC<ContentResultCardProps> = ({
  result,
  onPress,
  onShare,
  onBookmark,
  showActions = true,
}) => {
  // Safety check for undefined result
  if (!result) {
    console.warn('[CONTENT-CARD] ContentResultCard rendered with undefined result');
    return null;
  }

  const { isDark } = useTheme();
  const { currentMode } = usePostLength();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];
  const [showPopup, setShowPopup] = useState(false);

  // Parse content to extract media and website URLs
  const parsedContent = parseContent(result.description || '') || {
    text: result.description || '',
    urls: [],
    mediaUrls: [],
    websiteUrls: [],
    hashtags: []
  };

  // Extract title once and pass to child components
  const contentTitle = extractTitle(result.description || '');

  const handleCardPress = () => {
    setShowPopup(true);
  };

  const ContentPopup = () => (
    <Overlay
      isVisible={showPopup}
      onBackdropPress={() => setShowPopup(false)}
      overlayStyle={[styles.overlay, { backgroundColor: colors.surface }]}
    >
      <View style={styles.overlayHeader}>
        <View style={styles.overlayAuthorInfo}>
          <ContentResultHeader result={result} contentTitle={contentTitle} />
        </View>
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
          onPress={() => setShowPopup(false)}
          buttonStyle={styles.closeButton}
        />
      </View>

      <Divider />

      <ScrollView style={styles.overlayContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.overlayFullContent, { color: colors.text }]}>
          {parsedContent.text}
        </Text>

        {/* Show hashtags if any */}
        {parsedContent.hashtags.length > 0 && (
          <View style={styles.hashtagsContainer}>
            {parsedContent.hashtags.map((tag, index) => (
              <Text key={index} style={[styles.hashtag, { color: colors.primary }]}>
                {tag}
              </Text>
            ))}
          </View>
        )}

        {/* Display media content and website previews in popup */}
        <ContentResultBody result={result} isInPopup={true} contentTitle={contentTitle} />
      </ScrollView>

      <Divider />

      <View style={styles.overlayActions}>
        <ContentResultActions
          result={result}
          onShare={onShare}
          onBookmark={onBookmark}
          showActions={true}
        />
      </View>
    </Overlay>
  );

  return (
    <>
      <Card containerStyle={[styles.card, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={handleCardPress} activeOpacity={0.9}>
          {/* Header */}
          <ContentResultHeader result={result} contentTitle={contentTitle} />

          {/* Content - Limited height with scrollable content */}
          <View style={[
            styles.contentContainer,
            currentMode === 'mini' && styles.contentContainerMini
          ]}>
            <ScrollView
              style={styles.contentScrollView}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              <ContentResultBody result={result} contentTitle={contentTitle} />
            </ScrollView>
          </View>

          {/* Actions */}
          <ContentResultActions
            result={result}
            onShare={onShare}
            onBookmark={onBookmark}
            showActions={showActions}
          />
        </TouchableOpacity>
      </Card>

      <ContentPopup />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing(3),
    borderRadius: 20,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contentContainer: {
    marginBottom: spacing(3),
  },
  contentContainerMini: {
    maxHeight: spacing(25),
  },
  contentScrollView: {
    flex: 1,
  },
  // Overlay styles
  overlay: {
    width: '90%',
    // maxWidth: 500,
    maxHeight: '80%',
    minHeight: '60%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(4),
  },
  overlayAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  overlayContent: {
    padding: spacing(4),
    flex: 1,
  },
  overlayFullContent: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'left',
  },
  overlayActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing(4),
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing(3),
    marginBottom: spacing(2),
  },
  hashtag: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginRight: spacing(2),
    marginBottom: spacing(2),
  },
});
