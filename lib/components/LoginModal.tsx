import { openUrl } from '@/core/commands/urlCommands';
import { LayoutPresets } from '@/core/env/LayoutPresets';
import { AppConfig } from '@/core/env/MetaConfig';
import { spacing } from '@/core/env/Spacing';
import { Typography } from '@/core/env/Typography';
import { OptionButton } from '@/lib/components/OptionButton';
import { StandardTextInput } from '@/lib/components/StandardTextInput';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { withBorderRadius, withShadow } from '@/lib/utils/styleUtils';
import { loginWithNip01, loginWithNip07, pubkey } from '@welshman/app';
import { getNip07 } from '@welshman/signer';
import { useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Alert, Keyboard, Platform, Pressable, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

interface LoginModalProps {
  onLoginSuccess?: (pubkey: string) => void;
  onClose?: () => void;
}

export default function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const colors = useThemeColors();

  const [currentPubkey] = useStore(pubkey);
  const [nip01PrivateKey, setNip01PrivateKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 1000);
  };

  const handleLogout = () => {
    pubkey.set(undefined);
    // Clear the global profile cache to prevent stale data
    const { profilesByPubkey } = require('@welshman/app');
    if (profilesByPubkey && typeof profilesByPubkey.clear === 'function') {
      profilesByPubkey.clear();
    } else if (profilesByPubkey && typeof profilesByPubkey.delete === 'function' && currentPubkey && typeof currentPubkey === 'string') {
      profilesByPubkey.delete(currentPubkey);
    }
    showSuccessMessage('Logged out successfully!');
  };

  const handleNip07Signin = async () => {
    try {
      setLoading(true);
      const nip07 = getNip07();
      if (!nip07) {
        Alert.alert('NIP-07 Not Available', 'NIP-07 extension not found. Please install a Nostr browser extension.');
        return;
      }

      const userPubkey = await nip07.getPublicKey();
      if (!userPubkey) {
        Alert.alert('Error', 'Failed to get public key from NIP-07 extension');
        return;
      }

      loginWithNip07(userPubkey);

      if (onLoginSuccess) {
        onLoginSuccess(userPubkey);
      }

      showSuccessMessage('Connected via NIP-07!');

    } catch (error) {
      console.error('NIP-07 signin error:', error);
      Alert.alert('Error', 'Failed to connect via NIP-07');
    } finally {
      setLoading(false);
    }
  };

  const handleNip01Signin = async () => {
    if (!nip01PrivateKey.trim()) {
      Alert.alert('Error', 'Please enter your private key');
      return;
    }

    try {
      setLoading(true);
      const privateKeyHex = nip01PrivateKey.trim();
      if (!/^[0-9a-fA-F]{64}$/.test(privateKeyHex)) {
        Alert.alert('Error', 'Invalid private key format. Please enter a 64-character hex string.');
        return;
      }

     loginWithNip01(privateKeyHex);

      if (onLoginSuccess) {
        onLoginSuccess(nip01PrivateKey);
      }

      showSuccessMessage('Connected via NIP-01!');

    } catch (error) {
      console.error('NIP-01 signin error:', error);
      Alert.alert('Error', 'Failed to connect via NIP-01');
    } finally {
      setLoading(false);
    }
  };

  const handleOutsidePress = () => {
    Keyboard.dismiss();
  };

  const isWeb = Platform.OS === 'web';
  const isMobile = Platform.OS !== 'web';
  const isLoggedIn = !!currentPubkey;

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableWithoutFeedback onPress={(e: GestureResponderEvent) => e.stopPropagation()}>
          <View style={styles.modalContent}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              WELCOME!
            </Text>

            <Pressable onPress={() => openUrl('https://nostr.com')} style={styles.linkContainer}>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                {AppConfig.APP_NAME} is built on the{' '}
                <Text style={styles.underline}>nostr protocol</Text>
              </Text>
            </Pressable>

            {successMessage ? (
              <View style={[styles.successBox, { backgroundColor: colors.primary }]}>
                <Text style={[styles.successText, { color: colors.surface }]}>
                  {successMessage}
                </Text>
              </View>
            ) : isLoggedIn ? (
              <View style={[styles.signinBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <OptionButton
                  title="Logout"
                  onPress={handleLogout}
                  icon="log-out"
                  variant="danger"
                  size="large"
                  disabled={loading}
                />
              </View>
            ) : (
              <>
                {isWeb && (
                  <View style={[styles.signinBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <OptionButton
                      title={loading ? 'Signing in...' : 'Sign in with Extension'}
                      onPress={handleNip07Signin}
                      icon="log-in"
                      variant="primary"
                      size="large"
                      disabled={loading}
                    />
                    <Text style={[styles.helperText, { color: colors.placeholder }]}>
                      Requires a Nostr browser extension
                    </Text>
                  </View>
                )}

                {isMobile && (
                  <View style={[styles.signinBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <StandardTextInput
                      placeholder="Enter your private key (NIP-01)"
                      value={nip01PrivateKey}
                      onChangeText={setNip01PrivateKey}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{
                        backgroundColor: colors.surfaceVariant,
                        borderColor: colors.border,
                        marginBottom: spacing(4)
                      }}
                    />
                    <OptionButton
                      title={loading ? 'Signing in...' : 'Sign in with NIP-01'}
                      onPress={handleNip01Signin}
                      icon="key"
                      variant="primary"
                      size="large"
                      disabled={loading || !nip01PrivateKey.trim()}
                    />
                    <Text style={[styles.helperText, { color: colors.placeholder }]}>
                      Enter your private key (64-character hex)
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...LayoutPresets.center,
    paddingHorizontal: spacing(10),
    paddingVertical: spacing(15),
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    ...LayoutPresets.center,
  },
  welcomeText: {
    ...Typography.titleHuge,
    marginBottom: spacing(5),
    textAlign: 'center',
  },
  linkContainer: {
    marginBottom: spacing(10),
  },
  linkText: {
    ...Typography.bodyLarge,
    textAlign: 'center',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  signinBox: {
    width: '100%',
    maxWidth: 400,
    padding: spacing(6),
    ...withBorderRadius('lg'),
    borderWidth: 1,
    marginBottom: spacing(5),
    alignItems: 'center',
    ...withShadow('medium'),
  },
  successBox: {
    width: '100%',
    maxWidth: 400,
    padding: spacing(4),
    ...withBorderRadius('md'),
    marginBottom: spacing(5),
    alignItems: 'center',
    ...withShadow('medium'),
  },
  successText: {
    ...Typography.button,
    textAlign: 'center',
  },


  helperText: {
    ...Typography.helper,
    textAlign: 'center',
    marginTop: spacing(1),
  },
});
