import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { getNip07 } from '@welshman/signer';
import { load, request, defaultSocketPolicies, makeSocketPolicyAuth, Socket } from '@welshman/net';
import { StampedEvent, TrustedEvent, makeEvent, NOTE } from '@welshman/util';
import { signer, publishThunk, addSession, follow, SessionMethod } from '@welshman/app';
import { Router, routerContext } from '@welshman/router';
import { useStore } from '@/stores/useWelshmanStore2';
import StorageTest from './StorageTest';
import { loadUserProfile } from '@/utils/dataHandling';
import { getPublicKey } from 'nostr-tools';

// Configure default relays for the router
routerContext.getDefaultRelays = () => ["wss://relay.damus.io/", "wss://nos.lol/"];

// Initialize router with default configuration
console.log('[ROUTER] Initialized with default relays:', routerContext.getDefaultRelays());

export default function NostrTest() {
  const [isConnected, setIsConnected] = useState(false);
  const [pubkeyValue, setPubkeyValue] = useState<string>('');
  const [profileStore, setProfileStore] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [events, setEvents] = useState<TrustedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [testEventsStore, setTestEventsStore] = useState<any>(null);
  const [nip01PrivateKey, setNip01PrivateKey] = useState('');

  useEffect(() => {
    if (pubkeyValue) {
      // Profile store is now handled by the dataHandling module
      // This useEffect is no longer needed for profile loading
    }
  }, [pubkeyValue]);

  const [newTestEvents] = useStore<TrustedEvent[]>(testEventsStore || { subscribe: () => () => {} });
  useEffect(() => {
    console.log('[NEW_USE_STORE] newTestEvents changed:', newTestEvents);
  }, [newTestEvents]);

  useEffect(() => {
    console.log('[USE_WELSHMAN_STORE] testEventsStore changed:', testEventsStore);
    if (testEventsStore) {
      console.log('[USE_WELSHMAN_STORE] Store events count:', testEventsStore.get().length);
    }
  }, [testEventsStore]);

  const connectNip07 = async () => {
    try {
      setLoading(true);
      const nip07 = await getNip07();
      if (!nip07) throw new Error('NIP-07 extension not found');
      const userPubkey = await nip07.getPublicKey();
      if (!userPubkey) throw new Error('Failed to get public key');
      
      console.log('[CONNECT] User pubkey:', userPubkey);
      
      addSession({ method: SessionMethod.Nip07, pubkey: userPubkey });
      
      defaultSocketPolicies.push(
        makeSocketPolicyAuth({
          sign: (event: StampedEvent) => signer.get()?.sign(event),
          shouldAuth: () => true,
        })
      );

      console.log('[CONNECT] Router state after session:', Router.get());
      console.log('[CONNECT] Router ForUser relays:', Router.get().ForUser().getUrls());
      console.log('[CONNECT] Router FromUser relays:', Router.get().FromUser().getUrls());
      
      const forUserRelays = Router.get().ForUser().getUrls();
      const fromUserRelays = Router.get().FromUser().getUrls();
      
      if (forUserRelays.length === 0) {
        console.warn('[CONNECT] No ForUser relays configured!');
      }
      if (fromUserRelays.length === 0) {
        console.warn('[CONNECT] No FromUser relays configured!');
      }

      setPubkeyValue(userPubkey);
      setIsConnected(true);
      
      setTimeout(() => {
        console.log('[CONNECT] Router state after delay:', Router.get());
        console.log('[CONNECT] Router ForUser relays after delay:', Router.get().ForUser().getUrls());
      }, 1000);
      
      Alert.alert('Success', 'Connected via NIP-07!');
    } catch (err) {
      console.error('NIP-07 connection error:', err);
      Alert.alert('Error', 'Failed to connect via NIP-07');
    } finally {
      setLoading(false);
    }
  };

  const connectNip01 = async () => {
    if (!nip01PrivateKey.trim()) {
      Alert.alert('Error', 'Please enter your private key');
      return;
    }
    
    try {
      setLoading(true);
      
      // Validate private key format (should be 64 character hex string)
      const privateKeyHex = nip01PrivateKey.trim();
      if (!/^[0-9a-fA-F]{64}$/.test(privateKeyHex)) {
        Alert.alert('Error', 'Invalid private key format. Please enter a 64-character hex string.');
        return;
      }
      
      // Convert hex string to Uint8Array for nostr-tools
      const privateKeyBytes = new Uint8Array(
        privateKeyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );
      
      // Derive public key from private key using nostr-tools
      const userPubkey = getPublicKey(privateKeyBytes);
      if (!userPubkey) {
        Alert.alert('Error', 'Failed to derive public key from private key');
        return;
      }
      
      console.log('[CONNECT] User pubkey:', userPubkey);
      
      // Add NIP-01 session with secret (private key)
      addSession({ method: SessionMethod.Nip01, pubkey: userPubkey, secret: privateKeyHex });
      
      // Set up router authentication for NIP-01 (same as NIP-07)
      defaultSocketPolicies.push(
        makeSocketPolicyAuth({
          sign: (event: StampedEvent) => signer.get()?.sign(event),
          shouldAuth: () => true,
        })
      );
      
      console.log('[CONNECT] Router authentication set up for profile loading');
      
      // Configure router with default relays for the user
      const defaultRelays = ["wss://relay.damus.io/", "wss://nos.lol/"];
      
      // Set up relay configuration for the user using the router's default relays
      const router = Router.get();
      router.options.getDefaultRelays = () => {
        console.log('[CONNECT] Getting default relays');
        return defaultRelays;
      };
      
      // Set up getUserPubkey to return the current user's pubkey
      router.options.getUserPubkey = () => {
        console.log('[CONNECT] Getting user pubkey:', userPubkey);
        return userPubkey;
      };
      
      console.log('[CONNECT] Router configured with relays for user:', defaultRelays);
      
      console.log('[CONNECT] Router state after session:', router);
      console.log('[CONNECT] Router ForUser relays:', router.ForUser().getUrls());
      console.log('[CONNECT] Router FromUser relays:', router.FromUser().getUrls());
      
      const forUserRelays = router.ForUser().getUrls();
      const fromUserRelays = router.FromUser().getUrls();
      
      if (forUserRelays.length === 0) {
        console.warn('[CONNECT] No ForUser relays configured!');
      }
      if (fromUserRelays.length === 0) {
        console.warn('[CONNECT] No FromUser relays configured!');
      }

      setPubkeyValue(userPubkey);
      setIsConnected(true);
      
      Alert.alert('Success', 'Connected via NIP-01!');
    } catch (error) {
      console.error('NIP-01 connection error:', error);
      Alert.alert('Error', 'Failed to connect via NIP-01');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    if (!pubkeyValue) return Alert.alert('Error', 'Connect first');
    try {
      setLoading(true);
      const profile = await loadUserProfile(pubkeyValue);
      setProfile(profile);
      Alert.alert('Success', 'Profile loaded!');
    } catch (error: any) {
      console.error('[PROFILE] Error loading profile:', error);
      Alert.alert('Error', error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  
  const publishNote = async () => {
    if (!pubkeyValue) return Alert.alert('Error', 'Connect first');
    try {
      setLoading(true);
      publishThunk({
        relays: Router.get().FromUser().getUrls(),
        event: makeEvent(NOTE, { content: 'Hello from CoracleChat! ' + new Date().toISOString() }),
        delay: 3000,
      });
      Alert.alert('Success', 'Note published!');
    } catch (err) {
      console.error('Publish error:', err);
      Alert.alert('Error', 'Failed to publish note');
    } finally {
      setLoading(false);
    }
  };

  const followUser = async () => {
    if (!pubkeyValue) return Alert.alert('Error', 'Connect first');
    try {
      setLoading(true);
      follow(['97c70a44366a6535c145b333f973ea86dfdc2d7a99da618c40c64705ad98e322']);
      Alert.alert('Success', 'Followed user');
    } catch (err) {
      console.error('Follow error:', err);
      Alert.alert('Error', 'Failed to follow');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    if (!pubkeyValue) return Alert.alert('Error', 'Connect first');
    try {
      setLoading(true);
      const relays = Router.get().ForUser().getUrls();
      const loadedEvents = await load({ relays, filters: [{ kinds: [NOTE] }] });
      setEvents(loadedEvents);
      console.log('[LOAD_EVENTS] Loaded events:', loadedEvents);
      Alert.alert('Success', `Loaded ${loadedEvents.length} events`);
    } catch (err) {
      console.error('Load events error:', err);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const startSubscription = async () => {
    if (!pubkeyValue) return Alert.alert('Error', 'Connect first');
    try {
      setLoading(true);
      request({
        signal: new AbortController().signal,
        relays: Router.get().ForUser().getUrls(),
        filters: [{ kinds: [NOTE] }],
        onEvent: (event: TrustedEvent) => {
          setEvents((prev) => [event, ...prev.slice(0, 9)]);
        },
      });
      Alert.alert('Subscribed!');
    } catch (err) {
      console.error('Subscription error:', err);
      Alert.alert('Error', 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  const testRelayConnectivity = async () => {
    try {
      setLoading(true);
      console.log('[RELAY_TEST] Testing relay connectivity...');
      
      const defaultRelays = ["wss://relay.damus.io/", "wss://nos.lol/"];
      console.log('[RELAY_TEST] Testing default relays:', defaultRelays);
      
      const testEvents = await load({ 
        relays: defaultRelays, 
        filters: [{ kinds: [NOTE], limit: 5 }] 
      });
      
      console.log('[RELAY_TEST] Test events:', testEvents);
      console.log('[RELAY_TEST] Successfully loaded events:', testEvents.length);
      
      const createTestEventsStore = () => {
        let events = testEvents;
        const subscribers = new Set<(value: TrustedEvent[]) => void>();
        
        const store = {
          subscribe: (callback: (value: TrustedEvent[]) => void) => {
            console.log('[RELAY_TEST] Store subscribe called');
            subscribers.add(callback);
            callback(events);
            console.log('[RELAY_TEST] Initial callback with events:', events.length);
            
            return () => {
              console.log('[RELAY_TEST] Store unsubscribe called');
              subscribers.delete(callback);
            };
          },
          get: () => {
            console.log('[RELAY_TEST] Store get called, returning:', events.length, 'events');
            return events;
          },
          set: (newEvents: TrustedEvent[]) => {
            console.log('[RELAY_TEST] Store set called with:', newEvents.length, 'events');
            events = newEvents;
            subscribers.forEach(callback => callback(events));
          }
        };
        
        return store;
      };
      
      const eventsStore = createTestEventsStore();
      console.log('[RELAY_TEST] Created events store:', eventsStore);
      console.log('[RELAY_TEST] Store events count:', eventsStore.get().length);
      
      setTestEventsStore(eventsStore);
      
      console.log('[RELAY_TEST] Set testEventsStore, should trigger useWelshmanStore update');
      
      Alert.alert('Relay Test', `Successfully connected to relays and loaded ${testEvents.length} events. Check console for useWelshmanStore test.`);
      
    } catch (err) {
      console.error('[RELAY_TEST] Relay connectivity test failed:', err);
      Alert.alert('Relay Test Failed', 'Could not connect to relays');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Nostr Test</Text>
        <View
          style={[
            styles.mainContent,
            { flexDirection: Platform.OS === 'web' ? 'row' : 'column' }
          ]}
        >
          {/* Left side - Main content */}
          <View style={[styles.leftPanel, Platform.OS !== 'web' && { width: '100%' }]}>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
              {pubkeyValue ? <Text style={styles.pubkeyText}>Pubkey: {pubkeyValue.slice(0, 20)}...</Text> : null}
            </View>

            {/* NIP-01 Private Key Input for Mobile */}
            {Platform.OS !== 'web' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Private Key (NIP-01):</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your 64-character hex private key"
                  placeholderTextColor="#666"
                  value={nip01PrivateKey}
                  onChangeText={setNip01PrivateKey}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={connectNip07} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Connecting...' : 'Connect NIP-07'}</Text>
              </Pressable>
              <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={connectNip01} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Connecting...' : 'Connect NIP-01'}</Text>
              </Pressable>
              <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={loadProfile} disabled={!isConnected || loading}>
                <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Load Profile'}</Text>
              </Pressable>
              <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={publishNote} disabled={!isConnected || loading}>
                <Text style={styles.buttonText}>{loading ? 'Publishing...' : 'Publish Note'}</Text>
              </Pressable>
              <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={followUser} disabled={!isConnected || loading}>
                <Text style={styles.buttonText}>{loading ? 'Following...' : 'Follow User'}</Text>
              </Pressable>
              <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={loadEvents} disabled={!isConnected || loading}>
                <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Load Events'}</Text>
              </Pressable>
              <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={startSubscription} disabled={!isConnected || loading}>
                <Text style={styles.buttonText}>{loading ? 'Starting...' : 'Start Subscription'}</Text>
              </Pressable>
              <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={testRelayConnectivity} disabled={!isConnected || loading}>
                <Text style={styles.buttonText}>{loading ? 'Testing...' : 'Test Relay Connectivity'}</Text>
              </Pressable>
            </View>

            <StorageTest />

            {profile && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile:</Text>
                <ScrollView horizontal>
                  <Text style={styles.sectionText}>{JSON.stringify(profile, null, 2)}</Text>
                </ScrollView>
              </View>
            )}

            {events.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Events ({events.length}):</Text>
                {events.map((event, index) => (
                  <View key={index} style={styles.eventItem}>
                    <Text style={styles.eventText}>{event.content}</Text>
                    <Text style={styles.eventMeta}>{new Date(event.created_at * 1000).toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* New useStore test */}
          <View style={[styles.section, { maxWidth: Platform.OS === 'web' ? '20%' : '100%', marginTop: Platform.OS !== 'web' ? 20 : 0 }]}>
            <Text style={styles.sectionTitle}>New useStore Test</Text>
            <Text style={styles.sectionText}>
              {newTestEvents && newTestEvents.length > 0 
                ? `✅ New adapter working! Events: ${newTestEvents.length}` 
                : '⏳ Waiting for test events...'}
            </Text>
            {newTestEvents && newTestEvents.length > 0 && (
              <View style={styles.testEventsContainer}>
                {newTestEvents.map((event: TrustedEvent, index: number) => (
                  <View key={index} style={styles.eventItem}>
                    <Text style={styles.eventText}>{event.content}</Text>
                    <Text style={styles.eventMeta}>{new Date(event.created_at * 1000).toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'space-between',
  },
  leftPanel: {
    flex: 2,
    minWidth: 0, // important to prevent text shrinking in flexbox
  },
  rightPanel: {
    flex: 1,
    minWidth: 300,
  },
  statusContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pubkeyText: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  eventItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  eventText: {
    fontSize: 14,
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  eventMeta: {
    fontSize: 12,
    color: '#666',
  },
  testEventsContainer: {
    maxHeight: 400,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textInput: {
    fontSize: 14,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
  },
});
