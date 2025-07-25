import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import VStack from '@/lib/components/VStack';
import { useImageSizing } from '@/lib/hooks/useImageSizing';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { isVideoUrl } from '@/lib/utils/contentParser';
import {
  calculateImageSize,
  getGridSizingConfig,
  getResizeMode,
  ImageSizingConfig,
  ImageSizingPresets
} from '@/lib/utils/imageSizing';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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
  const { isDark } = useTheme();
  const { currentStrategy } = useImageSizing();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const [imageDimensions, setImageDimensions] = useState<Map<string, { width: number; height: number }>>(new Map());

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
    if (onMediaPress) {
      onMediaPress(url);
    } else {
      setSelectedImage(url);
    }
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

  //to be continued
  const renderUrlOnly = (url: string, index: number) => {
    const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const isVideo = isVideoUrl(url);

    return (
      <TouchableOpacity
        key={`url-${index}`}
        style={[styles.urlPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => onMediaPress?.(url)}
        activeOpacity={0.8}
      >
        <View style={styles.urlIcon}>
          <Text style={[styles.urlIconText, { color: colors.primary }]}>
            {isVideo ? '🎥' : '🖼️'}
          </Text>
        </View>
        <View style={styles.urlInfo}>
          <Text style={[styles.urlDomain, { color: colors.text }]} numberOfLines={1}>
            {domain}
          </Text>
          <Text style={[styles.urlText, { color: colors.placeholder }]} numberOfLines={1}>
            {url}
          </Text>
        </View>
        <View style={styles.urlArrow}>
          <Text style={[styles.arrowIcon, { color: colors.placeholder }]}>→</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCompactUrlOnly = (url: string, index: number) => {
    const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const isVideo = isVideoUrl(url);

    return (
      <TouchableOpacity
        key={`compact-url-${index}`}
        style={[styles.compactUrlPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => onMediaPress?.(url)}
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

    return (
      <TouchableOpacity
        key={`website-${index}`}
        style={[styles.websitePreview, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => onMediaPress?.(url)}
        activeOpacity={0.8}
      >
        <View style={styles.websiteIcon}>
          <Text style={[styles.websiteIconText, { color: colors.primary }]}>🌐</Text>
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
      return renderCompactUrlOnly(url, index);
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

  const ImageModal = () => (
    <Modal
      visible={!!selectedImage}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setSelectedImage(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullSizeImage}
              resizeMode="contain"
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  if (safeMediaUrls.length === 0 && safeWebsiteUrls.length === 0) {
    return null;
  }

  return (
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
                  {renderCompactUrlOnly(item, index)}
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

      {/* Website Previews - Unlimited Grid for Popup */}
      {isInPopup && safeWebsiteUrls.length > 0 && (
        <View style={styles.websiteContainer}>
          <FlatList
            data={safeWebsiteUrls}
            renderItem={({ item, index }) => (
              <View key={`website-${index}`} style={styles.websiteGridItem}>
                {renderWebsitePreview(item, index)}
              </View>
            )}
            keyExtractor={(item, index) => `website-${index}`}
            numColumns={6}
            contentContainerStyle={styles.websiteGrid}
            scrollEnabled={false} // Disable scrolling for the grid
          />
        </View>
      )}

      {/* Website Previews - Limited Grid for Regular Context */}
      {!isInPopup && limitedWebsiteUrls.length > 0 && (
        <View style={styles.websiteContainer}>
          {Platform.OS === 'web' && limitedWebsiteUrls.length > 2 ? (
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

      <ImageModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing(3),
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(2),
    marginBottom: spacing(3),
    maxWidth: '100%',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: '100%', // Prevent images from exceeding container width
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(2),
    marginBottom: spacing(3),
    maxWidth: '100%',
    overflow: 'hidden',
  },
  websiteGridItem: {
    flex: 1,
    margin: spacing(1), // Use margin instead of gap for FlatList
    maxWidth: '50%', // This ensures 2 columns with FlatList numColumns=2
  },
  websitePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(3),
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    maxWidth: '100%',
    overflow: 'hidden',
    minHeight: 80,
  },
  websiteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(3),
  },
  fullSizeImage: {
    width: '100%',
    height: '100%',
    maxWidth: 600,
    maxHeight: 600,
  },
  urlPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(3),
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: spacing(2),
    maxWidth: '100%',
    overflow: 'hidden',
    height: 80, // Fixed height for consistent sizing
    minHeight: 80, // Ensure minimum height
  },
  urlIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(0.5),
    paddingHorizontal: spacing(1),
    borderRadius: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    maxWidth: '100%',
    overflow: 'hidden',
    minHeight: 28,
  },
  compactUrlIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
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
});
