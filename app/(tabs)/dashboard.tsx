import { SearchInput } from '@/components/search/SearchInput';
import SolarIcon from '@/components/SolarIcons';
import { HStack } from '@/lib/components/HStack';
import { WebContainer } from '@/lib/components/WebContainer';
import { usePopup } from '@/lib/hooks/usePopup';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text, View } from '@/lib/theme/Themed';
import { useState } from 'react';
import { View as RNView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
// import NostrTest from '@/tests/integration/NostrTest';
// import * as tsm from '../../ts-mls/src/index';
// console.log(Object.keys(tsm));
// import { MlsManager } from '@/lib/utils/MlsManager';
// import type { Extension } from '@ts-mls/extension';

// Test function for getCiphersuiteImpl
async function testGetCiphersuiteImpl() {
  try {
    // Mock ciphersuite object for testing
    const mockCiphersuite = {
      name: 'test-cs',
      hpke: {
        kdf: 'HKDF-SHA256'
      },
      hash: 'SHA-256',
      signature: 'Ed25519'
    };

    // Mock implementation of getCiphersuiteImpl
    async function getCiphersuiteImpl(
      cs: any,
      provider: "webcrypto" | "noble" = "webcrypto"
    ): Promise<any> {
      if (provider === "noble") {
        console.log('Using noble provider for:', cs.name);
        // Mock noble implementation
        return {
          name: cs.name,
          provider: 'noble',
          kdf: 'noble-kdf',
          hash: 'noble-hash',
          signature: 'noble-signature',
          hpke: 'noble-hpke',
          rng: 'noble-rng'
        };
      } else {
        console.log('Using webcrypto provider for:', cs.name);
        // Mock webcrypto implementation
        return {
          kdf: 'webcrypto-kdf',
          hash: 'webcrypto-hash',
          signature: 'webcrypto-signature',
          hpke: 'webcrypto-hpke',
          rng: 'webcrypto-rng',
          name: cs.name,
        };
      }
    }

    console.log('Testing getCiphersuiteImpl...');

    // Test with webcrypto provider
    const webcryptoResult = await getCiphersuiteImpl(mockCiphersuite, 'webcrypto');
    console.log('WebCrypto result:', webcryptoResult);

    // Test with noble provider
    const nobleResult = await getCiphersuiteImpl(mockCiphersuite, 'noble');
    console.log('Noble result:', nobleResult);

    // Test with default provider
    const defaultResult = await getCiphersuiteImpl(mockCiphersuite);
    console.log('Default result:', defaultResult);

    alert('Check console for test results!');
  } catch (error) {
    console.error('Error testing getCiphersuiteImpl:', error);
    alert('Error occurred - check console');
  }
}
//test, then undefine crypto make sure reg ciphersuite errors

export default function DashboardScreen() {
  const { showPopup } = usePopup();
  const colors = useThemeColors();
  const [otherPubkey, setOtherPubkey] = useState('');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('updates');

  const openPortalModal = (modalType: string) => {
    showPopup(modalType);
  };

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    // TODO: Implement search functionality
    console.log('Searching for:', text);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'updates':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabText, { color: colors.text }]}>Updates Content</Text>
          </View>
        );
      case 'notifications':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabText, { color: colors.text }]}>Notifications Content</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const CustomTab = ({ value, label, icon, isActive, onPress }: {
    value: string;
    label: string;
    icon: string;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.customTab,
        {
          backgroundColor: 'transparent',
          borderColor: isActive ? colors.primary : 'rgba(0, 0, 0, 0.12)'
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <HStack spacing={0}>
        <SolarIcon
          name={icon}
          size={20}
          color={isActive ? colors.primary : colors.text}
        />
        <Text style={[
          styles.tabLabel,
          { color: isActive ? colors.primary : colors.text }
        ]}>
          {label}
        </Text>
      </HStack>
      {isActive && (
        <View style={[styles.tabUnderline, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[styles.scrollContainer, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <WebContainer style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchInput
            value={searchTerm}
            onChangeText={handleSearch}
            placeholder="Search dashboard..."
            onClear={clearSearch}
            autoFocus={false}
          />
        </View>

        {/* Custom Tab Segments */}
        <View style={styles.tabContainer}>
          <View style={styles.tabWrapper}>
            <CustomTab
              value="updates"
              label="Updates"
              icon="History"
              isActive={activeTab === 'updates'}
              onPress={() => setActiveTab('updates')}
            />
            <CustomTab
              value="notifications"
              label="Notifications"
              icon="Bell"
              isActive={activeTab === 'notifications'}
              onPress={() => setActiveTab('notifications')}
            />
          </View>
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        <RNView style={[styles.separator, { backgroundColor: colors.divider }]} />

        {/* Portal Popup Test Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => openPortalModal('portal')}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>Open Portal Popup</Text>
          </TouchableOpacity>

          {/* Test getCiphersuiteImpl Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.secondary || '#666' }]}
            onPress={testGetCiphersuiteImpl}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>Test getCiphersuiteImpl</Text>
          </TouchableOpacity>
        </View>

      </WebContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1, //for mobile scroll extend
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tabContainer: {
    width: '100%',
    maxWidth: 500,
    marginBottom: 20,
  },
  tabWrapper: {
    flexDirection: 'row',
  },
  customTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 8,
  },

  tabLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: '60%',
    height: 3,
    borderRadius: 2,
    transform: [{ translateX: -30 }],
  },
  tabContent: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 60,
  },
  tabText: {
    fontSize: 16,
    textAlign: 'center',
  },
  searchContainer: {
    width: '100%',
    maxWidth: 400,
    marginVertical: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
