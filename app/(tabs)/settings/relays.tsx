import { settingsStyles } from '@/app/(tabs)/settings/styles';
import { RelaySearch } from '@/components/search/RelaySearch';
import { RelaySection } from '@/components/search/RelaySection';
import { OptionButton } from '@/lib/components/OptionButton';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text, View } from '@/lib/theme/Themed';
import { getAllRelaysWithStatus, RelayStatus } from '@/lib/utils/relayLoadingUtils';
import { addInboxRelay, addRelay, fetchRelayProfiles, loadRelay, relays, removeInboxRelay, removeRelay } from '@welshman/app';
import { SocketStatus } from '@welshman/net';
import { Router } from '@welshman/router';
import { RelayMode } from '@welshman/util';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Card, Chip, List } from 'react-native-paper';

//NOTE: welshman adds preset relays
//if you add your first relay, they disappear
//especially confusing if your first relay is invalid

export default function RelaysSettings() {
  const colors = useThemeColors();
  const [relayStatuses, setRelayStatuses] = useState<RelayStatus[]>([]);
  const [outboxRelays, setOutboxRelays] = useState<string[]>([]);
  const [inboxRelays, setInboxRelays] = useState<string[]>([]);
  const [relayMetadata, setRelayMetadata] = useState<Map<string, any>>(new Map());
  const [showRelaySearch, setShowRelaySearch] = useState(false);

  const [relayData] = useStore(relays);

  //could not find a store for userrelays
  const refreshUserRelays = () => {
    const router = Router.get();
    const userOutboxRelays = router.FromUser().getUrls();
    const userInboxRelays = router.UserInbox().getUrls();
    setOutboxRelays(userOutboxRelays);
    setInboxRelays(userInboxRelays);
  };

  useEffect(() => {
    // Update relay data when user visits the screen
    const updateRelayData = async () => {
      const allRelays = getAllRelaysWithStatus();
      setRelayStatuses(allRelays);

      refreshUserRelays();

      // Load relay profiles for all relays
      const allRelayUrls = [...outboxRelays, ...inboxRelays];
      allRelayUrls.forEach(url => {
        loadRelay(url); // This triggers profile fetching
      });
      try {
        const profiles = await fetchRelayProfiles(allRelayUrls);

        // Filter out null values from the profiles Map before setting state
        const filteredProfiles = new Map();
        if (profiles instanceof Map) {
          for (const [url, profile] of profiles.entries()) {
            if (profile !== null && profile !== undefined) {
              filteredProfiles.set(url, profile);
            } else {
              console.log('🔌 Skipping null profile for relay:', url);
            }
          }
        }

        setRelayMetadata(filteredProfiles);
      } catch (error) {
        console.error('Error fetching relay profiles:', error);
        // Set empty Map on error to prevent issues
        setRelayMetadata(new Map());
      }
    };

    updateRelayData();
  }, []);

  const getStatusIcon = (status: SocketStatus) => {
    switch (status) {
      case SocketStatus.Open:
        return 'check-circle';
      case SocketStatus.Closed:
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: SocketStatus) => {
    switch (status) {
      case SocketStatus.Open:
        return 'green';
      case SocketStatus.Closed:
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusDescription = (relay: RelayStatus) => {
    if (relay.connected) {
      return 'Connected';
    } else {
      return 'Disconnected';
    }
  };

  const connectedRelays = relayStatuses.filter(r => r.connected);
  const disconnectedRelays = relayStatuses.filter(r => r.status === SocketStatus.Closed);

  // Filter relay data for outbox and inbox
  const getRelayDataFor = (urls: string[]) =>
    relayData?.filter((relay: any) => relay && relay.url && urls.includes(relay.url)) || [];

    const outboxRelayData = getRelayDataFor(outboxRelays);
  const inboxRelayData = getRelayDataFor(inboxRelays);


  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }}>
      <View style={settingsStyles.profileSection}>
        <RelaySection
          title="Outbox Relays"
          icon="upload"
          relays={outboxRelayData}
          label={`${outboxRelayData.length} outbox relays`}
          onRemove={async (url) => {
              removeRelay(url, RelayMode.Write); //optimistic update
              setOutboxRelays(prev => prev.filter(relayUrl => relayUrl !== url));
          }}
          onRefresh={refreshUserRelays}
        />

        <RelaySection
          title="Inbox Relays"
          icon="download"
          relays={inboxRelayData}
          label={`${inboxRelayData.length} inbox relays`}
          onRemove={async (url) => {
            try {
              await removeInboxRelay(url);
              setInboxRelays(prev => prev.filter(relayUrl => relayUrl !== url));
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              alert(`Error removing relay from inbox: ${errorMessage}`);
            }
          }}
          onRefresh={refreshUserRelays}
        />

        {/* Add New Relay Button */}
        {!showRelaySearch && (
          <View style={{ alignItems: 'center', width: '20%', alignSelf: 'center' }}>
            <OptionButton
              title="Add a New Relay"
              onPress={() => setShowRelaySearch(true)}
              icon="plus"
            />
          </View>
        )}

        {/* Relay Search - always mounted, just toggle visibility */}
        <View style={{ display: showRelaySearch ? 'flex' : 'none' }}>
          <RelaySearch
            onAddOutbox={async (url) => {
                addRelay(url, RelayMode.Write);
                setOutboxRelays(prev => [...prev, url]);
            }}
            onAddInbox={async (url) => {
              try {
                await addInboxRelay(url);
                setInboxRelays(prev => [...prev, url]);
                setShowRelaySearch(false);
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                alert(`Error adding relay to inbox: ${errorMessage}`);
              }
            }}
          />
        </View>

        <Card style={{ marginVertical: 8 }}>
          <Card.Title
            title="Relay Connections"
            subtitle={`${connectedRelays.length} connected out of ${relayStatuses.length} total`}
          />
          <Card.Content>
            <List.Section>
              {relayStatuses.length === 0 ? (
                <List.Item
                  title="No relays configured"
                  description="Relays will appear here once connected"
                  left={props => <List.Icon {...props} icon="wifi-off" color="gray" />}
                />
              ) : (
                relayStatuses.map((relay, index) => (
                  <List.Item
                    key={relay.url}
                    title={relay.url}
                    description={getStatusDescription(relay)}
                    left={props => (
                      <List.Icon
                        {...props}
                        icon={getStatusIcon(relay.status)}
                        color={getStatusColor(relay.status)}
                      />
                    )}
                    right={() => (
                      <Chip
                        mode="outlined"
                        compact
                        style={{
                          backgroundColor: relay.connected ? colors.activeTabBackground : 'transparent',
                          borderColor: relay.connected ? colors.activeTabBackground : colors.border
                        }}
                        textStyle={{
                          color: relay.connected ? colors.activeTabText : colors.text
                        }}
                      >
                        {relay.status}
                      </Chip>
                    )}
                  />
                ))
              )}
            </List.Section>
          </Card.Content>
        </Card>

        <Card style={{ marginVertical: 8 }}>
          <Card.Title title="Connection Summary" subtitle="Relay connection statistics" />
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>
                  {connectedRelays.length}
                </Text>
                <Text style={{ color: colors.text }}>Connected</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.error }}>
                  {disconnectedRelays.length}
                </Text>
                <Text style={{ color: colors.text }}>Disconnected</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
      <Button onPress={refreshUserRelays}>
        <Text>Refresh</Text>
      </Button>
    </ScrollView>
  );
}
