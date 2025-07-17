import { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Animated,
  UIManager,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useTheme } from '@/components/theme/ThemeContext';
import Colors from '@/constants/Colors';

interface SlideOutOptionsProps {
  icon?: string;
  iconType?: string;
  alignment?: 'left' | 'right';
  buttons: Array<{
    title: string;
    onPress: () => void;
    icon?: string;
    iconType?: string;
    color?: string;
  }>;
  iconSize?: number;
}

export default function SlideOutOptions({
  icon = 'more-vert',
  iconType = 'material',
  alignment = 'right',
  buttons,
  iconSize = 24,
}: SlideOutOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderButtons, setShouldRenderButtons] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  // Enable LayoutAnimation for Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const directionMultiplier = alignment === 'right' ? 1 : -1;

  const toggleSlide = () => {
    if (!isOpen) {
      setShouldRenderButtons(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setIsOpen(true);
      });
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsOpen(false);
        setShouldRenderButtons(false); // hide buttons after animation
      });
    }
  };

  const handleButtonPress = (button: { title: string; onPress: () => void; icon?: string; iconType?: string; color?: string }) => {
    button.onPress();
    toggleSlide();
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60 * directionMultiplier],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={[styles.wrapper, alignment === 'right' ? styles.row : styles.rowReverse]}>
      <TouchableOpacity style={styles.iconContainer} onPress={toggleSlide}>
        <Icon name={icon} type={iconType} size={iconSize} color={colors.text} />
      </TouchableOpacity>

      {shouldRenderButtons && (
        <Animated.View
          style={[
            styles.slideContainer,
            {
              transform: [{ translateX }],
              opacity,
              flexDirection: 'row',
            },
          ]}
          pointerEvents={isOpen ? 'auto' : 'none'}
        >
          {buttons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.button,
                { backgroundColor: button.color || colors.primary },
              ]}
              onPress={() => handleButtonPress(button)}
            >
              {button.icon && (
                <Icon
                  name={button.icon}
                  type={button.iconType || 'material'}
                  size={14}
                  color={colors.surface}
                  style={styles.buttonIcon}
                />
              )}
              <Text style={[styles.buttonText, { color: colors.surface }]}>
                {button.title}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 1000,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  slideContainer: {
    marginHorizontal: 8,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
