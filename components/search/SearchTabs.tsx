import { useThemeColors } from '@/lib/theme/ThemeContext';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

interface SearchTabsProps {
  selectedFilters: string[];
  selectedSort: string;
  onFilterToggle: (filterId: string) => void;
  onFilterRemove: (filterId: string) => void;
  isSortDisabled: (filterId: string) => boolean;
}

export const SearchTabs: React.FC<SearchTabsProps> = ({
  selectedFilters,
  selectedSort,
  onFilterToggle,
  onFilterRemove,
  isSortDisabled,
}) => {
  const colors = useThemeColors();
  const [showAllOptions, setShowAllOptions] = useState(false);

  const filterOptions: FilterOption[] = [
    { id: 'people', label: 'People', icon: '👤' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'relevance', label: 'Relevance', icon: '⭐' },
    { id: 'date', label: 'Date', icon: '📅' },
    { id: 'popularity', label: 'Popularity1', icon: '🔥' },
    { id: 'trust', label: 'Trust', icon: '🛡️' },
  ];

  const sortedOptions = filterOptions.sort((a, b) => {
    const isFilterA = ['people', 'content'].includes(a.id);
    const isFilterB = ['people', 'content'].includes(b.id);

    const isSelectedA = isFilterA ? selectedFilters.includes(a.id) : selectedSort === a.id;
    const isSelectedB = isFilterB ? selectedFilters.includes(b.id) : selectedSort === b.id;

    if (isSelectedA && !isSelectedB) return -1;
    if (!isSelectedA && isSelectedB) return 1;
    return 0; // Both selected or both unselected, maintain original order
  });

  const renderFilterBubble = (option: FilterOption) => {
    const isFilter = ['people', 'content'].includes(option.id);
    const isSort = ['relevance', 'date', 'popularity', 'trust'].includes(option.id);

    const isSelected = isFilter ? selectedFilters.includes(option.id) : selectedSort === option.id;
    const isDisabled = isSort && isSortDisabled(option.id);

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.filterBubble,
          Platform.OS === 'web' && styles.filterBubbleWeb,
          {
            backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
            borderColor: isSelected ? colors.primary : colors.border,
            opacity: isDisabled ? 0.5 : 1,
          }
        ]}
        onPress={() => !isDisabled && onFilterToggle(option.id)}
        activeOpacity={0.7}
        disabled={isDisabled}
      >
        <Text style={[
          styles.filterBubbleText,
          { color: colors.text }
        ]}>
          {option.icon} {option.label}
        </Text>
        {isSelected && isFilter && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onFilterRemove(option.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.removeButtonText, { color: colors.surface }]}>✕</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (Platform.OS === 'web') {
    // Web: Auto-wrapping based on screen width
    return (
      <View style={styles.filterContainer}>
        <View style={styles.webContainer}>
          {sortedOptions.map(renderFilterBubble)}
        </View>
      </View>
    );
  } else {
    // Mobile: Horizontal scroll with "Add" button
    const visibleOptions = showAllOptions ? sortedOptions : sortedOptions.slice(0, 4);
    const hasMoreOptions = sortedOptions.length > 4;

    return (
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {visibleOptions.map(renderFilterBubble)}
          {hasMoreOptions && !showAllOptions && (
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setShowAllOptions(true)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.addButtonText,
                { color: colors.text }
              ]}>
                + Add
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  webContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  filterScrollContent: {
    paddingRight: 12,
  },
  filterBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 60,
  },
  filterBubbleWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterBubbleText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    flexShrink: 1,
  },
  removeButton: {
    marginLeft: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  removeButtonText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 60,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
