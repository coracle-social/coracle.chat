import { useThemeColors } from '@/lib/theme/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { OptionButton } from './OptionButton';

interface ButtonConfig {
  title: string;
  onPress: () => void;
  icon: string;
  color: string;
}

interface SlideOutOptionsProps {
  icon: string;
  alignment?: 'left' | 'right';
  buttons: ButtonConfig[];
}

export default function SlideOutOptions({
  icon,
  alignment = 'left',
  buttons,
}: SlideOutOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const colors = useThemeColors();

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(slideAnimation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const slideInterpolate = slideAnimation.interpolate({
    inputRange: [0, 1],
    //instead of dynamically calculating buttons which is annoying
    //just move it very far off screen
    outputRange: alignment === 'right' ? [0, -1000] : [1000, 0], // Slide from off-screen to visible
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.optionsContainer,
          {
            transform: [{ translateX: slideInterpolate }],
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {buttons.map((button, index) => (
          <OptionButton
            key={index}
            title={button.title}
            onPress={() => {
              button.onPress();
              toggleExpanded();
            }}
            icon={button.icon}
            variant="secondary"
            size="medium"
          />
        ))}
      </Animated.View>

      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: colors.primary,
            borderColor: colors.border,
          },
        ]}
        onPress={toggleExpanded}
      >
        <Feather name={icon as any} size={20} color={colors.surface} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  optionsContainer: {
    position: 'absolute',
    top: 0,
    right: 50, // Position options to the left of the button
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    gap: 8,
    zIndex: 1000,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
