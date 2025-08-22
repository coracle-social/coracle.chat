import { useThemeColors } from '@/lib/theme/ThemeContext';
import { getRoomMessageCount, getRooms, searchRooms } from '@/lib/utils/messagingUtils';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ViewingRooms = ({ onRoomSelect, selectedRoomId }) => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const colors = useThemeColors();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setIsLoading(true);

    let allRooms = [];

    try {
      allRooms = await getRooms(1000);
      console.log('[VIEWING-ROOMS] Found rooms:', allRooms.length);
      setRooms(allRooms);
    } catch (error) {
      console.error('[VIEWING-ROOMS] Error loading rooms:', error);
      setRooms([]);
    } finally {
      setIsLoading(false);

      //instead each event is a store, then we add the mesage acccount to that event in repo and
      //store auto updates???
      const roomsWithCounts = await Promise.all(
        allRooms.map(async (room) => ({
          ...room,
          message_count: await getRoomMessageCount(room.id),
        }))
      );

      setRooms(roomsWithCounts);
    }
  };


  const handleRoomSelect = (room) => {
    if (onRoomSelect) {
      onRoomSelect(room);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const searchResults = await searchRooms(query, 10);
        setRooms(searchResults);
      } catch (error) {
        console.error('[VIEWING-ROOMS] Search error:', error);
        Alert.alert('Error', 'Failed to search rooms');
      }
    } else {
      // Reload all rooms when search is cleared
      loadRooms();
    }
  };

  const formatLastActivity = (timestamp) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading rooms...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, {
            backgroundColor: colors.surfaceVariant,
            color: colors.text,
            borderColor: colors.border
          }]}
          placeholder="Search rooms..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Rooms List */}
      <ScrollView style={styles.roomsList}>
        {rooms.map((room) => (
          <TouchableOpacity
            key={room.id}
            style={[
              styles.roomItem,
              {
                backgroundColor: selectedRoomId === room.id ? colors.primary : colors.surfaceVariant,
                borderColor: colors.border
              }
            ]}
            onPress={() => handleRoomSelect(room)}
          >
            <View style={styles.roomHeader}>
              <Text style={[
                styles.roomName,
                { color: selectedRoomId === room.id ? '#fff' : colors.text }
              ]}>
                {room.name}
              </Text>
              <Text style={[
                styles.lastActivity,
                { color: selectedRoomId === room.id ? '#fff' : colors.placeholder }
              ]}>
                {formatLastActivity(room.last_activity)}
              </Text>
            </View>

            {room.description && (
              <Text style={[
                styles.roomDescription,
                { color: selectedRoomId === room.id ? '#fff' : colors.text }
              ]}>
                {room.description}
              </Text>
            )}

            <View style={styles.roomFooter}>
              <Text style={[
                styles.messageCount,
                { color: selectedRoomId === room.id ? '#fff' : colors.placeholder }
              ]}>
                {room.message_count} messages
              </Text>

              {room.tags && room.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {room.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.tagText, { color: '#fff' }]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {rooms.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.emptyText, { color: colors.placeholder }]}>
              No rooms found
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  roomsList: {
    flex: 1,
    padding: 16,
  },
  roomItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  lastActivity: {
    fontSize: 12,
  },
  roomDescription: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageCount: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default ViewingRooms;
