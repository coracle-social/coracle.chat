import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MessagesScreen() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const colors = useThemeColors();

  const handleRoomSelect = (room: any) => {
    setSelectedRoomId(room.id);
  };

  const handleReload = () => {
    setReloadKey(prev => prev + 1);
    console.log('Reloading rooms...');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
     <Text>Messages</Text>
     {/* <WebContainer>

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        <TouchableOpacity
          style={[styles.reloadButton, { backgroundColor: colors.primary }]}
          onPress={handleReload}
        >
          <Text style={styles.reloadButtonText}>Reload1</Text>
        </TouchableOpacity>
      </View>

      <ViewingRooms key={reloadKey} onRoomSelect={handleRoomSelect} selectedRoomId={selectedRoomId} />
      </WebContainer> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reloadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
});

// when you create a message it gets sent to the repository automatically, updating the message list in the process.
