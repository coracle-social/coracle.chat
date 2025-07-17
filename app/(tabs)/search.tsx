import React, { useState, useCallback } from 'react';
import { Text, View } from '@/components/theme/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/components/theme/ThemeContext';
import Colors from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';

const { width: screenWidth } = Dimensions.get('window');
const GRID_SIZE = 8;

interface SearchItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  onPress?: () => void;
}

interface LayoutComponent {
  id: string;
  type: 'tall' | 'wide' | 'square';
  items: SearchItem[];
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label?: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export default function SearchScreen() {
  const [currentLayout, setCurrentLayout] = useState<LayoutComponent[]>([]);
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const gridSizePx = screenWidth - 32;
  const cellSize = gridSizePx / GRID_SIZE;

  const sampleItems: SearchItem[] = Array.from({ length: 50 }).map((_, i) => ({
    id: String(i + 1),
    imageUrl: `https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=${i + 1}`,
    title: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
    onPress: () => console.log(`Pressed item ${i + 1}`),
  }));

  const titles = ['Popular', 'Trending', 'Featured', 'Browse', 'Explore'];
  const icons: React.ComponentProps<typeof Feather>['name'][] = ['star', 'trending-up', 'heart', 'grid', 'compass'];
  const labels = ['Hot', 'New', 'Top', 'Browse', 'Now'];

  const generateRandomLayout = useCallback(() => {
    const occupied = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
    const validSizes = [
      [2, 2], [2, 4], [3, 3], [3, 6],
      [4, 4], [4, 6], [6, 2], [6, 4], [6, 6],
    ];

    const layouts: LayoutComponent[] = [];
    const shuffledItems = [...sampleItems].sort(() => Math.random() - 0.5);
    let itemIndex = 0;
    let titleIndex = 0;

    const canPlace = (x: number, y: number, w: number, h: number) => {
      for (let i = y - 1; i < y + h + 1; i++) {
        for (let j = x - 1; j < x + w + 1; j++) {
          if (i < 0 || j < 0 || i >= GRID_SIZE || j >= GRID_SIZE) continue;
          if (occupied[i][j]) return false;
        }
      }
      return true;
    };

    const placeComponent = (x: number, y: number, w: number, h: number) => {
      for (let i = y; i < y + h; i++) {
        for (let j = x; j < x + w; j++) {
          occupied[i][j] = true;
        }
      }
    };

    for (let attempt = 0; attempt < 100; attempt++) {
      const [w, h] = validSizes[Math.floor(Math.random() * validSizes.length)];
      const maxX = GRID_SIZE - w;
      const maxY = GRID_SIZE - h;
      const x = Math.floor(Math.random() * (maxX + 1));
      const y = Math.floor(Math.random() * (maxY + 1));

      if (!canPlace(x, y, w, h)) continue;

      const numItems = w + h;
      const items = shuffledItems.slice(itemIndex, itemIndex + numItems);
      itemIndex += numItems;

      if (items.length === 0) break;

      layouts.push({
        id: `component-${layouts.length}`,
        type: w === h ? 'square' : w > h ? 'wide' : 'tall',
        items,
        title: titles[titleIndex % titles.length],
        icon: icons[titleIndex % icons.length],
        label: Math.random() > 0.5 ? labels[titleIndex % labels.length] : undefined,
        width: w / GRID_SIZE,
        height: h / GRID_SIZE,
        x: x / GRID_SIZE,
        y: y / GRID_SIZE,
      });

      placeComponent(x, y, w, h);
      titleIndex++;
    }

    setCurrentLayout(layouts);
  }, []);

  const renderComponent = (component: LayoutComponent) => {
    const style = {
      position: 'absolute' as const,
      left: component.x * gridSizePx,
      top: component.y * cellSize,
      width: component.width * gridSizePx,
      height: component.height * cellSize,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
    };

    return (
      <View key={component.id} style={style}>
        <View style={styles.componentHeader}>
          <Text style={[styles.componentTitle, { color: colors.text }]}>{component.title}</Text>
          <Feather name={component.icon} size={16} color={colors.text} />
        </View>
        <View style={styles.componentContent}>
          {component.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.item, { backgroundColor: colors.surfaceVariant }]}
              onPress={item.onPress}
            >
              <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.itemDescription, { color: colors.secondary }]}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderLayout = () => {
    const totalHeight = GRID_SIZE * cellSize;

    return (
      <View style={[styles.gridContainer, { width: gridSizePx, height: totalHeight }]}>
        {/* Draw the grid outlines */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const row = Math.floor(i / GRID_SIZE);
          const col = i % GRID_SIZE;
          return (
            <View
              key={`cell-${i}`}
              style={{
                position: 'absolute',
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize,
                height: cellSize,
                borderWidth: 1.5,
                borderColor: '#888',
              }}
            />
          );
        })}

        {currentLayout.map(renderComponent)}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Search</Text>
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={generateRandomLayout}
        >
          <Feather name="search" size={20} color={colors.surface} />
          <Text style={[styles.searchButtonText, { color: colors.surface }]}>Randomize</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {renderLayout()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  gridContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  componentTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  componentContent: {
    gap: 4,
  },
  item: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    flex: 1,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 10,
    opacity: 0.8,
  },
});
