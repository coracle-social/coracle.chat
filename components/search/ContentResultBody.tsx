import { openUrl } from '@/core/commands/urlCommands';
import { spacing } from '@/core/env/Spacing';
import HStack from '@/lib/components/HStack';
import { useImageSizing } from '@/lib/hooks/useImageSizing';
import { useUserPreferences } from '@/lib/hooks/useUserPreferences';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { BareEvent } from '@/lib/types/search';
import { extractNostrEntities } from '@/lib/utils/contentEntityRenderer';
import { extractTitle, parseContent } from '@/lib/utils/contentParser';
import { ImageSizingPresets } from '@/lib/utils/imageHandling';

import { ExternalLink } from '@/lib/components/ExternalLink';
import { sortBy } from '@welshman/lib';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ContentMini } from './ContentMini';
import { ContentWarning } from './ContentWarning';
import { Hashtag } from './Hashtag';
import { MediaContent } from './MediaContent';
import { ProfileMini } from './ProfileMini';

interface ContentResultBodyProps {
  result: BareEvent;
  isInPopup?: boolean;
  contentTitle?: string;
  isTextOnly?: boolean;
  isImagesOnly?: boolean;
}

export const ContentResultBody: React.FC<ContentResultBodyProps> = ({
  result,
  isInPopup = false,
  contentTitle,
  isTextOnly = false,
  isImagesOnly = false,
}) => {
  const colors = useThemeColors();
  const { currentStrategy } = useImageSizing();
  const { postLength, hideSensitiveContent } = useUserPreferences();

  // Extract content from event
  const content = result.event.content || '';
  const contentText = typeof content === 'string' ? content : '';

  // Parse content to extract media and website URLs
  const parsedContent = parseContent(contentText)

  const { profiles, events, hashtags, urls } = extractNostrEntities(
    contentText,
    result.event.tags || [],
    result.authorPubkey
  );

  const renderContentWithEntities = (text: string) => {
    if (!text) return null;

    if (profiles.length === 0 && events.length === 0 && hashtags.length === 0 && urls.length === 0) {
      return (
        <Text style={[styles.description, { color: colors.text }]}>
          {text}
        </Text>
      );
    }

    const renderTextWithEntities = () => {
      let processedText = text;
      const elements: React.ReactNode[] = [];
      let elementIndex = 0;

      // Combine all entities (profiles, events, hashtags, URLs) and sort by position
      const allEntities = sortBy(
        (entity) => processedText.indexOf(entity.raw),
        [
          ...profiles.map(profile => ({ ...profile, type: 'profile' as const })),
          ...events.map(event => ({ ...event, type: 'event' as const })),
          ...hashtags.map(hashtag => ({ raw: hashtag, type: 'hashtag' as const })),
          ...urls.map(url => ({ raw: url, type: 'url' as const }))
        ]
      );


      allEntities.forEach(entity => {
        const index = processedText.indexOf(entity.raw);
        if (index !== -1) {
          // Add text before the entity
          if (index > 0) {
            elements.push(
              <Text key={`text-${elementIndex++}`} style={[styles.description, { color: colors.text }]}>
                {processedText.substring(0, index)}
              </Text>
            );
          }

          // Add the entity
          if (entity.type === 'profile' && entity.pubkey) {
            elements.push(
              <ProfileMini
                key={`profile-${elementIndex++}`}
                pubkey={entity.pubkey}
                relays={entity.relays}
                raw={entity.raw}
              />
            );
          } else if (entity.type === 'event' && entity.id) {
            elements.push(
              <ContentMini
                key={`event-${elementIndex++}`}
                eventId={entity.id}
                relays={entity.relays}
                raw={entity.raw}
              />
            );
          } else if (entity.type === 'hashtag') {
            elements.push(
              <Hashtag key={`hashtag-${elementIndex++}`} hashtag={entity.raw} />
            );
          } else if (entity.type === 'url') {
            const domain = entity.raw.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            elements.push(
              <ExternalLink
                key={`url-${elementIndex++}`}
                href={entity.raw}
                style={{ color: colors.primary, fontSize: 14, fontWeight: '500', textDecorationLine: 'underline' }}
              >
                {domain} →
              </ExternalLink>
            );
          }

          processedText = processedText.substring(index + entity.raw.length);
        }
      });

      // Add remaining text
      if (processedText.length > 0) {
        elements.push(
          <Text key={`text-${elementIndex++}`} style={[styles.description, { color: colors.text }]}>
            {processedText}
          </Text>
        );
      }

      return elements;
    };

    return renderTextWithEntities();
  };

  const shouldUseHorizontalLayout = () => {
    // Check if current strategy supports horizontal layout
    // Allow more strategies to use horizontal layout, not just thumbnail and medium
    const supportsHorizontalLayout =
      currentStrategy === ImageSizingPresets.exact.thumbnail ||
      currentStrategy === ImageSizingPresets.exact.medium ||
      currentStrategy === ImageSizingPresets.exact.large ||
      currentStrategy === ImageSizingPresets.aspectRatio.square ||
      currentStrategy === ImageSizingPresets.aspectRatio.landscape ||
      currentStrategy === ImageSizingPresets.aspectRatio.portrait ||
      currentStrategy === ImageSizingPresets.aspectRatio.original;

    return supportsHorizontalLayout;
  };

  const useHorizontalLayout = shouldUseHorizontalLayout();

  // Determine if we should limit content height based on post length mode
  const shouldLimitHeight = postLength === 'mini' && !isInPopup;
  const maxContentHeight = shouldLimitHeight ? 200 : undefined; // 200px max height for mini mode

  const renderContent = () => {
    if (useHorizontalLayout && !isTextOnly && !isImagesOnly) {
      // Horizontal layout: text on left, image on right using HStack
      return (
        <HStack
          spacing={spacing(3)}
          alignment="start"
          distribution="space-between"
        >
          <View style={styles.textContainer}>
            {/* Show description if there's additional content beyond the extracted title */}
            {typeof parsedContent.text === 'string' &&
                parsedContent.text.trim() !== '' &&
                parsedContent.text.trim() !== (contentTitle || extractTitle(contentText)) &&
                parsedContent.text.length > (contentTitle || extractTitle(contentText)).length && (
                    <View style={styles.textWrapper}>
                      {renderContentWithEntities(parsedContent.text)}
                    </View>
                )}
          </View>

          <View style={styles.imageContainer}>
            <MediaContent
              mediaUrls={parsedContent.mediaUrls}
              websiteUrls={parsedContent.websiteUrls}
              onMediaPress={(url) => openUrl(url)}
              isInPopup={isInPopup}
            />
          </View>
        </HStack>
      );
    } else {
      // Vertical layout: text on top, media below
      return (
        <>
          {/* Only show text content if not images-only mode */}
          {!isImagesOnly && typeof parsedContent.text === 'string' &&
              parsedContent.text.trim() !== '' &&
              parsedContent.text.trim() !== (contentTitle || extractTitle(contentText)) &&
              parsedContent.text.length > (contentTitle || extractTitle(contentText)).length && (
                  <View style={styles.textWrapper}>
                    {renderContentWithEntities(parsedContent.text)}
                  </View>
              )}

          {/* Only show media content if not text-only mode */}
          {!isTextOnly && (
            <MediaContent
              mediaUrls={parsedContent.mediaUrls}
              websiteUrls={parsedContent.websiteUrls}
              onMediaPress={(url) => openUrl(url)}
              isInPopup={isInPopup}
            />
          )}
        </>
      );
    }
  };

  return (
    <ContentWarning
      tags={result.event.tags || []}
      hideSensitiveContent={hideSensitiveContent}
    >
      <View style={styles.container}>
        {shouldLimitHeight ? (
          <ScrollView
            style={[styles.scrollableContainer, { maxHeight: maxContentHeight }]}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
        ) : (
          renderContent()
        )}
      </View>
    </ContentWarning>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugButton: {
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3),
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  debugButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollableContainer: {
    // Styles for scrollable content container
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    minWidth: 0, // Allow text to shrink below content size
  },
  imageContainer: {
    flexShrink: 0,
    minWidth: 0, // Allow images to shrink if needed
  },
  textWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: spacing(2), // Ensure spacing before actions
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
    marginBottom: spacing(1), // Reduced from spacing(2) since textWrapper has marginBottom
    flexShrink: 1,
    minWidth: 0,
  },

});
