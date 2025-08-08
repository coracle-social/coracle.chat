import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Card, IconButton } from 'react-native-paper';

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
            flexDirection: 'row',
            gap: 1,
          },
        ]}
      >
        {buttons.map((button, index) => (
          <Card key={index} style={{ backgroundColor: colors.surface }}>
            <Card.Content style={{ padding: 4, alignItems: 'center', justifyContent: 'center'}}>
              <IconButton
                icon="plus"
                iconColor={colors.primary}
                size={20}
                onPress={() => {
                  button.onPress();
                  toggleExpanded();
                }}
              />
              <Text style={{ color: colors.text, fontSize: 8, textAlign: 'center' }}>
                Add {button.title}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </Animated.View>

      <IconButton
        icon={icon}
        iconColor={colors.text}
        size={20}
        onPress={toggleExpanded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  optionsContainer: {
    position: 'absolute',
    right: 50,
    alignSelf: 'center',
    zIndex: 1000,
  },
});
