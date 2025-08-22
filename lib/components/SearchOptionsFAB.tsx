import SolarIcon from '@/components/SolarIcons';
import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { View } from '@/lib/theme/Themed';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Card, Checkbox, FAB, List, Text } from 'react-native-paper';
import { OptionButton } from './OptionButton';

interface SearchOptionsFABProps {
  selectedFilters?: string[];
  selectedSort?: string;
  onFilterToggle?: (filterId: string) => void;
  onFilterRemove?: (filterId: string) => void;
}

export default function SearchOptionsFAB({
  selectedFilters = [],
  selectedSort = 'relevance',
  onFilterToggle = () => {},
  onFilterRemove = () => {}
}: SearchOptionsFABProps) {
  const colors = useThemeColors();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

  const filterOptions = [
    { id: 'people', label: 'People', icon: '👤' },
    { id: 'content', label: 'Content', icon: '📝' },
  ];

  const sortOptions = [
    { id: 'relevance', label: 'Relevance', icon: '⭐' },
    { id: 'date', label: 'Date', icon: '📅' },
    { id: 'popularity', label: 'Popularity', icon: '🔥' },
    { id: 'trust', label: 'Trust', icon: '🛡️' },
  ];

  const handleSearchOption = (option: string) => {
    // Handle search option selection
    console.log('Selected search option:', option);
  };

  const handleCheckboxToggle = (option: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(option)) {
      newSelected.delete(option);
    } else {
      newSelected.add(option);
    }
    setSelectedOptions(newSelected);
  };

  const handleApply = () => {
    // Apply the selected search options
    console.log('Applying search options:', Array.from(selectedOptions));
    setIsVisible(false);
  };

  const renderFilterBubble = (option: { id: string; label: string; icon: string }) => {
    const isSelected = selectedFilters.includes(option.id);

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.filterBubble,
          {
            backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
            borderColor: isSelected ? colors.primary : colors.border,
          }
        ]}
        onPress={() => onFilterToggle(option.id)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.filterBubbleText,
          { color: isSelected ? colors.surface : colors.text }
        ]}>
          {option.icon} {option.label}
        </Text>
        {isSelected && (
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

  const renderSortBubble = (option: { id: string; label: string; icon: string }) => {
    const isSelected = selectedSort === option.id;

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.filterBubble,
          {
            backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
            borderColor: isSelected ? colors.primary : colors.border,
          }
        ]}
        onPress={() => onFilterToggle(option.id)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.filterBubbleText,
          { color: isSelected ? colors.surface : colors.text }
        ]}>
          {option.icon} {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Floating Action Button */}
      <FAB
        icon={() => (
          <SolarIcon
            name={isVisible ? "Close" : "Tuning"}
            size={24}
            color="white"
          />
        )}
        style={[
          styles.fab,
          { backgroundColor: colors.primary }
        ]}
        onPress={() => setIsVisible(!isVisible)}
      />

      {/* Search Options Modal */}
      <Modal
        visible={isVisible}
        onDismiss={() => setIsVisible(false)}
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text variant="headlineSmall" style={{ color: colors.text }}>
              Search Options
            </Text>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Filter Options */}
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={{ color: colors.text, marginBottom: spacing(1) }}>
                Filter By
              </Text>
              <View style={styles.optionsRow}>
                {filterOptions.map(renderFilterBubble)}
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={{ color: colors.text, marginBottom: spacing(1) }}>
                Sort By
              </Text>
              <View style={styles.optionsRow}>
                {sortOptions.map(renderSortBubble)}
              </View>
            </View>

            {/* Search option items */}
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={{ color: colors.text, marginBottom: spacing(1) }}>
                Search Options
              </Text>
            </View>

            <Card
              style={[
                styles.searchOptionItem,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => handleSearchOption('global')}
            >
              <List.Item
                title="Global Search"
                description="Search across all content"
                left={props => (
                  <Checkbox
                    status={selectedOptions.has('global') ? 'checked' : 'unchecked'}
                    onPress={() => handleCheckboxToggle('global')}
                    color={colors.primary}
                    uncheckedColor={colors.placeholder}
                  />
                )}
                right={props => (
                  <List.Icon
                    {...props}
                    icon="earth"
                    color={colors.placeholder}
                  />
                )}
                titleStyle={[
                  styles.searchOptionTitle,
                  { color: colors.text }
                ]}
                descriptionStyle={[
                  styles.searchOptionDescription,
                  { color: colors.placeholder }
                ]}
                style={styles.listItem}
              />
            </Card>

            <Card
              style={[
                styles.searchOptionItem,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => handleSearchOption('users')}
            >
              <List.Item
                title="Search Users"
                description="Find specific users"
                left={props => (
                  <Checkbox
                    status={selectedOptions.has('users') ? 'checked' : 'unchecked'}
                    onPress={() => handleCheckboxToggle('users')}
                    color={colors.primary}
                    uncheckedColor={colors.placeholder}
                  />
                )}
                right={props => (
                  <List.Icon
                    {...props}
                    icon="account-search"
                    color={colors.placeholder}
                  />
                )}
                titleStyle={[
                  styles.searchOptionTitle,
                  { color: colors.text }
                ]}
                descriptionStyle={[
                  styles.searchOptionDescription,
                  { color: colors.placeholder }
                ]}
                style={styles.listItem}
              />
            </Card>

            <View style={[styles.addSearchSection, { backgroundColor: 'transparent' }]}>
              <OptionButton
                title="Advanced Search"
                icon="tune"
                variant="primary"
                size="large"
                onPress={() => handleSearchOption('advanced')}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={() => setIsVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleApply}
              style={styles.modalButton}
            >
              Apply
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  modalContainer: {
    flex: 1,
    padding: spacing(2),
  },
  modalHeader: {
    padding: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: spacing(2),
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing(3),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  modalButton: {
    minWidth: 100,
  },
  searchOptionItem: {
    marginHorizontal: spacing(2),
    marginVertical: spacing(1),
    borderRadius: 8,
    borderWidth: 1,
  },
  listItem: {
    paddingVertical: spacing(0.5),
  },
  searchOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchOptionDescription: {
    fontSize: 10,
    marginTop: spacing(0.5),
  },
  addSearchSection: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  filterBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.5),
    borderRadius: 15,
    borderWidth: 1,
    marginHorizontal: spacing(0.5),
    marginVertical: spacing(0.5),
  },
  filterBubbleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    paddingHorizontal: spacing(0.5),
    paddingVertical: spacing(0.2),
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionHeader: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
});
