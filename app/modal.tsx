import LoginModal from '@/lib/components/LoginModal';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ModalScreen() {
  const { context } = useLocalSearchParams<{ context?: string }>();

  const handleLoginSuccess = (userPubkey: string) => {
    console.log('Login successful with pubkey:', userPubkey);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LoginModal
        onLoginSuccess={handleLoginSuccess}
        context={context as 'login' | 'add-account' | undefined}
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
