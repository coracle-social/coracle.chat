import { ComponentStyles } from '@/core/env/ComponentStyles';
import { LayoutPresets } from '@/core/env/LayoutPresets';
import { spacing } from '@/core/env/Spacing';
import { CloseButton } from '@/lib/components/CloseButton';
import VStack from '@/lib/components/VStack';
import { useImageSizing } from '@/lib/hooks/useImageSizing';
import { useUserPreferences } from '@/lib/hooks/useUserPreferences';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { isVideoUrl } from '@/lib/utils/contentParser';
import {
  calculateImageSize,
  getGridSizingConfig,
  getResizeMode,
  ImageSizingConfig,
  ImageSizingPresets
} from '@/lib/utils/imageHandling';
import { withBorderRadius, withShadow } from '@/lib/utils/styleUtils';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Separate ImageModal component to prevent re-render issues
const ImageModal = React.memo(({
  selectedImage,
  onClose
}: {
  selectedImage: string | null;
  onClose: () => void;
}) => {
  if (!selectedImage) return null;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalHeader}>
          <CloseButton
            onPress={onClose}
            position="absolute"
            size="medium"
          />
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullSizeImage}
            resizeMode="contain"
          />
        </ScrollView>
      </View>
    </Modal>
  );
});

interface MediaContentProps {
  mediaUrls: string[];
  websiteUrls: string[];
  onMediaPress?: (url: string) => void;
  sizingStrategy?: ImageSizingConfig | 'auto' | 'grid' | 'responsive' | 'aspect-ratio' | 'global' | 'no-images';
  containerWidth?: number;
  containerHeight?: number;
  isInPopup?: boolean;
}

export const MediaContent: React.FC<MediaContentProps> = ({
  mediaUrls,
  websiteUrls,
  onMediaPress,
  sizingStrategy = 'global',
  containerWidth,
  containerHeight,
  isInPopup = false,
}) => {
  const colors = useThemeColors();
  const { currentStrategy } = useImageSizing();
  const { urlPreviews } = useUserPreferences();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const [imageDimensions, setImageDimensions] = useState<Map<string, { width: number; height: number }>>(new Map());
  const [showAllLinks, setShowAllLinks] = useState(false);

  // Safety check for undefined arrays
  const safeMediaUrls = mediaUrls || [];
  const safeWebsiteUrls = websiteUrls || [];

  // Determine link limits based on platform and context
  const getLinkLimit = () => {
    if (isInPopup) return Infinity; // No limit in popup since it's scrollable
    if (Platform.OS === 'web') return 4; // Max 4 on web
    return 2; // Max 2 on mobile
  };

  const linkLimit = getLinkLimit();
  const limitedWebsiteUrls = safeWebsiteUrls.slice(0, linkLimit);

  const handleImagePress = (url: string) => {
    setSelectedImage(url);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };



  const handleImageError = (url: string) => {
    setImageLoadErrors(prev => new Set(prev).add(url));
  };

  const handleImageLoad = (url: string, event: any) => {
    const { width, height } = event.nativeEvent;
    setImageDimensions(prev => new Map(prev).set(url, { width, height }));
  };

  const getSizingConfig = (): ImageSizingConfig | 'no-images' => {
    if (typeof sizingStrategy === 'string') {
      switch (sizingStrategy) {
        case 'global':
          return currentStrategy;
        case 'no-images':
          return 'no-images';
        case 'auto':
          return getGridSizingConfig(safeMediaUrls.length);
        case 'grid':
          return getGridSizingConfig(safeMediaUrls.length);
        case 'responsive':
          return ImageSizingPresets.responsive.mobile;
        case 'aspect-ratio':
          return ImageSizingPresets.aspectRatio.original;
        default:
          return currentStrategy;
      }
    }
    return sizingStrategy;
  };

  const renderCompactUrl = (url: string, index: number) => {
    const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const isVideo = isVideoUrl(url);

    return (
      <TouchableOpacity
        key={`compact-url-${index}`}
        style={[styles.compactUrlPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setSelectedImage(url)}
        activeOpacity={0.8}
      >
        <View style={styles.compactUrlIcon}>
          <Text style={[styles.compactUrlIconText, { color: colors.primary }]}>
            {isVideo ? '🎥' : '🖼️'}
          </Text>
        </View>
        <Text style={[styles.compactUrlDomain, { color: colors.text }]} numberOfLines={1}>
          {domain}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderWebsitePreview = (url: string, index: number) => {
    const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const isMedia = isVideoUrl(url) || /\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|mkv)$/i.test(url);

    return (
      <TouchableOpacity
        key={`website-${index}`}
        style={[styles.websitePreview, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => isMedia ? setSelectedImage(url) : onMediaPress?.(url)}
        activeOpacity={0.8}
      >
        <View style={styles.websiteIcon}>
          <Text style={[styles.websiteIconText, { color: colors.primary }]}>
            {isMedia ? (isVideoUrl(url) ? '🎥' : '🖼️') : '🌐'}
          </Text>
        </View>
        <View style={styles.websiteInfo}>
          <Text style={[styles.websiteDomain, { color: colors.text }]} numberOfLines={1}>
            {domain}
          </Text>
          <Text style={[styles.websiteUrl, { color: colors.placeholder }]} numberOfLines={1}>
            {url}
          </Text>
        </View>
        <View style={styles.websiteArrow}>
          <Text style={[styles.arrowIcon, { color: colors.placeholder }]}>→</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderImage = (url: string, index: number, totalImages: number) => {
    if (imageLoadErrors.has(url)) {
      return null;
    }

    const sizingConfig = getSizingConfig();

    // If no-images mode is active, render compact URL only
    if (sizingConfig === 'no-images') {
      return renderCompactUrl(url, index);
    }

    const imageDim = imageDimensions.get(url);

    // Get the actual container width from the parent component or use screen width as fallback
    const actualContainerWidth = containerWidth || Dimensions.get('window').width - spacing(4) * 2; // Account for card padding

    const calculatedSize = calculateImageSize(
      sizingConfig as ImageSizingConfig,
      actualContainerWidth,
      containerHeight,
      imageDim?.width,
      imageDim?.height
    );

    // Ensure the calculated size doesn't exceed container bounds
    const constrainedWidth = Math.min(calculatedSize.width, actualContainerWidth);
    const constrainedHeight = calculatedSize.height;

    const resizeMode = getResizeMode(sizingConfig as ImageSizingConfig);

    return (
      <TouchableOpacity
        key={`${url}-${index}`}
        style={[
          styles.imageContainer,
          {
            width: constrainedWidth,
            height: constrainedHeight,
            borderRadius: 12,
          }
        ]}
        onPress={() => handleImagePress(url)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: url }}
          style={[
            styles.image,
            {
              width: constrainedWidth,
              height: constrainedHeight,
              borderRadius: 12,
            }
          ]}
          resizeMode={resizeMode}
          onError={() => handleImageError(url)}
          onLoad={(event) => handleImageLoad(url, event)}
        />
        {isVideoUrl(url) && (
          <View style={styles.videoOverlay}>
            <Text style={styles.playIcon}>▶️</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (safeMediaUrls.length === 0 && safeWebsiteUrls.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
      {/* Media Grid */}
      {safeMediaUrls.length > 0 && (
        <View style={styles.mediaGrid}>
          {getSizingConfig() === 'no-images' ? (
            // 4-column grid for no-images mode
            <FlatList
              data={safeMediaUrls}
              renderItem={({ item, index }) => (
                <View key={`compact-url-${index}`} style={styles.compactUrlGridItem}>
                  {renderCompactUrl(item, index)}
                </View>
              )}
              keyExtractor={(item, index) => `compact-url-${index}`}
              numColumns={4}
              contentContainerStyle={styles.compactUrlGrid}
              scrollEnabled={false}
            />
          ) : (
            // Regular image grid for other modes
            safeMediaUrls.map((url, index) => renderImage(url, index, safeMediaUrls.length))
          )}
        </View>
      )}

      {/* Website Previews - Show All Links Button for Popup */}
      {isInPopup && safeWebsiteUrls.length > 0 && urlPreviews === 'enabled' && (
        <View style={styles.websiteContainer}>
          {!showAllLinks ? (
            // Show up to 4 links with "more" indicator
            <>
              <View style={styles.websiteGridRegular}>
                {safeWebsiteUrls.slice(0, 4).map((url, index) => (
                  <View key={`website-${index}`} style={styles.websiteGridItem}>
                    {renderWebsitePreview(url, index)}
                  </View>
                ))}
              </View>
              {safeWebsiteUrls.length > 4 && (
                <TouchableOpacity
                  style={styles.moreLinksButton}
                  onPress={() => setShowAllLinks(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.moreLinksText, { color: colors.primary }]}>
                    +{safeWebsiteUrls.length - 4} more links
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            // Show all links in grid
            <FlatList
              data={safeWebsiteUrls}
              renderItem={({ item, index }) => (
                <View key={`website-${index}`} style={styles.websiteGridItem}>
                  {renderWebsitePreview(item, index)}
                </View>
              )}
              keyExtractor={(item, index) => `website-${index}`}
              numColumns={4}
              contentContainerStyle={styles.websiteGrid}
              scrollEnabled={false} // Disable scrolling for the grid
            />
          )}
        </View>
      )}

      {/* Website Previews - Limited Grid for Regular Context */}
      {!isInPopup && limitedWebsiteUrls.length > 0 && urlPreviews === 'enabled' && (
        <View style={styles.websiteContainer}>
          {Platform.OS === 'web' && limitedWebsiteUrls.length > 0 ? (
            // Two-column grid on web
            <View style={styles.websiteGridRegular}>
              {limitedWebsiteUrls.map((url, index) => (
                <View key={`website-${index}`} style={styles.websiteGridItem}>
                  {renderWebsitePreview(url, index)}
                </View>
              ))}
            </View>
          ) : (
            // Single column on mobile or when 2 or fewer items
            <VStack spacing={spacing(2)}>
              {limitedWebsiteUrls.map((url, index) => renderWebsitePreview(url, index))}
            </VStack>
          )}

          {/* Show "more" indicator if there are additional links */}
          {safeWebsiteUrls.length > linkLimit && (
            <Text style={[styles.moreLinksText, { color: colors.placeholder }]}>
              +{safeWebsiteUrls.length - linkLimit} more links
            </Text>
          )}
        </View>
      )}

      {/* Image Modal */}
      <ImageModal
        selectedImage={selectedImage}
        onClose={handleCloseModal}
      />
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing(3),
    marginBottom: spacing(1), // Add bottom margin to prevent overlap
  },
  mediaGrid: {
    ...LayoutPresets.row,
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing(2),
    marginBottom: spacing(3),
    maxWidth: '100%',
    overflow: 'hidden',
  },
  imageContainer: {
    ...ComponentStyles.imageContainer,
    maxWidth: '100%', // Prevent images from exceeding container width
  },
  image: {
    width: '100%',
    height: '100%',
    ...withBorderRadius('md'),
  },
  videoOverlay: {
    ...LayoutPresets.absoluteCenter,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playIcon: {
    fontSize: 24,
  },
  websiteContainer: {
    gap: spacing(2),
  },
  websiteGrid: {
    paddingHorizontal: spacing(1), // Add some padding for the grid
  },
  websiteGridRegular: {
    ...LayoutPresets.row,
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing(2),
    marginBottom: spacing(3),
    maxWidth: '100%',
    overflow: 'hidden',
  },
  websiteGridItem: {
    flex: 1,
    margin: spacing(1), // Use margin instead of gap for FlatList
    maxWidth: '25%', // This ensures 2 columns with FlatList numColumns=2
  },
  websitePreview: {
    ...ComponentStyles.websitePreview,
    maxWidth: '100%',
    overflow: 'hidden',
    minHeight: 80,
  },
  websiteIcon: {
    width: 40,
    height: 40,
    ...withBorderRadius('round'),
    backgroundColor: 'rgba(0,0,0,0.05)',
    ...LayoutPresets.center,
    marginRight: spacing(3),
    flexShrink: 0,
  },
  websiteIconText: {
    fontSize: 18,
  },
  websiteInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  websiteDomain: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  websiteUrl: {
    fontSize: 13,
  },
  websiteArrow: {
    marginLeft: spacing(2),
    flexShrink: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalHeader: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },

  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    flexGrow: 1,
    ...LayoutPresets.center,
    padding: spacing(3),
  },
  fullSizeImage: {
    width: '100%',
    height: '100%',
    maxWidth: 600,
    maxHeight: 600,
  },
  urlPreview: {
    ...LayoutPresets.row,
    padding: spacing(3),
    ...withBorderRadius('md'),
    borderWidth: 1,
    ...withShadow('small'),
    marginBottom: spacing(2),
    maxWidth: '100%',
    overflow: 'hidden',
    height: 80, // Fixed height for consistent sizing
    minHeight: 80, // Ensure minimum height
  },
  urlIcon: {
    width: 40,
    height: 40,
    ...withBorderRadius('round'),
    backgroundColor: 'rgba(0,0,0,0.05)',
    ...LayoutPresets.center,
    marginRight: spacing(3),
    flexShrink: 0,
  },
  urlIconText: {
    fontSize: 18,
  },
  urlInfo: {
    flex: 1,
    minWidth: 0, // Allow text to shrink below content size
    justifyContent: 'center', // Center content vertically
  },
  urlDomain: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  urlText: {
    fontSize: 13,
  },
  urlArrow: {
    marginLeft: spacing(2),
    flexShrink: 0,
  },
  arrowIcon: {
    fontSize: 18,
  },
  moreLinksText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing(1),
  },
  compactUrlPreview: {
    ...LayoutPresets.row,
    paddingVertical: spacing(0.5),
    paddingHorizontal: spacing(1),
    ...withBorderRadius('xs'),
    borderWidth: 1,
    ...withShadow('small'),
    maxWidth: '100%',
    overflow: 'hidden',
    minHeight: 28,
  },
  compactUrlIcon: {
    width: 20,
    height: 20,
    ...withBorderRadius('round'),
    backgroundColor: 'rgba(0,0,0,0.05)',
    ...LayoutPresets.center,
    marginRight: spacing(1),
    flexShrink: 0,
  },
  compactUrlIconText: {
    fontSize: 12,
  },
  compactUrlDomain: {
    fontSize: 11,
    fontWeight: '500',
  },
  compactUrlGrid: {
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(1),
  },
  compactUrlGridItem: {
    flex: 1,
    margin: spacing(1),
    maxWidth: '25%', // 4 columns
  },
  moreLinksButton: {
    alignSelf: 'center',
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(3),
    ...withBorderRadius('md'),
    borderWidth: 1,
    borderColor: 'transparent',
    ...withShadow('medium'),
    maxWidth: '100%',
    overflow: 'hidden',
    minHeight: 40,
  },
});
