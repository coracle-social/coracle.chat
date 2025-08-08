import { spacing } from '@/core/env/Spacing';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { View } from '@/lib/theme/Themed';
import { pubkey, sessions, userProfile } from '@welshman/app';
import { displayPubkey } from '@welshman/util';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, FAB, List } from 'react-native-paper';
import { OptionButton } from './OptionButton';

interface ProfileSwitcherProps {}

export default function ProfileSwitcher({}: ProfileSwitcherProps) {
  const colors = useThemeColors();
  const [allSessions] = useStore(sessions);
  const [currentPubkey] = useStore(pubkey);
  const [currentProfile] = useStore(userProfile);
  const [isVisible, setIsVisible] = useState(false);
  const [showAllProfiles, setShowAllProfiles] = useState(false);

  const handleSwitchProfile = (targetPubkey: string) => {
    pubkey.set(targetPubkey);
    setShowAllProfiles(false);
  };

  const handleAddAccount = () => {
    setIsVisible(false);
    setShowAllProfiles(false);
    // Navigate to login modal with add-account context
    router.push('/modal?context=add-account');
  };
  // Sort session entries to put current profile first
  const sessionEntries = Object.entries(allSessions || {}).sort(([pubkeyA], [pubkeyB]) => {
    if (pubkeyA === currentPubkey) return -1;
    if (pubkeyB === currentPubkey) return 1;
    return 0;
  });

  // Don't show FAB if no accounts
  if (!allSessions || Object.keys(allSessions).length === 0) {
    return null;
  }

  const hasMultipleAccounts = Object.keys(allSessions).length > 1;

  return (
    <>
      {/* Floating Action Button */}
      <FAB
        icon={isVisible ? "close" : "account-switch"}
        style={[
          styles.fab,
          { backgroundColor: colors.primary }
        ]}
        onPress={() => setIsVisible(!isVisible)}
      />

      {/* Profile Switcher Popup */}
              {isVisible && (
          <View style={styles.popupContainer}>
           <View style={[styles.popup, { backgroundColor: 'transparent'}]}>
              {hasMultipleAccounts && (
                <Button
                  mode="contained"
                  onPress={() => setShowAllProfiles(!showAllProfiles)}
                  icon={({ color }) => (
                      <List.Icon
                        icon={showAllProfiles ? "chevron-down" : "dots-horizontal"}
                        color={colors.text}
                      />
                  )}
                  style={{ backgroundColor: 'transparent', alignSelf: 'center' }}
                  contentStyle={{ flexDirection: 'row', justifyContent: 'center', backgroundColor: 'transparent' }}
                  compact
                  >
                  {""}
                  </Button>
              )}

            <ScrollView style={{ backgroundColor: 'transparent' }} showsVerticalScrollIndicator={false}>
                {(hasMultipleAccounts && !showAllProfiles ? sessionEntries.slice(0, 1) : sessionEntries).map(([pubkey, session]) => (
                    <Card
                    key={pubkey}
                    style={[
                        styles.accountItem,
                        {
                        backgroundColor: colors.surfaceVariant,
                        borderColor: pubkey === currentPubkey ? colors.primary : colors.border,
                        }
                    ]}
                    onPress={() => handleSwitchProfile(pubkey)}
                    >
                        <List.Item
                        title={pubkey === currentPubkey && currentProfile?.name ? currentProfile.name : displayPubkey(pubkey)}
                        description={`${session.method.toUpperCase()} •`}
                        left={props => (
                            pubkey === currentPubkey && currentProfile?.picture ? (
                                <View style={styles.profileImageContainer}>
                                    <List.Image
                                        {...props}
                                        source={{ uri: currentProfile.picture }}
                                    />
                                </View>
                            ) : (
                                <List.Icon
                                    {...props}
                                    icon={pubkey === currentPubkey ? "check-circle" : "account"}
                                    color={pubkey === currentPubkey ? colors.primary : colors.placeholder}
                                />
                            )
                        )}
                        titleStyle={[
                            styles.accountTitle,
                            { color: colors.text }
                        ]}
                        descriptionStyle={[
                            styles.accountDescription,
                            { color: colors.placeholder }
                        ]}
                        style={styles.listItem}
                        />
                    </Card>
                ))}

                <View style={[styles.addAccountSection, { backgroundColor: 'transparent' }]}>
                <OptionButton
                    title="Add Account"
                    icon="plus"
                    variant="primary"
                    size="large"
                    onPress={handleAddAccount}
                />
                </View>
            </ScrollView>

          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  popupContainer: {
    position: 'absolute',
    bottom: 80, // Position above the FAB
    right: 16,
    backgroundColor: 'transparent',
  },
  header: {
    padding: spacing(2),
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  accountItem: {
    marginHorizontal: spacing(2),
    marginVertical: spacing(1),
    borderRadius: 8,
    borderWidth: 1,
  },
  listItem: {
    paddingVertical: spacing(0.5),
  },
  accountTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  popup: {
    borderRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  accountDescription: {
    fontSize: 10,
    marginTop: spacing(0.5),
  },
  addAccountSection: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  profileImageContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 16, // Align with icon positioning
  },
});
