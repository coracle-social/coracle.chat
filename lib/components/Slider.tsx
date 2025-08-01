import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

interface SliderProps {
  imageUrl: string;
  title: string;
  description: string;
  onPress?: () => void;
}

export default function Slider({
  imageUrl,
  title,
  description,
  onPress,
}: SliderProps) {
  const colors = useThemeColors();

  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  const imageSize = isMobile ? 60 : 50;

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.surfaceVariant,
      }
    ]}>
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          {
            width: imageSize,
            height: imageSize,
            borderColor: colors.secondary,
            borderWidth: 2,
          }
        ]}
        resizeMode="cover"
      />

      <View style={styles.textContainer}>
        <Text style={[
          styles.title,
          { color: colors.text }
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.description,
          { color: colors.placeholder }
        ]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  image: {
    borderRadius: 8,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
