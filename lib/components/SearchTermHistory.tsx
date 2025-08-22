import SolarIcon from '@/components/SolarIcons';
import { spacing } from '@/core/env/Spacing';
import { Typography } from '@/core/env/Typography';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text, View } from '@/lib/theme/Themed';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { HStack } from './HStack';

interface SearchTermHistoryProps {
  onTermSelect: (term: string) => void;
  previousSearchTerm?: string | string[];
}

export default function SearchTermHistory({ onTermSelect, previousSearchTerm }: SearchTermHistoryProps) {
  const colors = useThemeColors();
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Handle both string and array types
  const searchTerms = Array.isArray(previousSearchTerm)
    ? previousSearchTerm.filter(term => term && term.trim())
    : (previousSearchTerm ? [previousSearchTerm] : []);
  const hasHistory = searchTerms.length > 0;

  // If no search history, don't render anything
  if (!hasHistory) {
    return null;
  }

  const mostRecentTerm = searchTerms[0];
  const hasMultipleTerms = searchTerms.length > 1;

  return (
    <View style={styles.container}>
      <HStack style={styles.hstack} spacing={spacing(2)}>
        {/* History icon - clickable to show all history */}
        <TouchableOpacity
          onPress={() => hasMultipleTerms && setShowAllHistory(!showAllHistory)}
          style={styles.iconContainer}
        >
          <SolarIcon
            name="History"
            size={28}
            color={hasMultipleTerms ? colors.primary : colors.text}
            strokeWidth={1.35}
          />
        </TouchableOpacity>

        {/* Right side - contains all history terms */}
        <View style={styles.termsContainer}>
          {/* All history terms as comma-separated list */}
          {searchTerms.map((term, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                onPress={() => onTermSelect(term)}
                style={styles.termContainer}
              >
                <Text
                  style={[Typography.header, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {term}
                </Text>
              </TouchableOpacity>
              {/* Add comma separator between terms */}
              {index < searchTerms.length - 1 && (
                <Text style={[styles.separator, { color: colors.text }]}>
                  ,{' '}
                </Text>
              )}
            </React.Fragment>
          ))}
        </View>
      </HStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing(1),
    paddingLeft: spacing(1.5),
    paddingBottom: spacing(4),
  },
  hstack: {
    alignItems: 'center',
  },
  iconContainer: {
    padding: spacing(0.5),
  },
  termsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  termContainer: {
    paddingVertical: spacing(0.5),
  },
  separator: {
    fontSize: 16,
  },
  searchTermText: {
    fontSize: 16,
  },
});
