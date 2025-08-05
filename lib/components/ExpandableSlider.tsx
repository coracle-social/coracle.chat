import { BorderRadius } from '@/core/env/BorderRadius';
import { Shadows } from '@/core/env/Shadows';
import { spacing } from '@/core/env/Spacing';
import Slider from '@/lib/components/Slider';
import { useThemeColors } from '@/lib/theme/ThemeContext';
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
import { Card, List } from 'react-native-paper';

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
    <Card
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
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
        <Card.Content style={{ paddingBottom: spacing(4) }}>
          <View
            style={[
              styles.slidersWrapper,
              {
                backgroundColor: colors.surfaceVariant,
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
        </Card.Content>
      </View>

      <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
        <Card.Content style={{ paddingBottom: spacing(4) }}>
          <View
            style={[
              styles.slidersWrapper,
              {
                backgroundColor: colors.surfaceVariant,
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
        </Card.Content>
      </Animated.View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing(4),
    marginVertical: spacing(2),
    ...Shadows.medium,
  },
  slidersWrapper: {
    borderRadius: BorderRadius.sm,
    padding: spacing(1),
  },
});
