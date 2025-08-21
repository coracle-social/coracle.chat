import { Dimensions } from 'react-native';

export const convertImageToDataUrl = async (uri: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = uri;
  });
};

export interface ImageSizingConfig {
  type: 'hardcoded' | 'relative' | 'exact' | 'aspect-ratio';
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number; // width/height ratio
  scale?: number; // for relative sizing (percentage of container)
}

export interface CalculatedImageSize {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * Calculate image dimensions based on sizing strategy
 */
export const calculateImageSize = (
  config: ImageSizingConfig,
  containerWidth?: number,
  containerHeight?: number,
  originalWidth?: number,
  originalHeight?: number
): CalculatedImageSize => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Default container dimensions if not provided
  const containerW = containerWidth || screenWidth;
  const containerH = containerHeight || screenHeight;

  // Original image dimensions (fallback to reasonable defaults)
  const origW = originalWidth || 1920;
  const origH = originalHeight || 1080;
  const origAspectRatio = origW / origH;

  switch (config.type) {
    case 'hardcoded':
      return {
        width: config.width || 280,
        height: config.height || 200,
        aspectRatio: (config.width || 280) / (config.height || 200)
      };

    case 'relative':
      const scale = config.scale || 0.8;
      const relativeWidth = containerW * scale;
      const relativeHeight = containerH * scale;

      // Apply max constraints
      const maxW = config.maxWidth || screenWidth * 0.9;
      const maxH = config.maxHeight || screenHeight * 0.9;

      return {
        width: Math.min(relativeWidth, maxW),
        height: Math.min(relativeHeight, maxH),
        aspectRatio: Math.min(relativeWidth, maxW) / Math.min(relativeHeight, maxH)
      };

    case 'exact':
      return {
        width: config.width || origW,
        height: config.height || origH,
        aspectRatio: (config.width || origW) / (config.height || origH)
      };

    case 'aspect-ratio':
      const targetAspectRatio = config.aspectRatio || origAspectRatio;
      let calculatedWidth = config.width || containerW * 0.8;
      let calculatedHeight = calculatedWidth / targetAspectRatio;

      // Apply max constraints - use more conservative defaults
      const maxWidth = config.maxWidth || Math.min(containerW * 0.95, screenWidth * 0.9);
      const maxHeight = config.maxHeight || Math.min(containerH * 0.95, screenHeight * 0.9);

      if (calculatedWidth > maxWidth) {
        calculatedWidth = maxWidth;
        calculatedHeight = calculatedWidth / targetAspectRatio;
      }

      if (calculatedHeight > maxHeight) {
        calculatedHeight = maxHeight;
        calculatedWidth = calculatedHeight * targetAspectRatio;
      }

      // Ensure we don't exceed container width
      if (calculatedWidth > containerW) {
        calculatedWidth = containerW;
        calculatedHeight = calculatedWidth / targetAspectRatio;
      }

      return {
        width: calculatedWidth,
        height: calculatedHeight,
        aspectRatio: targetAspectRatio
      };

    default:
      return {
        width: 280,
        height: 200,
        aspectRatio: 1.4
      };
  }
};

/**
 * Get resize mode based on sizing strategy
 */
export const getResizeMode = (config: ImageSizingConfig): 'cover' | 'contain' | 'stretch' | 'center' => {
  switch (config.type) {
    case 'hardcoded':
    case 'exact':
      return 'cover'; // Fill the container, may crop
    case 'relative':
      return 'contain'; // Show full image, may have padding
    case 'aspect-ratio':
      return 'cover'; // Maintain aspect ratio, may crop
    default:
      return 'cover';
  }
};

/**
 * Predefined sizing configurations for common use cases
 */
export const ImageSizingPresets = {
  // Grid layouts
  grid: {
    single: { type: 'hardcoded' as const, width: 280, height: 200 },
    double: { type: 'hardcoded' as const, width: 140, height: 140 },
    multiple: { type: 'hardcoded' as const, width: 120, height: 120 },
  },

  // Responsive layouts
  responsive: {
    mobile: { type: 'relative' as const, scale: 0.9, maxWidth: 350 },
    tablet: { type: 'relative' as const, scale: 0.7, maxWidth: 500 },
    desktop: { type: 'relative' as const, scale: 0.6, maxWidth: 800 },
  },

  // Aspect ratio preserving
  aspectRatio: {
    square: { type: 'aspect-ratio' as const, aspectRatio: 1, maxWidth: 400 },
    landscape: { type: 'aspect-ratio' as const, aspectRatio: 16/9, maxWidth: 600 },
    portrait: { type: 'aspect-ratio' as const, aspectRatio: 3/4, maxWidth: 300 },
    original: { type: 'aspect-ratio' as const }, // Uses original image aspect ratio
  },

  // Exact sizes
  exact: {
    thumbnail: { type: 'exact' as const, width: 100, height: 100 },
    medium: { type: 'exact' as const, width: 300, height: 200 },
    large: { type: 'exact' as const, width: 600, height: 400 },
  }
};

/**
 * Get sizing config based on number of images (for grid layouts)
 */
export const getGridSizingConfig = (totalImages: number): ImageSizingConfig => {
  if (totalImages === 1) return ImageSizingPresets.grid.single;
  if (totalImages === 2) return ImageSizingPresets.grid.double;
  return ImageSizingPresets.grid.multiple;
};
