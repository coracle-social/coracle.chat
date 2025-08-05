import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import Feather from '@expo/vector-icons/Feather';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { Card } from 'react-native-paper';

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
  const isIcon = !imageUrl.startsWith('http');
  const isDeleteButton = title === "Delete Profile";

  return (
    <Card
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceVariant,
        }
      ]}
      onPress={onPress}
    >
      <Card.Content style={styles.cardContent}>
        {isIcon ? (
          <View style={[
            styles.iconContainer,
            {
              width: imageSize,
              height: imageSize,
              backgroundColor: isDeleteButton ? colors.error : colors.primary,
            }
          ]}>
            <Feather
              name={imageUrl as any}
              size={24}
              color={colors.surface}
            />
          </View>
        ) : (
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              {
                width: imageSize,
                height: imageSize,
              }
            ]}
            resizeMode="cover"
          />
        )}

        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            { color: isDeleteButton ? colors.error : colors.text }
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
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  image: {
    borderRadius: 8,
    marginRight: 16,
  },
  iconContainer: {
    borderRadius: 8,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
