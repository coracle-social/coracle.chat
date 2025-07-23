import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Platform } from 'react-native';
import { Layout } from '@/core/env/Layout';

const screenWidth = Dimensions.get('window').width;
const maxContainerWidth = 950;
const columnCount = 3;
const spacing = 8;
const containerPadding = spacing * 2; // padding left + right

// Calculate the actual container width (constrained by max width)
const getContainerWidth = () => {
  if (Platform.OS === 'web') {
    return Math.min(screenWidth, maxContainerWidth);
  }
  return screenWidth;
};

const containerWidth = getContainerWidth();
const availableWidth = containerWidth - containerPadding;
const columnWidth = (availableWidth - spacing * (columnCount - 1)) / columnCount;

type Item = {
  key: string;
  span: number; // number of columns the item spans
  height: number;
  backgroundColor: string;
};

const generateItems = (count: number): Item[] => {
  return Array.from({ length: count }).map((_, i) => {
    // Randomly assign span: 1 or 2 (rarely 3)
    const spanRand = Math.random();
    const span = spanRand < 0.75 ? 1 : spanRand < 0.95 ? 2 : 3;

    const height = 100 + Math.random() * 150;

    // Generate random pastel colors
    const backgroundColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;

    return {
      key: `item-${i}`,
      span,
      height,
      backgroundColor,
    };
  });
};

// Find the best column group index to place item of span N (smallest max height)
const findBestColumnGroup = (
  columnHeights: number[],
  span: number
): number => {
  let bestIndex = 0;
  let bestHeight = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i <= columnHeights.length - span; i++) {
    // Get max height of columns in this group
    const groupHeights = columnHeights.slice(i, i + span);
    const maxHeight = Math.max(...groupHeights);

    if (maxHeight < bestHeight) {
      bestHeight = maxHeight;
      bestIndex = i;
    }
  }

  return bestIndex;
};

export default function ExploreScreen() {
  const items = useMemo(() => generateItems(30), []);

  // Track heights per column
  const columnHeights = new Array(columnCount).fill(0);

  // Store positioned items: with left and top offsets and width/height
  type PositionedItem = Item & { left: number; top: number; width: number };
  const positionedItems: PositionedItem[] = [];

  items.forEach((item) => {
    const span = Math.min(item.span, columnCount);
    const colIndex = findBestColumnGroup(columnHeights, span);

    // Calculate position
    const left = colIndex * (columnWidth + spacing);
    const top = columnHeights[colIndex];

    // Calculate width based on span
    const width = columnWidth * span + spacing * (span - 1);

    positionedItems.push({ ...item, left, top, width });

    // Update heights for all spanned columns
    const newHeight = top + item.height + spacing;
    for (let i = colIndex; i < colIndex + span; i++) {
      columnHeights[i] = newHeight;
    }
  });

  // Container height = max column height
  const containerHeight = Math.max(...columnHeights);

  return (
    <View style={[styles.container, Platform.OS === 'web' && Layout.webContainer]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { height: containerHeight + spacing },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {positionedItems.map(({ key, left, top, width, height, backgroundColor }) => (
          <View
            key={key}
            style={[
              styles.item,
              {
                left,
                top,
                width,
                height,
                backgroundColor,
                position: 'absolute',
                borderRadius: 12,
              },
            ]}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing,
  },
  scrollContent: {
    position: 'relative',
    width: Platform.OS === 'web' ? containerWidth : '100%',
  },
  item: {
    position: 'absolute',
    borderRadius: 12,
  },
});

