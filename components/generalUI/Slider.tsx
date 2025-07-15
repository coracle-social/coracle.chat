import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Text } from '@/components/theme/Themed';
import { useTheme } from '@/components/theme/ThemeContext';
import Colors from '@/constants/Colors';

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
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];
  
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;
  
  const imageSize = isMobile ? 60 : 50;

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }
    ]}>
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
      
      <View style={styles.textContainer}>
        <Text style={[
          styles.title,
          { color: colors.text }
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.description,
          { color: colors.text }
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
    borderWidth: 1,
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