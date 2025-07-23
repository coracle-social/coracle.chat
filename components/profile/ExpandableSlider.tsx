import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Text } from '@/lib/theme/Themed';
import { useTheme } from '@/lib/theme/ThemeContext';
import Colors from '@/core/env/Colors';
import Feather from '@expo/vector-icons/Feather';
import Slider from '@/components/generalUI/Slider';

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
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

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
          borderColor: colors.border,
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
                  backgroundColor: colors.primary,
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
          <Feather name={icon} size={20} color={colors.text} />
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
                borderColor: colors.border,
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
                borderColor: colors.border,
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
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  slidersWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 4,
  },
  labelContainer: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
