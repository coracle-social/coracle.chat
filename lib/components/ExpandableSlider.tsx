import { BorderRadius } from '@/core/env/BorderRadius';
import { Shadows } from '@/core/env/Shadows';
import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { Card, List } from 'react-native-paper';

interface ExpandableSliderProps {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  children: React.ReactNode;
  shouldRotate?: boolean;
  label?: string;
  showBackground?: boolean;
  customBackgroundColor?: string;
}

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ExpandableSlider({
  title,
  icon,
  children,
  shouldRotate = true,
  label,
  showBackground = true,
  customBackgroundColor,
}: ExpandableSliderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = useThemeColors();

  const chevronRotation = useRef(new Animated.Value(0)).current;

  const toggleExpanded = () => {
    if (shouldRotate) {
      Animated.timing(chevronRotation, {
        toValue: isExpanded ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    setIsExpanded((prev) => !prev);
  };

  const chevronInterpolate = chevronRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Card
      style={[
        styles.container,
        {
          backgroundColor: customBackgroundColor || colors.surface,
        }
      ]}
    >
      <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.7}>
        <Card.Title
          title={title}
          subtitle={label}
          titleStyle={{ color: colors.text }}
          subtitleStyle={{ color: colors.placeholder }}
          left={(props) => <List.Icon {...props} icon={icon} color={colors.primary} />}
          right={(props) => (
            <Animated.View style={{
              transform: [{ rotate: chevronInterpolate }],
              width: 24,
              height: 24,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: spacing(2)
            }}>
              <List.Icon {...props} icon="chevron-down" color={colors.primary} />
            </Animated.View>
          )}
        />
      </TouchableOpacity>

      {isExpanded && (
        <Card.Content style={{ paddingBottom: spacing(4) }}>
          <View
            style={[
              styles.contentWrapper,
              {
                backgroundColor: showBackground ? colors.surfaceVariant : 'transparent',
              },
            ]}
          >
            {children}
          </View>
        </Card.Content>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing(4),
    marginVertical: spacing(2),
    ...Shadows.medium,
  },
  contentWrapper: {
    borderRadius: BorderRadius.sm,
    padding: spacing(1),
  },
});
