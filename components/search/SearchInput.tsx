import SolarIcon from '@/components/SolarIcons';
import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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

  return (
    <View style={[styles.inputContainer, { backgroundColor: colors.surfaceVariant }]}>
      <SolarIcon
        name="Magnifier"
        size={20}
        style={styles.searchIcon}
      />
      <TextInput
        style={[styles.input, { color: colors.text }]}
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
      {value.length > 0 && onClear && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ color: colors.text, fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
      )}
      {showMenu && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ color: colors.text, fontSize: 16 }}>⋮</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20, // Increased from 8 for more rounded appearance
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
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
  menuButton: {
    marginLeft: spacing(1),
    padding: spacing(0.5),
  },
});
