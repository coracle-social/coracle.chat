import { useThemeColors } from '@/lib/theme/ThemeContext';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

interface KaleidoscopeAvatarProps {
  size?: number;
  patternCount?: number;
}

type PatternItem = {
  key: string;
  span: number;
  height: number;
  backgroundColor: string;
  left: number;
  top: number;
  width: number;
};

const generateRandomPattern = (size: number, patternCount: number): PatternItem[] => {
  const items: PatternItem[] = [];
  const columnCount = 3;
  const spacing = 2;
  const columnWidth = (size - spacing * (columnCount - 1)) / columnCount;

  // Track heights per column
  const columnHeights = new Array(columnCount).fill(0);

  for (let i = 0; i < patternCount; i++) {
    // Randomly assign span: 1 or 2 (rarely 3)
    const spanRand = Math.random();
    const span = spanRand < 0.75 ? 1 : spanRand < 0.95 ? 2 : 3;

    const height = 8 + Math.random() * 20; // Smaller heights for avatar size

    // Generate random pastel colors
    const backgroundColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;

    // Find best column group (smallest max height)
    let bestIndex = 0;
    let bestHeight = Number.MAX_SAFE_INTEGER;

    for (let j = 0; j <= columnCount - span; j++) {
      const groupHeights = columnHeights.slice(j, j + span);
      const maxHeight = Math.max(...groupHeights);

      if (maxHeight < bestHeight) {
        bestHeight = maxHeight;
        bestIndex = j;
      }
    }

    // Calculate position
    const left = bestIndex * (columnWidth + spacing);
    const top = columnHeights[bestIndex];
    const width = columnWidth * span + spacing * (span - 1);

    items.push({
      key: `pattern-${i}`,
      span,
      height,
      backgroundColor,
      left,
      top,
      width,
    });

    // Update heights for all spanned columns
    const newHeight = top + height + spacing;
    for (let j = bestIndex; j < bestIndex + span; j++) {
      columnHeights[j] = newHeight;
    }
  }

  return items;
};

export const KaleidoscopeAvatar: React.FC<KaleidoscopeAvatarProps> = ({
  size = 90,
  patternCount = 8,
}) => {
  const colors = useThemeColors();

  // Generate new random pattern every time
  const patternItems = useMemo(() =>
    generateRandomPattern(size, patternCount),
    [size, patternCount]
  );

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {patternItems.map(({ key, left, top, width, height, backgroundColor }) => (
        <View
          key={key}
          style={[
            styles.patternItem,
            {
              left,
              top,
              width,
              height,
              backgroundColor,
              position: 'absolute',
              borderRadius: 4,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 45, // Half of default size for circular avatar
    overflow: 'hidden',
  },
  patternItem: {
    position: 'absolute',
    borderRadius: 4,
  },
});
