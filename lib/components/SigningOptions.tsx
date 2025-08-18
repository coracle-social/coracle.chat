import { spacing } from '@/core/env/Spacing';
import { Typography } from '@/core/env/Typography';
import AuthContainer from '@/lib/components/AuthContainer';
import { OptionButton } from '@/lib/components/OptionButton';
import { StandardTextInput } from '@/lib/components/StandardTextInput';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text, View } from '@/lib/theme/Themed';
import { loginWithNip01, loginWithNip07 } from '@welshman/app';
import { Nip46Broker, getNip07, makeSecret } from '@welshman/signer';
import { useState } from 'react';
import { Alert, Platform, StyleSheet } from 'react-native';

interface SigningOptionsProps {
  context?: 'login' | 'add-account';
  onLoginSuccess?: (pubkey: string) => void;
  onSuccessMessage?: (message: string) => void;
}

export default function SigningOptions({ context = 'login', onLoginSuccess, onSuccessMessage }: SigningOptionsProps) {
  const colors = useThemeColors();
  const [nip01PrivateKey, setNip01PrivateKey] = useState('');
  const [loading, setLoading] = useState(false);

  const showSuccessMessage = (message: string) => {
    onSuccessMessage?.(message);
  };

  const handleBunkerSignin = async () => {
    try {
      setLoading(true);
      const bunkerUrl = "bunker://[pubkey]?relay=wss://relay.nsec.app&secret=[secret]"
      const { signerPubkey, connectSecret, relays } = Nip46Broker.parseBunkerUrl(bunkerUrl)
      const clientSecret = makeSecret()
      const broker = new Nip46Broker({ relays, clientSecret, signerPubkey })
      const result = await broker.connect(connectSecret, "sign_event:22242,nip04_encrypt,nip04_decrypt,nip44_encrypt,nip44_decrypt")

      // Handle successful connection
      if (onLoginSuccess) {
        onLoginSuccess(signerPubkey);
      }
      showSuccessMessage('Connected via NIP-46!');
    } catch (error) {
      console.error('NIP-46 signin error:', error);
      Alert.alert('Error', 'Failed to connect via NIP-46 bunker');
    } finally {
      setLoading(false);
    }
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

  const isWeb = Platform.OS === 'web';
  const isMobile = Platform.OS !== 'web';

  if (context === 'add-account') {
    // Add Account Mode - only show signing options
    return (
      <>
        {isWeb && (
          <View style={{flexDirection: 'column', gap: spacing(3)}}>
          <AuthContainer>
            <OptionButton
              title={loading ? 'Signing in...' : 'Add Extension Account'}
              onPress={handleNip07Signin}
              icon="log-in"
              variant="primary"
              size="large"
              disabled={loading}
            />
            <Text style={[styles.helperText, { color: colors.placeholder }]}>
              Requires a Nostr browser extension
            </Text>
          </AuthContainer>
          <AuthContainer>
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
        </AuthContainer>
        </View>
        )}

        {isMobile && (
          <AuthContainer>
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
              title={loading ? 'Signing in...' : 'Add NIP-01 Account'}
              onPress={handleNip01Signin}
              icon="key"
              variant="primary"
              size="large"
              disabled={loading || !nip01PrivateKey.trim()}
            />
            <Text style={[styles.helperText, { color: colors.placeholder }]}>
              Enter your private key (64-character hex)
            </Text>
          </AuthContainer>
        )}
      </>
    );
  }

  // Regular login mode - show all options
  return (
    <>
      {isWeb && (
        <View style={{flexDirection: 'column', gap: spacing(3)}}>
          <AuthContainer>
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
          </AuthContainer>
          <AuthContainer>
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
        </AuthContainer>
        </View>
      )}

      {isMobile && (
        <AuthContainer>
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
        </AuthContainer>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  helperText: {
    ...Typography.helper,
    textAlign: 'center',
    marginTop: spacing(1),
    marginBottom: spacing(5),
  },
});
