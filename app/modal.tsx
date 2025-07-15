import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/theme/ThemeContext';
import LoginModal from '@/components/generalUI/LoginModal';
import { router } from 'expo-router';
import { pubkey } from '@welshman/app';

export default function ModalScreen() {
  const { isDark } = useTheme();

  const handleLoginSuccess = (userPubkey: string) => {
    console.log('Login successful with pubkey:', userPubkey);
    // Set the pubkey in the store
    pubkey.set(userPubkey);
    // Close the modal and return to the previous screen
    router.back();
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <LoginModal 
        onLoginSuccess={handleLoginSuccess}
      />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
