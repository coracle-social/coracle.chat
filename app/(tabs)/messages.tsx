// import { router } from 'expo-router';
// import { useEffect, useMemo, useState } from 'react';
// import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

// import { useThemeColors } from '@/lib/theme/ThemeContext';
// import { Text, View } from '@/lib/theme/Themed';
// import { addMemberToGroup } from '@/lib/utils/MLSGroupCreationUtils';
// import { MlsManager } from '@/lib/utils/MlsManager';
// import { hexToBytes } from "@noble/ciphers/utils";
// import { decodeMlsMessage } from '@ts-mls/message';
// import { pubkey, repository } from '@welshman/app';
// import { load } from '@welshman/net';
// import { Router as WelshmanRouter } from '@welshman/router';
// import { SafeAreaView } from 'react-native-safe-area-context';


// export default function MessagesScreen() {
//   const [reloadKey, setReloadKey] = useState(0);
//   const [keyPackageEvents, setKeyPackageEvents] = useState<any[]>([]);
//   const [groupEvents, setGroupEvents] = useState<any[]>([]);
//   const [welcomeEvents, setWelcomeEvents] = useState<any[]>([]);
//   const [groups, setGroups] = useState<any[]>([]);
//   const mlsManager = useMemo(() => new MlsManager(), [reloadKey]);
//   const colors = useThemeColors();

//   // Function to refresh groups from MlsManager
//   const refreshGroups = () => {
//     const currentGroups = mlsManager.getAllGroups();
//     setGroups(currentGroups);
//     console.log('🔄 Refreshed groups from MlsManager:', currentGroups.length, 'groups');
//   };

//   // Function to add a new group
//   const addGroup = (newGroup: any) => {
//     setGroups(prev => {
//       const exists = prev.some(g => g.mlsGroupId === newGroup.mlsGroupId);
//       if (!exists) {
//         console.log('➕ Adding new group:', newGroup.mlsGroupId.substring(0, 16) + '...');
//         return [...prev, newGroup];
//       }
//       return prev;
//     });
//   };


//   const handleReload = () => {
//     setReloadKey(prev => prev + 1);
//     console.log('Reloading MLS events...');
//     // Also refresh groups when reloading
//     setTimeout(refreshGroups, 100); // Small delay to ensure MlsManager is updated
//   };

//   // Load MLS events from local repository
//   const loadMlsEvents = async () => {
//     try {
//       const currentPubkey = pubkey.get();

//       // Get all groups the current user is part of
//       const userNostrGroupIds = groups.map(g => g.nostrGroupId);

//       // Query for MLS KeyPackage events (kind: 443)
//       const allKeyPackageEvents = repository.query([{ kinds: [443] }]);

//       // Filter KeyPackage events:
//       // 1. Exclude user's own KeyPackage events
//       // 2. Only show KeyPackages from specific user 4b886474f11ed390a43c9aa8dbc4291ba9e08d7946992eec55ec370d0983b62e
//       const keyPackageEvents = allKeyPackageEvents.filter(event =>
//         event.pubkey !== currentPubkey
//       );

//       // Query for MLS Group events (kind: 445) - ONLY those where user is a participant
//       const allGroupEvents = repository.query([{ kinds: [445] }]);

//       // Filter Group events to only show those where the current user is a participant
//       const groupEvents = allGroupEvents.filter(event => {
//         const nostrGroupId = event.tags.find((t: any) => t[0] === 'h')?.[1];
//         const isUserParticipant = userNostrGroupIds.includes(nostrGroupId);

//         return isUserParticipant;
//       });

//       // Query for MLS Welcome events (kind: 444) - load all to discover potential group invites
//       const allWelcomeEvents = repository.query([{ kinds: [444] }]);
//       const welcomeEvents = allWelcomeEvents.filter(event => {
//         const keyPackageEventId = event.tags.find((t: any) => t[0] === 'e')?.[1];
//         if (!keyPackageEventId) {
//           console.log('⚠️ Welcome event missing e tag:', event.id);
//           return false;
//         }
//         return true; // Load all welcome events for now
//       });

//       // Query for giftwrapped events (kind: 1059) - these should contain MLS welcome messages
//       const allGiftWrappedEvents = repository.query([{ kinds: [1059] }]);
//       const giftWrappedEvents = allGiftWrappedEvents.filter(event => {
//         console.log('🎁 Found giftwrapped event:', event.id, 'kind:', event.kind);
//         return true; // Load all giftwrapped events for now
//       });

//       // Combine both types of events for display
//       const allWelcomeAndGiftEvents = [...welcomeEvents, ...giftWrappedEvents];

//       setKeyPackageEvents(keyPackageEvents);
//       setGroupEvents(groupEvents);
//       setWelcomeEvents(allWelcomeAndGiftEvents);

//     } catch (error) {
//       console.error('❌ Error loading MLS events from local repository:', error);
//     }
//   };

//   // Search for MLS events from relays
//   const searchRelaysForMlsEvents = async () => {
//       // Get all groups the current user is part of
//       const userNostrGroupIds = groups.map(g => g.nostrGroupId);

//       // Load MLS events from relays with targeted filtering
//       await load({
//         filters: [
//           // KeyPackage events (kind: 443) - load all to discover potential chat partners
//           { kinds: [443] },
//           // Group events (kind: 445) - ONLY load those where user is a participant
//           ...userNostrGroupIds.map(nostrGroupId => ({
//             kinds: [445],
//             '#h': [nostrGroupId]
//           })),
//           // Welcome events (kind: 444) - load all to discover potential group invites
//           { kinds: [444] }
//         ],
//         relays: WelshmanRouter.get().FromUser().getUrls()
//       });

//       // Now reload local events (which should now include relay data)
//       loadMlsEvents();
//   };

//   // Load events on component mount and when reloading
//   useEffect(() => {
//     loadMlsEvents();
//     refreshGroups(); // Load initial groups
//   }, [reloadKey]);

//   const debugPress = (event: any) => {
//     // Determine event type based on tags or content
//     const eventType = event.tags.find((t: any) => t[0] === 'ciphersuite') ? 'KeyPackage' :
//                      event.tags.find((t: any) => t[0] === 'e') ? 'Welcome' : 'Group';

//     const emojis = { KeyPackage: '🔑', Welcome: '🎉', Group: '📨' };
//     const emoji = emojis[eventType as keyof typeof emojis];

//     console.log(`${emoji} MLS ${eventType} Event Details:`);
//     console.log(`📄 Event ID: ${event.id}`);
//     console.log(`👤 From: ${event.pubkey.substring(0, 20)}...`);
//     console.log(`📅 Created: ${new Date(event.created_at * 1000).toLocaleString()}`);

//     // Log type-specific information
//     if (eventType === 'KeyPackage') {
//       console.log(`🔧 Ciphersuite: ${event.tags.find((t: any) => t[0] === 'ciphersuite')?.[1] || 'Unknown'}`);
//       console.log(`📋 Extensions: ${event.tags.find((t: any) => t[0] === 'extensions')?.slice(1).join(', ') || 'None'}`);
//     } else if (eventType === 'Welcome') {
//       console.log(`🔗 KeyPackage Event ID: ${event.tags.find((t: any) => t[0] === 'e')?.[1] || 'Unknown'}`);
//     }

//     console.log(`🌐 Relays: ${event.tags.find((t: any) => t[0] === 'relays')?.slice(1).join(', ') || 'None'}`);

//     // Try to decode the MLS message content
//     try {
//       if (event.content) {
//         // Convert hex content to bytes for MLS decoding
//         const contentBytes = hexToBytes(event.content);

//         if (contentBytes.length > 0) {
//           const decodedMessage = decodeMlsMessage(contentBytes, 0);
//           console.log(`🔓 Decoded MLS ${eventType} Message:`, decodedMessage);
//         }
//       }
//     } catch (error) {
//       console.log(`⚠️ Could not decode MLS ${eventType} Message content:`, error);
//     }
//   };

//   const handleStartChat = async (keyPackageEvent: any) => {
//       // Step 1: Create conversation group for the current user
//       const result = await mlsManager.createConversationGroup(keyPackageEvent.pubkey);

//       // Step 2: Add the other person to the group using their KeyPackage
//       const groupData = mlsManager.getGroup(result.mlsGroupId);
//       if (!groupData) {
//         throw new Error('Failed to retrieve group data');
//       }

//       const addResult = await addMemberToGroup({
//         groupData: groupData,
//         keyPackageEvent: keyPackageEvent
//       });

//       if (addResult.success) {
//         // Add the new group to our local state
//         //uneded once we have stores in localstorage
//         addGroup({
//           mlsGroupId: result.mlsGroupId,
//           nostrGroupId: result.nostrGroupId,
//           group: result.group
//         });

//         // Reload to show the new group
//         handleReload();
//       } else {
//         console.error('❌ Failed to add member to group:', addResult.error);
//       }
//   };

//   const handleJoinGroup = async (welcomeEvent: any) => {
//     try {
//       console.log('🔄 Joining group via welcome message...');

//       const result = await mlsManager.processWelcomeMessageAndJoinGroup(welcomeEvent);

//       if (result.success && result.mlsGroupId && result.nostrGroupId) {
//         // Add the new group to our local state
//         addGroup({
//           mlsGroupId: result.mlsGroupId,
//           nostrGroupId: result.nostrGroupId,
//           group: null // We don't have the group object from this result
//         });

//         // Refresh groups to ensure we have the latest data
//         refreshGroups();
//       } else {
//         console.error('❌ Failed to join group:', result.error || 'Unknown error');
//       }
//     } catch (error) {
//       console.error('❌ Error joining group:', error);
//     }
//   };

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
//       <ScrollView style={styles.scrollContainer}>
//         <View style={styles.header}>
//           <Text style={[styles.headerTitle, { color: colors.text }]}>MLS Messages</Text>
//           <View style={styles.headerButtons}>
//             <TouchableOpacity
//               style={[styles.reloadButton, { backgroundColor: colors.secondary }]}
//               onPress={() => {
//                 handleReload();
//                 loadMlsEvents();
//               }}
//             >
//               <Text style={styles.reloadButtonText}>Reload Local</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.reloadButton, { backgroundColor: colors.primary }]}
//               onPress={searchRelaysForMlsEvents}
//             >
//               <Text style={styles.reloadButtonText}>Search Relays</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Navigation to conversation page is handled by the group card onPress */}

//         {/* Unified Groups/Conversations Section - Shows groups you've actually joined */}
//         <View style={styles.mlsSection}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>
//             Your Groups & Conversations ({groups.length})
//           </Text>

//           {groups.length === 0 ? (
//             <Text style={[styles.noMessagesText, { color: colors.text }]}>
//               You haven't joined any MLS groups yet. Create a conversation or join a group to get started.
//             </Text>
//           ) : (
//             groups.map((group, index) => (
//               <TouchableOpacity
//                 key={`group-${index}`}
//                 style={[styles.messageCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}
//                 onPress={() => router.push(`/messages/conversation/${group.nostrGroupId}`)}
//               >
//                 <Text style={[styles.messagePreview, { color: colors.text }]}>
//                   Group: {group.nostrGroupId.substring(0, 16)}...
//                 </Text>
//                 <Text style={[styles.messageMeta, { color: colors.textSecondary }]}>
//                   MLS Group ID: {group.mlsGroupId.substring(0, 16)}...
//                 </Text>
//                 <Text style={[styles.messageMeta, { color: colors.textSecondary }]}>
//                   Tap to open conversation
//                 </Text>
//               </TouchableOpacity>
//             ))
//           )}
//         </View>

//         {/* MLS KeyPackage Events Section */}
//         <View style={styles.mlsSection}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>
//             Available Chat Partner (KeyPackage Events) ({keyPackageEvents.length})
//           </Text>

//           {keyPackageEvents.length === 0 ? (
//             <Text style={[styles.noMessagesText, { color: colors.text }]}>
//               No other users' MLS KeyPackage events found. These are published when users want to be discoverable for MLS conversations.
//             </Text>
//           ) : (
//             keyPackageEvents.map((event, index) => (
//               <View key={`${event.id}-${index}`} style={[styles.messageCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
//                 <TouchableOpacity
//                   style={styles.messageContent}
//                   onPress={() => debugPress(event)}
//                 >
//                   <Text style={[styles.messagePreview, { color: colors.text }]}>
//                     KeyPackage from {event.pubkey.substring(0, 20)}...
//                   </Text>
//                   <Text style={[styles.messageMeta, { color: colors.textSecondary }]}>
//                     Ciphersuite: {event.tags.find((t: any) => t[0] === 'ciphersuite')?.[1] || 'Unknown'} • {new Date(event.created_at * 1000).toLocaleString()}
//                   </Text>
//                   <Text style={[styles.messageMeta, { color: colors.textSecondary }]}>
//                     Extensions: {event.tags.find((t: any) => t[0] === 'extensions')?.slice(1).join(', ') || 'None'}
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[styles.startChatButton, { backgroundColor: colors.primary }]}
//                   onPress={() => handleStartChat(event)}
//                 >
//                   <Text style={[styles.startChatButtonText, { color: colors.surface }]}>Start Chat</Text>
//                 </TouchableOpacity>
//               </View>
//             ))
//           )}
//         </View>

//         {/* MLS Group Events Section */}
//         <View style={styles.mlsSection}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>
//             Your Group Messages (kind: 445) ({groupEvents.length})
//           </Text>

//           {groupEvents.length === 0 ? (
//             <Text style={[styles.noMessagesText, { color: colors.text }]}>
//               No MLS Group events found for your conversations. These contain encrypted group messages and state updates for groups you're a member of.
//             </Text>
//           ) : (
//             groupEvents.map((event, index) => (
//               <TouchableOpacity
//                 key={`${event.id}-${index}`}
//                 style={[styles.messageCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}
//                 onPress={() => debugPress(event)}
//               >
//                 <Text style={[styles.messagePreview, { color: colors.text }]}>
//                   Group Message for {event.tags.find((t: any) => t[0] === 'h')?.[1]?.substring(0, 16) || 'Unknown'}...
//                 </Text>
//                 <Text style={[styles.messageMeta, { color: colors.textSecondary }]}>
//                   From: {event.pubkey.substring(0, 20)}... • {new Date(event.created_at * 1000).toLocaleString()}
//                 </Text>
//                 <Text style={[styles.messageMeta, { color: colors.textSecondary }]}>
//                   Content: {event.content.substring(0, 50)}... (NIP-44 encrypted)
//                 </Text>
//               </TouchableOpacity>
//             ))
//           )}
//         </View>

//         {/* MLS Welcome Events Section */}
//         <View style={styles.mlsSection}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>
//             Group Invites (Welcome Events) ({welcomeEvents.length})
//           </Text>

//           {welcomeEvents.length === 0 ? (
//             <Text style={[styles.noMessagesText, { color: colors.text }]}>
//               No group invites found. These are published when users want to invite you to their MLS groups.
//             </Text>
//           ) : (
//             welcomeEvents.map((event, index) => (
//               <View key={`${event.id}-${index}`} style={[styles.messageCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
//                 <TouchableOpacity
//                   style={styles.messageContent}
//                   onPress={() => debugPress(event)}
//                 >
//                   <Text style={[styles.messagePreview, { color: colors.text }]}>
//                     Welcome from {event.pubkey.substring(0, 20)}...
//                   </Text>
//                   <Text style={[styles.messageMeta, { color: colors.textSecondary }]}>
//                     KeyPackage Event ID: {event.tags.find((t: any) => t[0] === 'e')?.[1] || 'Unknown'} • {new Date(event.created_at * 1000).toLocaleString()}
//                   </Text>
//                   <Text style={[styles.messageMeta, { color: colors.textSecondary }]}>
//                     Relays: {event.tags.find((t: any) => t[0] === 'relays')?.slice(1).join(', ') || 'None'}
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[styles.startChatButton, { backgroundColor: colors.primary }]}
//                   onPress={() => handleJoinGroup(event)}
//                 >
//                   <Text style={[styles.startChatButtonText, { color: colors.surface }]}>Join Group</Text>
//                 </TouchableOpacity>
//             </View>
//             ))
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//   },
//   headerButtons: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   reloadButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   reloadButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   mlsSection: {
//     padding: 16,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   noMessagesText: {
//     fontSize: 14,
//     fontStyle: 'italic',
//     textAlign: 'center',
//     padding: 20,
//   },
//   messageCard: {
//     padding: 12,
//     marginBottom: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//   },
//   messagePreview: {
//     fontSize: 14,
//     marginBottom: 8,
//   },
//   messageMeta: {
//     fontSize: 12,
//     opacity: 0.7,
//     marginBottom: 4,
//   },
//   messageContent: {
//     flex: 1,
//     paddingBottom: 8,
//   },
//   startChatButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//     alignSelf: 'flex-end',
//     marginTop: 8,
//   },
//   startChatButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   conversationContainer: {
//     flex: 1,
//     padding: 16,
//   },
//   backButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//     marginBottom: 16,
//     alignSelf: 'flex-start',
//   },
//   backButtonText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
// });

import { useThemeColors } from '@/lib/theme/ThemeContext';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function MessagesScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollContainer}>
        <View>
          <Text>Messages</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
});
