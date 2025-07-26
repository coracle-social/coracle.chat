import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { Switch } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

interface SearchSidebarProps {
  isOpen: boolean;
  onOptionChange?: (option: string, value: any) => void;
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  isOpen,
  onOptionChange,
}) => {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  // Get screen dimensions
  const { width: screenWidth } = Dimensions.get('window');
  const sidebarWidth = Math.min(280, screenWidth * 0.3); // Responsive width

  // State for sidebar options
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showEngagementStats, setShowEngagementStats] = useState(true);

  // Reanimated shared value for the slide animation
  const translateX = useSharedValue(-sidebarWidth); // Start off-screen to the left

  // Animated style for the sidebar
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Animate the sidebar when isOpen changes
  useEffect(() => {
    if (isOpen) {
      translateX.value = withTiming(0, { duration: 300 });
    } else {
      translateX.value = withTiming(-sidebarWidth, { duration: 300 });
    }
  }, [isOpen, sidebarWidth]);

  // Only show on web
  if (Platform.OS !== 'web') {
    return null;
  }

  const handleOptionChange = (option: string, value: any) => {
    onOptionChange?.(option, value);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar Content */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: colors.surface,
            width: sidebarWidth,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Display Options
          </Text>
        </View>

        <View style={styles.content}>
          {/* Search Options Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Search Options
            </Text>

            <View style={styles.option}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                Results per page
              </Text>
              {/* Placeholder for dropdown/input */}
              <View style={[styles.optionValue, { backgroundColor: colors.background }]}>
                <Text style={[styles.optionValueText, { color: colors.placeholder }]}>
                  50
                </Text>
              </View>
            </View>

            <View style={styles.option}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                Show thumbnails
              </Text>
              <Switch
                value={showThumbnails}
                onValueChange={(value) => {
                  setShowThumbnails(value);
                  handleOptionChange('showThumbnails', value);
                }}
                color={colors.primary}
              />
            </View>
          </View>

          {/* Display Options Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Display Options
            </Text>

            <View style={styles.option}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                Compact view
              </Text>
              <Switch
                value={compactView}
                onValueChange={(value) => {
                  setCompactView(value);
                  handleOptionChange('compactView', value);
                }}
                color={colors.primary}
              />
            </View>

            <View style={styles.option}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                Show timestamps
              </Text>
              <Switch
                value={showTimestamps}
                onValueChange={(value) => {
                  setShowTimestamps(value);
                  handleOptionChange('showTimestamps', value);
                }}
                color={colors.primary}
              />
            </View>

            <View style={styles.option}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                Show engagement stats
              </Text>
              <Switch
                value={showEngagementStats}
                onValueChange={(value) => {
                  setShowEngagementStats(value);
                  handleOptionChange('showEngagementStats', value);
                }}
                color={colors.primary}
              />
            </View>
          </View>

          {/* Filter Options Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Filter Options
            </Text>

            <View style={styles.option}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                Minimum trust score
              </Text>
              <View style={[styles.optionValue, { backgroundColor: colors.background }]}>
                <Text style={[styles.optionValueText, { color: colors.placeholder }]}>
                  Any
                </Text>
              </View>
            </View>

            <View style={styles.option}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                Date range
              </Text>
              <View style={[styles.optionValue, { backgroundColor: colors.background }]}>
                <Text style={[styles.optionValueText, { color: colors.placeholder }]}>
                  All time
                </Text>
              </View>
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
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  header: {
    padding: spacing(4),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing(3),
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(3),
    paddingVertical: spacing(1),
  },
  optionLabel: {
    fontSize: 14,
    flex: 1,
  },
  optionValue: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  optionValueText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
