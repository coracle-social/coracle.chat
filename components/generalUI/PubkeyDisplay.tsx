import DisplayCopyString from '@/components/generalUI/DisplayCopyString';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PubkeyDisplayProps {
  pubkey: string;
  showLabel?: boolean;
  label?: string;
  onCopy?: (value: string) => void;
}

export const PubkeyDisplay: React.FC<PubkeyDisplayProps> = ({
  pubkey,
  showLabel = true,
  label = 'Public Key',
  onCopy,
}) => {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';

  const handleCopy = (value: string) => {
    console.log('Public key copied:', value);
    if (onCopy) {
      onCopy(value);
    }
  };

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          {label}
        </Text>
      )}
      <DisplayCopyString
        value={pubkey}
        onCopy={handleCopy}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
});
