// import { StandardTextInput } from '@/lib/components/StandardTextInput';
// import { useThemeColors } from '@/lib/theme/ThemeContext';
// import { Text, View } from '@/lib/theme/Themed';
// import { formatMessageTime } from '@/lib/utils/formatNums';
// // import { MlsManager } from '@/lib/utils/MlsManager';
// // import { bytesToHex, hexToBytes } from '@noble/ciphers/utils';
// // import { createApplicationMessage, emptyPskIndex, processPrivateMessage } from '@ts-mls/index';
// // import { decodeMlsMessage, encodeMlsPrivateMessage, MlsPrivateMessage } from '@ts-mls/message';
// import { repository, sendWrapped } from '@welshman/app';
// import { makeEvent } from '@welshman/util';
// import { useEffect, useState } from 'react';
// import { Pressable, ScrollView, StyleSheet } from 'react-native';
// import { ProfileMini } from '../search/ProfileMini';

// interface ConversationViewProps {
//   participantPubkey: string;
//   nostrGroupId: string; // This is the public group ID that appears in h tags
// }

// interface Message {
//   id: string;
//   pubkey: string;
//   createdAt: number;
//   content: any;
//   decryptedContent?: string;
//   rawEvent: any;
//   isDecrypted?: boolean;
//   error?: string;
//   decryptError?: string;
// }

// export default function ConversationView({
//   nostrGroupId
// }: ConversationViewProps) {
//   const colors = useThemeColors();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [otherParticipantPubkey, setOtherParticipantPubkey] = useState<string>('');
//   const [messageText, setMessageText] = useState<string>('');
//   const [sending, setSending] = useState(false);

//   const loadMessages = async () => {
//     try {
//       setLoading(true);
//       // Query for MLS Group events (kind: 445) and welcome events that match this nostrGroupId
//       const groupEvents = repository.query([
//         {
//           kinds: [445],
//           '#h': [nostrGroupId]
//         }
//       ]);
//       const welcomeEvents = repository.query([
//         {
//           kinds: [444, 1059],
//         }
//       ]);

//       console.log("Fetched welcome events:", welcomeEvents);
//       console.log('nostrGroupId', nostrGroupId);

//       // Combine all events
//       const allEvents = [...groupEvents, ...welcomeEvents];

//       console.log(`🔍 Found ${groupEvents.length} group messages and ${welcomeEvents.length} welcome events for group ${nostrGroupId.substring(0, 16)}...`);

//       // Process and decode the messages
//       const decodedMessages = await Promise.all(allEvents.map(async (event) => {
//         try {
//           // Try to decode the MLS message content
//           const contentBytes = hexToBytes(event.content);
//           const decodedMessage = decodeMlsMessage(contentBytes, 0);

//           // If it's a private message, try to decrypt it
//           if (decodedMessage && decodedMessage[0].wireformat === 'mls_private_message') {
//             try {
//               // Get the group data to process the message
//               const mlsManager = new MlsManager();
//               const allGroups = mlsManager.getAllGroups();

//               const groupInfo = allGroups.find(g => g.nostrGroupId === nostrGroupId);

//               if (groupInfo) {
//                 const groupData = mlsManager.getGroup(groupInfo.mlsGroupId);

//                 if (groupData) {
//                   // Process the private message to decrypt it
//                   const processResult = await processPrivateMessage(
//                     groupData.group,
//                     decodedMessage[0].privateMessage,
//                     emptyPskIndex,
//                     await groupData.impl
//                   );

//                   // Update the group state
//                   groupData.group = processResult.newState;

//                   let decryptedContent = '';
//                   if (processResult.kind === 'applicationMessage') {
//                     // This is an application message with actual content
//                     decryptedContent = new TextDecoder().decode(processResult.message);
//                     console.log(`✅ Decrypted content:`, decryptedContent);
//                   } else if (processResult.kind === 'newState') {
//                     // This is a proposal/commit message
//                     decryptedContent = 'Message processed (proposal/commit)';
//                     console.log(`📝 Proposal/commit message processed`);
//                   } else {
//                     decryptedContent = 'Message processed';
//                     console.log(`🔄 Other message type processed`);
//                   }

//                   return {
//                     id: event.id,
//                     pubkey: event.pubkey,
//                     createdAt: event.created_at,
//                     content: decodedMessage,
//                     decryptedContent: decryptedContent,
//                     rawEvent: event,
//                     isDecrypted: true
//                   };
//                 } else {
//                   console.log(`❌ No group data found for MLS group ID: ${groupInfo.mlsGroupId}`);
//                 }
//               } else {
//                 console.log(`❌ No group info found for nostrGroupId: ${nostrGroupId}`);
//                 console.log(`📋 Available groups:`, allGroups.map(g => ({
//                   nostrGroupId: g.nostrGroupId.substring(0, 16) + '...',
//                   mlsGroupId: g.mlsGroupId.substring(0, 16) + '...'
//                 })));
//               }
//             } catch (decryptError) {
//               console.log(`⚠️ Could not decrypt message ${event.id}:`, decryptError);
//               return {
//                 id: event.id,
//                 pubkey: event.pubkey,
//                 createdAt: event.created_at,
//                 content: decodedMessage,
//                 rawEvent: event,
//                 error: 'Failed to decrypt message',
//                 decryptError: decryptError instanceof Error ? decryptError.message : 'Unknown error'
//               };
//             }
//           }
//           else {
//             console.log(`🔐 Message ${event.id} is not a private message`);
//             console.log(decodedMessage);

//           }

//           return {
//             id: event.id,
//             pubkey: event.pubkey,
//             createdAt: event.created_at,
//             content: decodedMessage,
//             rawEvent: event
//           };
//         } catch (error) {
//           console.log(`⚠️ Could not decode message ${event.id}:`, error);
//           return {
//             id: event.id,
//             pubkey: event.pubkey,
//             createdAt: event.created_at,
//             content: null,
//             rawEvent: event,
//             error: 'Failed to decode message'
//           };
//         }
//       }));

//       // Sort by creation time (oldest first)
//       decodedMessages.sort((a, b) => a.createdAt - b.createdAt);

//       setMessages(decodedMessages);

//       // Find the other participant from the first message (for 1-on-1 chats)
//       if (decodedMessages.length > 0) {
//         const firstMessage = decodedMessages[0];
//         if (firstMessage.pubkey) {
//           setOtherParticipantPubkey(firstMessage.pubkey);
//         }
//       }

//       console.log(`✅ Loaded ${decodedMessages.length} messages for conversation`);
//     } catch (error) {
//       console.error('❌ Error loading messages:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load messages for this conversation
//   useEffect(() => {
//     if (nostrGroupId) {
//       loadMessages();
//     }
//   }, []);

//   // Send message function
//   const handleSendMessage = async () => {
//     if (!messageText.trim() || sending) return;

//     try {
//       setSending(true);
//       console.log('📤 Sending message:', messageText);

//       // Get current group from MlsManager
//       const mlsManager = new MlsManager();
//       const allGroups = mlsManager.getAllGroups();
//       const groupInfo = allGroups.find(g => g.nostrGroupId === nostrGroupId);

//       if (!groupInfo) {
//         throw new Error('Group not found');
//       }

//       // Get the full group data with impl from internal storage
//       const groupData = mlsManager.getGroup(groupInfo.mlsGroupId);
//       if (!groupData) {
//         throw new Error('Group data not found');
//       }

//       // Create MLS application message
//       const messageResult = await createApplicationMessage(
//         groupData.group,
//         new TextEncoder().encode(messageText), // Convert string to Uint8Array
//         await groupData.impl
//       );

//       // update local state, necessary? or ssend then update?
//       groupData.group = messageResult.newState;
//       const mlsPrivateMessage: MlsPrivateMessage = {
//         wireformat: "mls_private_message",
//         privateMessage: messageResult.privateMessage
//       };

//       //
//       const encodedMessage = encodeMlsPrivateMessage(mlsPrivateMessage);
//       // Create Group Event (kind: 445)
//       const groupEvent = makeEvent(445, {
//         content: bytesToHex(encodedMessage),
//         created_at: Math.floor(Date.now() / 1000),
//         tags: [['h', nostrGroupId]]
//       });

//       // Send via sendWrapped (gift-wrapped for privacy)
//       await sendWrapped({
//         pubkeys: [otherParticipantPubkey], // Send to the other participant
//         template: groupEvent
//       });

//       console.log('✅ Message sent successfully');
//       setMessageText('');

//       // Refresh messages to show the new message
//       loadMessages();

//     } catch (error) {
//       console.error('❌ Error sending message:', error);
//     } finally {
//       setSending(false);
//     }
//   };



//   const shouldShowHeader = (message: Message, index: number) => {
//     if (index === 0) return true;
//     const prevMessage = messages[index - 1];
//     const timeDiff = message.createdAt - prevMessage.createdAt;
//     const isDifferentSender = message.pubkey !== prevMessage.pubkey;
//     const isLongTimeGap = timeDiff > 300; // 5 minutes

//     return isDifferentSender || isLongTimeGap;
//   };

//   const renderMessage = (message: Message, index: number) => {
//     const showHeader = shouldShowHeader(message, index);

//     return (
//       <View key={message.id} style={styles.messageWrapper}>
//         <View style={styles.messageRow}>
//           <ProfileMini
//             pubkey={message.pubkey}
//             raw=""
//             inline={false}
//             showNameOnly={false}
//           />
//           <View style={styles.messageContentContainer}>
//             {showHeader && (
//               <Text style={[styles.messageTime, { color: colors.textSecondary }]}>
//                 {formatMessageTime(message.createdAt)}
//               </Text>
//             )}
//             <View style={[
//               styles.messageContent,
//               !showHeader && styles.messageContentCompact
//             ]}>
//               {message.error ? (
//                 <Text style={[styles.errorText, { color: colors.error }]}>
//                   {message.error}
//                 </Text>
//               ) : message.rawEvent?.kind === 444 ? (
//                 <Text style={{ color: colors.textSecondary }}>
//                   Welcome message
//                 </Text>
//               ) : message.isDecrypted && message.decryptedContent ? (
//                 <Text style={{ color: colors.text }}>
//                   {message.decryptedContent}
//                 </Text>
//               ) : message.content ? (
//                 <Text style={{ color: colors.textSecondary }}>
//                   {JSON.stringify(
//                     message.content,
//                     (key, value) => (typeof value === 'bigint' ? value.toString() : value),
//                     2
//                   )}
//                 </Text>
//               ) : (
//                 <Text style={{ color: colors.textSecondary }}>
//                   Encrypted message
//                 </Text>
//               )}
//             </View>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {/* Header */}
//       <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
//         <View style={styles.headerContent}>
//           <ProfileMini
//             pubkey={otherParticipantPubkey}
//             raw=""
//             inline={true}
//             showNameOnly={false}
//           />
//         </View>
//       </View>

//       {/* Messages Container */}
//       <ScrollView
//         style={styles.messagesContainer}
//         contentContainerStyle={styles.messagesContent}
//         showsVerticalScrollIndicator={false}
//         automaticallyAdjustKeyboardInsets={true}
//       >
//         {loading ? (
//           <View style={styles.emptyState}>
//             <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
//               Loading messages...
//             </Text>
//           </View>
//         ) : (
//           messages.map((message, index) => renderMessage(message, index))
//         )}
//       </ScrollView>

//       {/* Message Input */}
//       <View style={[styles.messageInputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
//           <StandardTextInput
//             placeholder="Message @user..."
//             value={messageText}
//             onChangeText={setMessageText}
//             multiline
//             maxLength={2000}
//             // style={[styles.textInput, { color: colors.text }]}
//             placeholderTextColor={colors.placeholder}
//           />
//         <Pressable
//           style={[
//             styles.sendButton,
//             { backgroundColor: colors.primary },
//             (!messageText.trim() || sending) && { opacity: 0.5 }
//           ]}
//           onPress={handleSendMessage}
//           disabled={!messageText.trim() || sending}
//         >
//           <Text style={[styles.sendButtonText, { color: colors.surface }]}>
//             {sending ? '...' : '→'}
//           </Text>
//         </Pressable>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     padding: 16,
//     borderBottomWidth: 1,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   messagesContainer: {
//     flex: 1,
//   },
//   messagesContent: {
//     flexGrow: 1,
//     padding: 16,
//     paddingBottom: 24,
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   emptySubtext: {
//     fontSize: 14,
//     textAlign: 'center',
//     opacity: 0.7,
//     paddingHorizontal: 32,
//   },
//   messageWrapper: {
//     marginBottom: 16,
//   },
//   messageRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   messageContentContainer: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   messageHeader: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: 2,
//   },
//   messageTime: {
//     fontSize: 12,
//     opacity: 0.6,
//     marginTop: 2,
//     marginBottom: 4,
//   },
//   messageContent: {
//     // No margin needed, handled by messageContentContainer
//   },
//   messageContentCompact: {
//     marginTop: 0,
//   },

//   errorText: {
//     fontSize: 14,
//     fontStyle: 'italic',
//     opacity: 0.7,
//   },
//   messageInputContainer: {
//     flexDirection: 'row',
//     padding: 16,
//     borderTopWidth: 1,
//     alignItems: 'flex-end',
//     gap: 12,
//   },

//   sendButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   sendButtonText: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });
