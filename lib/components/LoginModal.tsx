import { openUrl } from '@/core/commands/urlCommands';
import { LayoutPresets } from '@/core/env/LayoutPresets';
import { AppConfig } from '@/core/env/MetaConfig';
import { spacing } from '@/core/env/Spacing';
import { Typography } from '@/core/env/Typography';
import { OptionButton } from '@/lib/components/OptionButton';
import SigningOptions from '@/lib/components/SigningOptions';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { withBorderRadius, withShadow } from '@/lib/utils/styleUtils';
import { pubkey, sessions } from '@welshman/app';
import { useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Keyboard, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

interface LoginModalProps {
  onLoginSuccess?: (pubkey: string) => void;
  onClose?: () => void;
  context?: 'login' | 'add-account';
}

export default function LoginModal({ onLoginSuccess, context = 'login' }: LoginModalProps) {
  const colors = useThemeColors();
  const [currentPubkey] = useStore(pubkey);
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 1000);
  };

  const handleLogout = () => {
    // Remove current session from sessions store
    if (currentPubkey) {
      const currentSessions = sessions.get();
      if (currentSessions && currentSessions[currentPubkey]) {
        const updatedSessions = { ...currentSessions };
        delete updatedSessions[currentPubkey];
        sessions.set(updatedSessions);
      }
    }

    pubkey.set(undefined);
    showSuccessMessage('Logged out successfully!');
  };

  const handleLogoutAll = () => {
    // Clear all sessions
    sessions.set({});
    pubkey.set(undefined);
    showSuccessMessage('Logged out of all accounts!');
  };

  const handleOutsidePress = () => {
    Keyboard.dismiss();
  };

  const isLoggedIn = !!currentPubkey;
  const [allSessions] = useStore(sessions);
  const hasMultipleAccounts = allSessions && Object.keys(allSessions).length > 1;

  return (
    <TouchableOpacity onPress={handleOutsidePress}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={(e: GestureResponderEvent) => e.stopPropagation()}>
          <View style={styles.modalContent}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              {context === 'add-account' ? 'ADD ACCOUNT' : 'WELCOME!'}
            </Text>

            {context === 'login' && (
              <Pressable onPress={() => openUrl('https://nostr.com')} style={styles.linkContainer}>
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  {AppConfig.APP_NAME} is built on the{' '}
                  <Text style={styles.underline}>nostr protocol</Text>
                </Text>
              </Pressable>
            )}

                        {successMessage ? (
              <View style={[styles.successBox, { backgroundColor: colors.primary }]}>
                <Text style={[styles.successText, { color: colors.surface }]}>
                  {successMessage}
                </Text>
              </View>
            ) : context === 'add-account' ? (
              <SigningOptions
                context={context}
                onLoginSuccess={onLoginSuccess}
                onSuccessMessage={showSuccessMessage}
              />
            ) : isLoggedIn ? (
              <>
                <OptionButton
                  title="Logout"
                  onPress={handleLogout}
                  icon="log-out"
                  variant="secondary"
                  size="large"
                />
                {hasMultipleAccounts && (
                  <OptionButton
                    title="Logout of All Accounts"
                    onPress={handleLogoutAll}
                    icon="log-out"
                    variant="secondary"
                    size="large"
                    style={{ marginTop: spacing(2) }}
                  />
                )}
              </>
            ) : (
              <SigningOptions
                context={context}
                onLoginSuccess={onLoginSuccess}
                onSuccessMessage={showSuccessMessage}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...LayoutPresets.center,
    paddingHorizontal: spacing(10),
    paddingVertical: spacing(10),
    paddingBottom: spacing(100), //temporary to extend the modal to the bottom of the screen
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
});
