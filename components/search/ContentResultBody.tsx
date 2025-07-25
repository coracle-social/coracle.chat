import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import HStack from '@/lib/components/HStack';
import { useImageSizing } from '@/lib/hooks/useImageSizing';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { SearchResult } from '@/lib/types/search';
import { extractTitle, parseContent } from '@/lib/utils/contentParser';
import { ImageSizingPresets } from '@/lib/utils/imageSizing';
import { parse, ParsedType } from '@welshman/content';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ContentMini } from './ContentMini';
import { MediaContent } from './MediaContent';
import { ProfileMini } from './ProfileMini';

interface ContentResultBodyProps {
  result: SearchResult;
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
  const { isDark } = useTheme();
  const { currentStrategy } = useImageSizing();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  // Extract content from event
  const content = result.event.content || '';
  const contentText = typeof content === 'string' ? content : '';

  // Parse content to extract media and website URLs
  const parsedContent = parseContent(contentText) || {
    text: contentText,
    urls: [],
    mediaUrls: [],
    websiteUrls: [],
    hashtags: []
  };

  // Parse content with Welshman parser to extract profiles and events
  const parsedElements = parse({
    content: contentText,
    tags: result.event.tags || []
  });

  // Extract profiles and events from parsed elements
  const extractNostrEntities = () => {
    const profiles = parsedElements
      .filter(element => element.type === ParsedType.Profile)
      .map(element => ({
        pubkey: (element.value as any).pubkey,
        relays: (element.value as any).relays || [],
        raw: element.raw
      }));

    const events = parsedElements
      .filter(element => element.type === ParsedType.Event)
      .map(element => ({
        id: (element.value as any).id,
        relays: (element.value as any).relays || [],
        raw: element.raw
      }));

    return { profiles, events };
  };

  const { profiles, events } = extractNostrEntities();

  const handleMediaPress = async (url: string) => {
    try {
      if (Platform.OS === 'web') {
        // On web, open in new tab
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // On mobile, open in in-app browser
        await WebBrowser.openBrowserAsync(url);
      }
    } catch (error) {
      console.error('[CONTENT-BODY] Failed to open link:', error);
    }
  };



  const renderContentWithEntities = (text: string) => {
    if (!text) return null;

    if (profiles.length === 0 && events.length === 0) {
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

      profiles.forEach(profile => {
        const index = processedText.indexOf(profile.raw);
        if (index !== -1) {
          // Add text before the profile
          if (index > 0) {
            elements.push(
              <Text key={`text-${elementIndex++}`} style={[styles.description, { color: colors.text }]}>
                {processedText.substring(0, index)}
              </Text>
            );
          }

          elements.push(
            <ProfileMini
              key={`profile-${elementIndex++}`}
              pubkey={profile.pubkey}
              relays={profile.relays}
              raw={profile.raw}
            />
          );

          processedText = processedText.substring(index + profile.raw.length);
        }
      });

      events.forEach(event => {
        const index = processedText.indexOf(event.raw);
        if (index !== -1) {
          // Add text before the event
          if (index > 0) {
            elements.push(
              <Text key={`text-${elementIndex++}`} style={[styles.description, { color: colors.text }]}>
                {processedText.substring(0, index)}
              </Text>
            );
          }

          // Add the event entity using ContentMini
          elements.push(
            <ContentMini
              key={`event-${elementIndex++}`}
              eventId={event.id}
              relays={event.relays}
              raw={event.raw}
            />
          );

          // Update processed text to remove the processed part
          processedText = processedText.substring(index + event.raw.length);
        }
      });

      // Add any remaining text
      if (processedText.length > 0) {
        elements.push(
          <Text key={`text-${elementIndex++}`} style={[styles.description, { color: colors.text }]}>
            {processedText}
          </Text>
        );
      }

      // If no elements were created, return original text
      if (elements.length === 0) {
        return (
          <Text style={[styles.description, { color: colors.text }]}>
            {text}
          </Text>
        );
      }

      return elements;
    };

    return renderTextWithEntities();
  };

  const shouldUseHorizontalLayout = () => {
    if (parsedContent.mediaUrls.length !== 2 || parsedContent.websiteUrls.length > 0) {
      return false;
    }

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

  return (
    <View style={styles.container}>
      {useHorizontalLayout && !isTextOnly && !isImagesOnly ? (
        // Horizontal layout: text on left, image on right using HStack
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
              onMediaPress={handleMediaPress}
              isInPopup={isInPopup}
            />
          </View>
        </HStack>
      ) : (
        // Vertical layout: text on top, media below
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
              onMediaPress={handleMediaPress}
              isInPopup={isInPopup}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing(3),
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
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
    marginBottom: spacing(2),
  },

});
