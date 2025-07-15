import { useState} from 'react';
import { Keyboard } from 'react-native';
import { View, Text, StyleSheet, TextInput, Pressable, Linking, Alert, Platform, TouchableWithoutFeedback } from 'react-native';
import { Button } from '@rneui/themed';
import { useTheme } from '../theme/ThemeContext';
import Colors from '@/constants/Colors';
import { getNip07 } from '@welshman/signer';
import { addSession, SessionMethod } from '@welshman/app';
import { getPublicKey } from 'nostr-tools';
import { defaultSocketPolicies, makeSocketPolicyAuth } from '@welshman/net';
import { signer } from '@welshman/app';
import { StampedEvent } from '@welshman/util';

interface LoginModalProps {
  onLoginSuccess?: (pubkey: string) => void;
  onClose?: () => void;
}

export default function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];
  
  const [nip01PrivateKey, setNip01PrivateKey] = useState('');
  const [loading, setLoading] = useState(false);

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
      
      addSession({ method: SessionMethod.Nip07, pubkey: userPubkey });
      
      if (onLoginSuccess) {
        onLoginSuccess(userPubkey);
      }
      
      Alert.alert('Success', 'Connected via NIP-07!');

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
      
      // Convert hex string to Uint8Array for nostr-tools
      const privateKeyBytes = new Uint8Array(
        privateKeyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );
      
      const userPubkey = getPublicKey(privateKeyBytes);
      if (!userPubkey) {
        Alert.alert('Error', 'Failed to derive public key from private key');
        return;
      }
      
      addSession({ method: SessionMethod.Nip01, pubkey: userPubkey, secret: privateKeyHex });
      
      // Set up router authentication for NIP-01 (same as NIP-07)
      defaultSocketPolicies.push(
        makeSocketPolicyAuth({
          sign: (event: StampedEvent) => signer.get()?.sign(event),
          shouldAuth: () => true,
        })
      );
      
      console.log('[NIP-01] Router authentication set up for profile loading');
      
      // Configure router with default relays for the user
      const { Router } = require('@welshman/router');
      const defaultRelays = ["wss://relay.damus.io/", "wss://nos.lol/"];
      
      // Set up relay configuration for the user using the router's default relays
      const router = Router.get();
      router.options.getDefaultRelays = () => {
        console.log('[NIP-01] Getting default relays');
        return defaultRelays;
      };
      
      // Set up getUserPubkey to return the current user's pubkey
      router.options.getUserPubkey = () => {
        console.log('[NIP-01] Getting user pubkey:', userPubkey);
        return userPubkey;
      };
      
      console.log('[NIP-01] Router configured with relays for user:', defaultRelays);
      
      // Debug: Check router state after setup
      console.log('[NIP-01] Router state after session:', router);
      console.log('[NIP-01] Router ForUser relays:', router.ForUser().getUrls());
      console.log('[NIP-01] Router FromUser relays:', router.FromUser().getUrls());
      
      if (onLoginSuccess) {
        onLoginSuccess(userPubkey);
      }
      
      Alert.alert('Success', 'Connected via NIP-01!');

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

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableWithoutFeedback onPress={(e: any) => e.stopPropagation()}>
          <View style={styles.modalContent}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              WELCOME!
            </Text>
            
            <Pressable onPress={openNostrLink} style={styles.linkContainer}>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                CoracleChat is built on the{' '}
                <Text style={styles.underline}>nostr protocol</Text>
              </Text>
            </Pressable>
            
            {isWeb && (
              <View style={[styles.signinBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Button
                  title={loading ? 'Signing in...' : 'Sign in with NIP-07 (Browser)'}
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