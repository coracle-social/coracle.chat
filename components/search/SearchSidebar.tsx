import { ComponentStyles } from '@/core/env/ComponentStyles';
import { LayoutPresets } from '@/core/env/LayoutPresets';
import { spacing } from '@/core/env/Spacing';
import { useImageSizing } from '@/lib/hooks/useImageSizing';
import { useUserPreferences } from '@/lib/hooks/useUserPreferences';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { withShadow } from '@/lib/utils/styleUtils';
import Feather from '@expo/vector-icons/Feather';
import { Switch } from '@rneui/themed';
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

interface SearchSidebarProps {
  isOpen: boolean;
  onOptionChange?: (option: string, value: any) => void;
  onWidthChange?: (width: number) => void;
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  isOpen,
  onOptionChange,
  onWidthChange,
}) => {
  const colors = useThemeColors();

  const { currentStrategy, availableStrategies, cycleToNextStrategy, setStrategy } = useImageSizing();
  const { postLength, urlPreviews, togglePostLength, toggleUrlPreviews } = useUserPreferences();

  const [showImageDropdown, setShowImageDropdown] = useState(false);

  // Only show on web
  if (Platform.OS !== 'web') {
    return null;
  }

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    onWidthChange?.(width);
  };

  const handleImageButtonPress = () => {
    cycleToNextStrategy();
  };

  const handleImageChevronPress = (e: any) => {
    e.stopPropagation();
    setShowImageDropdown(!showImageDropdown);
  };

  const handleImageOptionSelect = (strategy: any) => {
    setStrategy(strategy);
    setShowImageDropdown(false);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar Content */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: colors.surface,
            borderRightColor: colors.border,
          },
        ]}
        onLayout={handleLayout}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Display Options
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.imageContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  { backgroundColor: colors.background, borderColor: colors.border }
                ]}
                onPress={handleImageButtonPress}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Feather name="image" size={14} color={colors.primary} />
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {availableStrategies.find(s => s.config === currentStrategy)?.name || 'Images'}
                  </Text>
                  <TouchableOpacity
                    onPress={handleImageChevronPress}
                    style={styles.chevronButton}
                  >
                    <Feather name="chevron-right" size={12} color={colors.placeholder} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              {/* Dropdown */}
              {showImageDropdown && (
                <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {availableStrategies.map((strategy, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        { borderBottomColor: colors.border },
                        strategy.config === currentStrategy && { backgroundColor: colors.primary + '20' }
                      ]}
                      onPress={() => handleImageOptionSelect(strategy.config)}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        { color: colors.text },
                        strategy.config === currentStrategy && { color: colors.primary, fontWeight: '600' }
                      ]}>
                        {strategy.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.option}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                Full posts
              </Text>
              <Switch
                value={postLength === 'full'}
                onValueChange={(value) => {
                  togglePostLength();
                }}
                color={colors.primary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.option}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                Show previews
              </Text>
              <Switch
                value={urlPreviews === 'enabled'}
                onValueChange={(value) => {
                  toggleUrlPreviews();
                }}
                color={colors.primary}
              />
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sidebar: {
    height: '100%',
    ...ComponentStyles.sidebar,
  },
  header: {
    padding: spacing(4),
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing(4),
  },
  section: {
    marginBottom: spacing(6),
  },
  imageContainer: {
    position: 'relative',
  },
  optionButton: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: spacing(1.5),
    borderWidth: 1,
    ...withShadow('small'),
  },
  optionContent: {
    ...LayoutPresets.row,
    gap: spacing(1),
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  chevronButton: {
    padding: spacing(0.5),
  },
  dropdown: {
    marginTop: spacing(1),
    borderRadius: spacing(1.5),
    borderWidth: 1,
    ...withShadow('medium'),
  },
  dropdownItem: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
  option: {
    ...LayoutPresets.spaceBetween,
    marginBottom: spacing(3),
    paddingVertical: spacing(1),
  },
  optionLabel: {
    fontSize: 14,
    flex: 1,
  },
});
