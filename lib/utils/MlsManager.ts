// import { createMlsGroup, generateKeyPackageWithCapabilities, generateNostrGroupId, publishKeyPackageEvent, type NostrGroupData } from '@/lib/utils/MLSGroupCreationUtils';
// import { bytesToHex, hexToBytes } from '@noble/ciphers/utils';
// import { makeKeyPackageRef } from "@ts-mls/keyPackage";
// import { getSession, getSigner, pubkey, repository } from '@welshman/app';
// import { load } from '@welshman/net';
// import { Router } from '@welshman/router';
// import { unwrap } from '@welshman/signer';
// import { WRAP } from '@welshman/util';

// import {
//   decodeMlsMessage,
//   emptyPskIndex,
//   getCiphersuiteFromName,
//   getCiphersuiteImpl,
//   joinGroup
// } from '@ts-mls/index';

// // persists across all MlsManager instances
// const globalKeyPackages = new Map<string, [any, any]>(); // keyPackageHash -> [privateKeyPackage, publicKeyPackage]

// const globalGroups = new Map<string, { group: any, nostrGroupId: string, impl: ReturnType<typeof getCiphersuiteImpl> }>();

// export const getStoredKeyPackageHashes = (): string[] => {
//   return Array.from(globalKeyPackages.keys());
// };

// export const getStoredKeyPackage = (hash: string): [any, any] | undefined => {
//   return globalKeyPackages.get(hash);
// };

// export const getAllStoredKeyPackages = (): Map<string, [any, any]> => {
//   return new Map(globalKeyPackages);
// };

// export const getStoredGroups = (): Map<string, { group: any, nostrGroupId: string, impl: ReturnType<typeof getCiphersuiteImpl> }> => {
//   return new Map(globalGroups);
// };

// export const getStoredGroup = (mlsGroupId: string): { group: any, nostrGroupId: string, impl: ReturnType<typeof getCiphersuiteImpl> } | undefined => {
//   return globalGroups.get(mlsGroupId);
// };

// //likely remove mlsmanagr in favor of utils once we have local storage
// export class MlsManager {
//   private impl: any = null;

//   async initialize() {
//     if (!this.impl) {
//       const ciphersuite = getCiphersuiteFromName("MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519");
//       this.impl = await getCiphersuiteImpl(ciphersuite);
//     }
//   }

//   async createConversationGroup(otherPubkey: string): Promise<{ group: any, mlsGroupId: string, nostrGroupId: string }> {
//     await this.initialize();

//     const currentPubkey = pubkey.get();
//     if (!currentPubkey) {
//       throw new Error("No current user pubkey available");
//     }

//     // Generate fresh KeyPackage for current user using utility function
//     const { keyPackage, requiredCapabilitiesExt } = await generateKeyPackageWithCapabilities({
//       pubkey: currentPubkey,
//       impl: this.impl
//     });

//     const nostrGroupData: NostrGroupData = {
//       nostr_group_id: generateNostrGroupId(this.impl),
//       name: "1-on-1 Chat",
//       description: "Direct MLS conversation",
//       admin_pubkeys: [currentPubkey],
//       relays: ["wss://relay.damus.io", "wss://nos.lol"]
//     };

//     // Create MLS group using utility function
//     const { group, mlsGroupId, nostrGroupId } = await createMlsGroup({
//       keyPackage,
//       requiredCapabilitiesExt,
//       nostrGroupData,
//       impl: this.impl
//     });

//     // Store the conversation group globally
//     globalGroups.set(mlsGroupId, { group, nostrGroupId, impl: this.impl });

//     return { group, mlsGroupId, nostrGroupId };
//   }

//   async publishKeyPackageEvent(): Promise<any> {
//     await this.initialize();
//     const currentPubkey = pubkey.get();
//     if (!currentPubkey) {
//       throw new Error("No current user pubkey available");
//     }

//     // Generate fresh KeyPackage for publishing using utility function
//     const { keyPackage, requiredCapabilitiesExt } = await generateKeyPackageWithCapabilities({
//       pubkey: currentPubkey,
//       impl: this.impl
//     });

//     // Store the key package tuple globally by the hash of the public package for later retrieval
//     const keyPackageHash = bytesToHex(await makeKeyPackageRef(keyPackage.publicPackage, this.impl.hash));
//     globalKeyPackages.set(keyPackageHash, [keyPackage.privatePackage, keyPackage.publicPackage]);

//     // Publish KeyPackage event using utility function
//     return await publishKeyPackageEvent(keyPackage, this.impl);
//   }

//   /**
//    * Process a welcome message and join the group
//    * @param welcomeEvent The welcome event (kind: 444) containing the MLS welcome message
//    * @returns Object containing success status and group information
//    */
//     async processWelcomeMessageAndJoinGroup(welcomeEvent: any): Promise<{
//     success: boolean;
//     mlsGroupId?: string;
//     nostrGroupId?: string;
//     error?: string;
//   }> {
//     try {
//       await this.initialize();

//       const currentPubkey = pubkey.get();
//       if (!currentPubkey) {
//         throw new Error("No current user pubkey available");
//       }

//       // Check if content is encrypted (NIP-44 or NIP-59)
//       let decryptedContent = welcomeEvent.content;

//       // Check for NIP-59 giftwrap (starts with "gift:")
//       if (welcomeEvent.kind === WRAP) {
//         try {
//           const session = getSession(currentPubkey);
//           if (!session) {
//             throw new Error('No session available for unwrapping gift');
//           }
//           const signer = getSigner(session);

//           const unwrapped = await unwrap(signer, welcomeEvent);
//           if (!unwrapped) {
//             throw new Error('Failed to unwrap gift - result is undefined');
//           }
//           decryptedContent = unwrapped.content;
//           console.log('✅ Successfully unwrapped NIP-59 content');
//         } catch (unwrapError) {
//           console.error('❌ Failed to unwrap NIP-59 content:', unwrapError);
//           throw new Error(`Failed to unwrap NIP-59 content: ${unwrapError}`);
//         }
//       }


//       const welcomeBytes = hexToBytes(decryptedContent);

//       const decodeResult = decodeMlsMessage(welcomeBytes, 0);
//       if (!decodeResult) {
//         throw new Error('Failed to decode MLS welcome message');
//       }

//       const [decodedMessage, offset] = decodeResult;

//       if (decodedMessage.wireformat !== 'mls_welcome') {
//         throw new Error(`Expected welcome message, got: ${decodedMessage.wireformat}`);
//       }

//       // Extract group info from welcome message
//       const welcome = decodedMessage.welcome;
//       if (!welcome) {
//         throw new Error('Welcome message missing welcome data');
//       }

//       // Log key package reference from welcome message
//       const newMember = welcome.secrets[0]?.newMember;


//       // Check welcome event tags for KeyPackage Event ID
//       const keyPackageEventId = welcomeEvent.tags.find((t: any) => t[0] === 'e')?.[1];

//       // Find the key package - need both private and public parts
//       let privateKeyPackage = null;
//       let publicKeyPackage = null;

//             // First, check global storage for the key package tuple (fail if not found)
//       const expectedKeyPackageHash = bytesToHex(newMember);
//       const storedKeyPackage = globalKeyPackages.get(expectedKeyPackageHash);

//       if (!storedKeyPackage) {
//         console.log(globalKeyPackages);
//         throw new Error('Cannot join group: key package tuple not found in local storage. The key package must be created locally before joining.');
//       }
//       [privateKeyPackage, publicKeyPackage] = storedKeyPackage;

//       // Now find the public key package from events (local repo first, then relays)
//       if (keyPackageEventId) {
//         // Try local event storage first
//         const localEvent = await this.queryLocalEvent(keyPackageEventId);
//         if (localEvent) {
//           publicKeyPackage = this.parseKeyPackageFromEvent(localEvent);
//         }

//         // If not found locally, query relays
//         if (!publicKeyPackage) {
//           const relayEvent = await this.queryRelayEvent(keyPackageEventId);
//           if (relayEvent) {
//             publicKeyPackage = this.parseKeyPackageFromEvent(relayEvent);
//           }
//         }
//       }

//       if (!publicKeyPackage) {
//         throw new Error('Could not find public key package for joining group');
//       }

//       // Combine private and public parts to create the full key package
//       const keyPackage = {
//         publicPackage: publicKeyPackage,
//         privatePackage: privateKeyPackage
//       };

//       // Verify the key package matches the welcome message reference
//       const keyPackageHash = await this.computeKeyPackageHash(keyPackage);
//       if (keyPackageHash !== bytesToHex(newMember)) {
//         throw new Error('Key package hash mismatch - this key package was not used in the invite');
//       }

//       // Join the group using the found key package
//       const group = await joinGroup(
//         welcome,
//         keyPackage.publicPackage,
//         keyPackage.privatePackage,
//         emptyPskIndex,
//         this.impl,
//         undefined // ratchetTree - will be extracted from extensions
//       );

//       // Extract group ID from the group state
//       const mlsGroupId = bytesToHex(group.groupContext.groupId);

//       // Extract nostr group ID from the group extensions if available
//       let nostrGroupId = '';
//       if (group.groupContext.extensions) {
//         for (const ext of group.groupContext.extensions) {
//           if (ext.extensionType === 100) { // nostr_group_data extension
//             try {
//               const nostrData = JSON.parse(new TextDecoder().decode(ext.extensionData));
//               nostrGroupId = nostrData.nostr_group_id;
//               break;
//             } catch (e) {
//               console.log('Could not parse nostr group data extension');
//             }
//           }
//         }
//       }

//       // If no nostr group ID found in extensions, generate one
//       if (!nostrGroupId) {
//         nostrGroupId = generateNostrGroupId(this.impl);
//       }

//       // Store the group globally
//       globalGroups.set(mlsGroupId, { group, nostrGroupId, impl: this.impl });

//       return {
//         success: true,
//         mlsGroupId,
//         nostrGroupId
//       };

//     } catch (error) {
//       console.error('❌ Error processing welcome message and joining group:', error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : String(error)
//       };
//     }
//   }

//   getGroup(mlsGroupId: string) {
//     return globalGroups.get(mlsGroupId);
//   }

//   getAllGroups() {
//     return Array.from(globalGroups.entries()).map(([id, data]) => ({
//       mlsGroupId: id,
//       nostrGroupId: data.nostrGroupId,
//       group: data.group
//     }));
//   }

//   private async queryLocalEvent(eventId: string): Promise<any> {
//     // Query local repository for the event by ID
//     const eventFilter = { ids: [eventId] };
//     const localEvents = repository.query([eventFilter]);

//     if (localEvents.length === 0) {
//       return null;
//     }

//     return localEvents[0];
//   }

//   private parseKeyPackageFromEvent(event: any): any {
//     try {
//       const keyPackageBytes = hexToBytes(event.content);
//       const decodeResult = decodeMlsMessage(keyPackageBytes, 0);
//       if (!decodeResult) {
//         throw new Error('Failed to decode MLS message');
//       }
//       const [decodedMessage] = decodeResult;
//       if (decodedMessage.wireformat !== 'mls_key_package') {
//         throw new Error('Event does not contain a KeyPackage message');
//       }
//       return decodedMessage.keyPackage;
//     } catch (e) {
//       throw new Error(`Failed to parse key package from event: ${e}`);
//     }
//   }

//   private async queryRelayEvent(eventId: string): Promise<any> {
//     // Use Welshman's load function to query relays for the specific event
//     const eventFilter = { ids: [eventId] };

//     // Load from relays using the default relay strategy
//     await load({
//       filters: [eventFilter],
//       relays: Router.get().FromUser().getUrls()
//     });

//     // After loading, query the local repository again
//     const localEvents = repository.query([eventFilter]);

//     if (localEvents.length === 0) {
//       return null;
//     }

//     return localEvents[0];
//   }

//   private async computeKeyPackageHash(keyPackage: any): Promise<string> {
//     // makeKeyPackageRef expects a KeyPackage object, not the wrapper with public/private parts
//     const keyPackageToHash = keyPackage.publicPackage || keyPackage;
//     const keyPackageRef = await makeKeyPackageRef(keyPackageToHash, this.impl.hash);

//     // Convert to hex string using the proper utility function
//     return bytesToHex(keyPackageRef);
//   }
// }
