import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import { View, Text, StyleSheet, TextInput, Pressable, Linking, Alert, Platform, TouchableWithoutFeedback } from 'react-native';
import { Button } from '@rneui/themed';
import { useTheme } from '@/lib/theme/ThemeContext';
import Colors from '@/core/env/Colors';
import { AppConfig } from '@/core/env/MetaConfig';
import { getNip07 } from '@welshman/signer';
import { pubkey } from '@welshman/app';
import { loginWithNip07, loginWithNip01 } from '@welshman/app';
import { useStore } from '@/stores/useWelshmanStore2';
import type { GestureResponderEvent } from 'react-native';

interface LoginModalProps {
  onLoginSuccess?: (pubkey: string) => void;
  onClose?: () => void;
}

export default function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const [currentPubkey] = useStore(pubkey);
  const [nip01PrivateKey, setNip01PrivateKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 650);
  };

  const handleLogout = () => {
    pubkey.set(undefined);
    // Clear the global profile cache to prevent stale data
    try {
      const { profilesByPubkey } = require('@welshman/app');
      if (profilesByPubkey && typeof profilesByPubkey.clear === 'function') {
        profilesByPubkey.clear();
      } else if (profilesByPubkey && typeof profilesByPubkey.delete === 'function' && currentPubkey && typeof currentPubkey === 'string') {
        profilesByPubkey.delete(currentPubkey);
      }
    } catch (e) {
      console.warn('Could not clear profile cache:', e);
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

  const openNostrLink = () => {
    Linking.openURL('https://nostr.com').catch(() => {
      Alert.alert('Error', 'Could not open nostr.com');
    });
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

            <Pressable onPress={openNostrLink} style={styles.linkContainer}>
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
                <Button
                  title="Logout"
                  onPress={handleLogout}
                  disabled={loading}
                  buttonStyle={[styles.signinButton, { backgroundColor: '#dc3545' }]}
                  titleStyle={[styles.buttonText, { color: colors.surface }]}
                  containerStyle={styles.buttonContainer}
                />
              </View>
            ) : (
              <>
                {isWeb && (
                  <View style={[styles.signinBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Button
                      title={loading ? 'Signing in...' : 'Sign in with Extension'}
                      onPress={handleNip07Signin}
                      disabled={loading}
                      buttonStyle={[styles.signinButton, { backgroundColor: colors.primary }]}
                      titleStyle={[styles.buttonText, { color: colors.surface }]}
                      containerStyle={styles.buttonContainer}
                    />
                    <Text style={[styles.helperText, { color: colors.placeholder }]}>
                      Requires a Nostr browser extension
                    </Text>
                  </View>
                )}

                {isMobile && (
                  <View style={[styles.signinBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.textInput, {
                        color: colors.text,
                        backgroundColor: colors.surfaceVariant,
                        borderColor: colors.border
                      }]}
                      placeholder="Enter your private key (NIP-01)"
                      placeholderTextColor={colors.placeholder}
                      value={nip01PrivateKey}
                      onChangeText={setNip01PrivateKey}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Button
                      title={loading ? 'Signing in...' : 'Sign in with NIP-01'}
                      onPress={handleNip01Signin}
                      disabled={loading || !nip01PrivateKey.trim()}
                      buttonStyle={[styles.signinButton, { backgroundColor: colors.primary }]}
                      titleStyle={[styles.buttonText, { color: colors.surface }]}
                      containerStyle={styles.buttonContainer}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  linkContainer: {
    marginBottom: 40,
  },
  linkText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  signinBox: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  successBox: {
    width: '100%',
    maxWidth: 400,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  textInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  signinButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});