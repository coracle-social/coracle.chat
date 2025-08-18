import { SearchInput } from '@/components/search/SearchInput';
import { spacing } from '@/core/env/Spacing';
import { CloseButton } from '@/lib/components/CloseButton';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import emojiList from 'emoji.json';
import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PopupBase } from './PopupBase';

// Emoji categories for Discord-style organization
const EMOJI_CATEGORIES = [
  { name: 'Recent', icon: '🕒', id: 'recent' },
  { name: 'Smileys & Emotion', icon: '😀', id: 'Smileys & Emotion' },
  { name: 'People & Body', icon: '👋', id: 'People & Body' },
  { name: 'Animals & Nature', icon: '🌱', id: 'Animals & Nature' },
  { name: 'Food & Drink', icon: '🍎', id: 'Food & Drink' },
  { name: 'Activities', icon: '⚽', id: 'Activities' },
  { name: 'Travel & Places', icon: '🚗', id: 'Travel & Places' },
  { name: 'Objects', icon: '💡', id: 'Objects' },
  { name: 'Symbols', icon: '💕', id: 'Symbols' },
  { name: 'Flags', icon: '🏁', id: 'Flags' },
];

interface EmojiPickerPopupProps {
  visible: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPickerPopup: React.FC<EmojiPickerPopupProps> = ({
  visible,
  onClose,
  onEmojiSelect,
}) => {
  const colors = useThemeColors();
  const [selectedCategory, setSelectedCategory] = useState(EMOJI_CATEGORIES[1].id);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and organize emojis by category
  const emojisByCategory = useMemo(() => {
    if (!emojiList || !emojiList.length) {
      console.warn('No emoji data available');
      return {};
    }

    const categorized: { [key: string]: any[] } = {};

    emojiList.forEach((emoji: any) => {
      // Extract the main category from the detailed category
      const fullCategory = emoji.category || 'Symbols';
      const mainCategory = fullCategory.split(' (')[0]; // Get the part before the first parenthesis

      if (!categorized[mainCategory]) {
        categorized[mainCategory] = [];
      }
      categorized[mainCategory].push(emoji);
    });

    return categorized;
  }, [emojiList]);

  // Filter emojis based on search query
  const filteredEmojis = useMemo(() => {
    if (!searchQuery) {
      return emojisByCategory[selectedCategory] || [];
    }

    return emojiList.filter((emoji: any) =>
      emoji.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emoji.aliases && emoji.aliases.some((alias: string) => alias.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [searchQuery, selectedCategory, emojisByCategory]);

  const handleEmojiSelect = (emoji: any) => {
    // emoji.json uses 'char' field for the emoji character
    const emojiChar = emoji.char || emoji.emoji || '❓';
    onEmojiSelect(emojiChar);
    onClose();
  };

  const renderEmoji = (emoji: any) => {
    // emoji.json uses 'char' field for the emoji character
    const emojiChar = emoji.char || emoji.emoji || '❓';

    return (
      <TouchableOpacity
        key={emoji.codes}
        style={styles.emojiItem}
        onPress={() => handleEmojiSelect(emoji)}
        activeOpacity={0.7}
      >
        <Text style={styles.emojiText}>{emojiChar}</Text>
      </TouchableOpacity>
    );
  };

  const renderCategoryTab = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryTab,
        selectedCategory === category.id && { backgroundColor: colors.primary + '20' }
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
    </TouchableOpacity>
  );

  return (
    <PopupBase visible={visible} onClose={onClose} animationType="slide">
      <View style={[styles.pickerContainer, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.searchContainer}>
              <SearchInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search emojis..."
                isSearching={false}
                onClear={() => setSearchQuery('')}
              />
            </View>
            <CloseButton onPress={onClose} size="small" />
          </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.categoryTabs, { borderBottomColor: colors.border }]}
          contentContainerStyle={styles.categoryTabsContent}
        >
          {EMOJI_CATEGORIES.map(renderCategoryTab)}
        </ScrollView>

        {/* Emoji Grid */}
        <ScrollView
          style={styles.emojiGrid}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.emojiGridContent}
        >
          {filteredEmojis.length > 0 ? (
            <View style={styles.emojiRow}>
              {filteredEmojis.map(renderEmoji)}
            </View>
          ) : (
            <View style={styles.noEmojisContainer}>
              <Text style={[styles.noEmojisText, { color: colors.placeholder }]}>
                {searchQuery ? 'No emojis found' : 'Loading emojis...'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </PopupBase>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    width: Platform.OS === 'web' ? 400 : '90%',
    maxWidth: 400,
    height: Platform.OS === 'web' ? 400 : '60%',
    maxHeight: 400,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(3),
    borderBottomWidth: 1,
  },

  searchContainer: {
    flex: 1,
    marginRight: spacing(2),
  },
  categoryTabs: {
    borderBottomWidth: 1,
    maxHeight: 60,
  },
  categoryTabsContent: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  categoryTab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing(0.5),
    marginVertical: spacing(0.5),
  },
  categoryIcon: {
    fontSize: 18,
  },
  emojiGrid: {
    flex: 1,
  },
  emojiGridContent: {
    paddingTop: spacing(1),
    paddingHorizontal: spacing(2),
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  emojiItem: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing(0.5),
  },
  emojiText: {
    fontSize: 20,
  },
  noEmojisContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(4),
  },
  noEmojisText: {
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
