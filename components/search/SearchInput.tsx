import SolarIcon from '@/components/SolarIcons';
import { spacing } from '@/core/env/Spacing';
import { Typography } from '@/core/env/Typography';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import React from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isSearching?: boolean;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  showMenu?: boolean;
  onMenuPress?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
  onFocus,
  onBlur,
  autoFocus = false,
  autoCapitalize = 'none',
  autoCorrect = false,
  showMenu = true,
  onMenuPress,
}) => {
  const colors = useThemeColors();
  const isMobile = Platform.OS !== 'web';

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { backgroundColor: isMobile ? 'transparent' : colors.surfaceVariant }]}>
        {/* Always show magnifier on the left */}
        <SolarIcon
          name="Magnifier"
          size={28}
          style={[styles.searchIcon]}
          color={colors.text}
        />

        <TextInput
          style={[styles.input, { color: colors.text }, isMobile && Typography.header]}
          placeholder={placeholder}
          placeholderTextColor={colors.text}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          autoFocus={autoFocus}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />

        {/* Show close button on mobile when typing */}
        {isMobile && value.length > 0 && onClear && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClear}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <SolarIcon
              name="Close"
              size={28}
              color={colors.text}
            />
          </TouchableOpacity>
        )}

        {/* Show clear button only on web when typing */}
        {!isMobile && value.length > 0 && onClear && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <SolarIcon
              name="Close"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        )}

        {/* Show menu only on web */}
        {!isMobile && showMenu && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenuPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ color: colors.text, fontSize: 16 }}>⋮</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Mobile dividing line - outside the input container */}
      {isMobile && <View style={[styles.divider, { backgroundColor: colors.text + '80' }]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Add any specific styles for the container if needed
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20, // Increased from 8 for more rounded appearance
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(0.5),
    minHeight: 56, // Larger touch target for mobile
  },
  searchIcon: {
    marginRight: spacing(1),
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: spacing(1),
    outlineWidth: 0, //removes web automatic outline
  },
  searchingIndicator: {
    marginLeft: spacing(2),
  },
  clearButton: {
    marginLeft: spacing(1),
    padding: spacing(0.5),
  },
  clearText: {
    fontSize: 24, // Larger X for mobile
    fontWeight: '500',
  },
  menuButton: {
    marginLeft: spacing(1),
    padding: spacing(0.5),
  },
  divider: {
    height: 0.20,
    marginHorizontal: spacing(1),
    marginTop: spacing(1),
  },
});
