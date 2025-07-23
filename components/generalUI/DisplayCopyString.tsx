import { useState } from 'react';
import { View, StyleSheet, Platform, Alert, TouchableOpacity } from 'react-native';
import { Text } from '@rneui/themed';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '@/lib/theme/ThemeContext';
import Colors from '@/core/env/Colors';
import * as Clipboard from 'expo-clipboard';


interface DisplayCopyStringProps {
  value: string;
  showCopyButton?: boolean;
  onCopy?: (value: string) => void;
}

export default function DisplayCopyString({
  value,
  showCopyButton = true,
  onCopy,
}: DisplayCopyStringProps) {
  const [copied, setCopied] = useState(false);
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const handleCopy = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(value);
      } else {
        await Clipboard.setStringAsync(value);
      }
      setCopied(true);
      if (onCopy) onCopy(value);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      Alert.alert('Error', 'Failed to copy text to clipboard');
    }
  };

  return (
    <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}>
      <View style={[
        styles.textContainer,
        {
          backgroundColor: colors.surfaceVariant,
          borderColor: colors.border,
        }
      ]}>
            <Text
              style={[
                styles.displayText,
                { color: colors.text }
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {value}
            </Text>
            {showCopyButton && (
              <View style={styles.copyButtonOverlay}>
                <Feather
                  name={copied ? "check" : "copy"}
                  size={16}
                  color={colors.text}
                />
                <Text style={[
                  styles.copyButtonText,
                  { color: colors.text }
                ]}>
                  {copied ? "Copied!" : "Copy"}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    position: 'relative',
    maxWidth: '100%',
  },
  displayText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
    lineHeight: 20,
    paddingRight: 80,
  },
  copyButtonOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 8,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
    gap: 4,
  },

  copyButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
