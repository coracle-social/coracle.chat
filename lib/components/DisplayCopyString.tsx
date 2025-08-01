import { useThemeColors } from '@/lib/theme/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import { Text } from '@rneui/themed';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';


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
  const colors = useThemeColors();

  const handleCopy = async () => {
    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(value);
    } else {
      await Clipboard.setStringAsync(value);
    }
    setCopied(true);
    if (onCopy) onCopy(value);
    setTimeout(() => setCopied(false), 2000);
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
