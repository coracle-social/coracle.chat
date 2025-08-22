import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// import ConversationView from '@/components/messages/ConversationView';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text, View } from '@/lib/theme/Themed';
// import { MlsManager } from '@/lib/utils/MlsManager';

export default function ConversationPage() {
  const { nostrGroupId } = useLocalSearchParams<{ nostrGroupId: string }>();
  const [groups, setGroups] = useState<any[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  // const mlsManager = useMemo(() => new MlsManager(), [reloadKey]);
  const colors = useThemeColors();

  // Function to refresh groups from MlsManager
  const refreshGroups = () => {
    // const currentGroups = mlsManager.getAllGroups();
    // setGroups(currentGroups);
    // console.log('🔄 Refreshed groups from MlsManager:', currentGroups.length, 'groups');
  };

  // Load groups on component mount
  useEffect(() => {
    refreshGroups();
  }, [reloadKey]);

  // Find the current group
  const currentGroup = groups.find(g => g.nostrGroupId === nostrGroupId);
  const participantPubkey = currentGroup?.participant || '';

  if (!nostrGroupId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            No group ID provided
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* <ConversationView
        participantPubkey={participantPubkey}
        nostrGroupId={nostrGroupId}
      /> */}
      <Text>ConversationView used to be here</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
