import { BorderRadius } from '@/core/env/BorderRadius';
import { Shadows } from '@/core/env/Shadows';
import { spacing } from '@/core/env/Spacing';
import { Typography } from '@/core/env/Typography';
import Slider from '@/lib/components/Slider';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import Feather from '@expo/vector-icons/Feather';
import React, { useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

interface SliderItem {
  imageUrl: string;
  title: string;
  description: string;
  onPress?: () => void;
}

interface ExpandableSliderProps {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  sliders: SliderItem[];
  shouldRotate?: boolean;
  label?: string;
}

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ExpandableSlider({
  title,
  icon,
  sliders,
  shouldRotate = true,
  label,
}: ExpandableSliderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const colors = useThemeColors();

  const chevronRotation = useRef(new Animated.Value(0)).current;

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const finalValue = isExpanded ? 0 : contentHeight;

    Animated.timing(animatedHeight, {
      toValue: finalValue,
      duration: 200,
      useNativeDriver: false, //necessary for height animation
    }).start();

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
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
          borderWidth: 2,
          shadowColor: colors.text,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.titleContainer}>
          {label && (
            <View
              style={[
                styles.labelContainer,
                {
                  backgroundColor: colors.secondary,
                },
              ]}
            >
              <Text style={[styles.labelText, { color: colors.surface }]}>
                {label}
              </Text>
            </View>
          )}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: chevronInterpolate }] }}>
          <Feather name={icon} size={20} color={colors.primary} />
        </Animated.View>
      </TouchableOpacity>

      <View
        style={{ position: 'absolute', opacity: 0, zIndex: -1 }}
        pointerEvents="none"
        onLayout={(event) => {
          const height = event.nativeEvent.layout.height;
          if (contentHeight === 0) {
            setContentHeight(height);
            animatedHeight.setValue(isExpanded ? height : 0); // set initial height if already expanded
          }
        }}
      >
        <View style={styles.contentContainer}>
          <View
            style={[
              styles.slidersWrapper,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.secondary,
                borderWidth: 1,
              },
            ]}
          >
            {sliders.map((slider, index) => (
              <Slider
                key={index}
                imageUrl={slider.imageUrl}
                title={slider.title}
                description={slider.description}
                onPress={slider.onPress}
              />
            ))}
          </View>
        </View>
      </View>

      <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
        <View style={styles.contentContainer}>
          <View
            style={[
              styles.slidersWrapper,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.secondary,
                borderWidth: 1,
              },
            ]}
          >
            {sliders.map((slider, index) => (
              <Slider
                key={index}
                imageUrl={slider.imageUrl}
                title={slider.title}
                description={slider.description}
                onPress={slider.onPress}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing(4),
    marginVertical: spacing(2),
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(4),
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    ...Typography.button,
  },
  contentContainer: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(4),
  },
  slidersWrapper: {
    borderRadius: BorderRadius.sm,
    padding: spacing(1),
  },
  labelContainer: {
    paddingVertical: spacing(0.5),
    paddingHorizontal: spacing(1.5),
    borderRadius: BorderRadius.xs,
    marginBottom: spacing(1),
  },
  labelText: {
    ...Typography.caption,
  },
});
