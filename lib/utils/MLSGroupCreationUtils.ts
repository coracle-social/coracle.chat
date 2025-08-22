// import { bytesToHex, hexToBytes } from "@noble/ciphers/utils";
// import type { Extension } from '@ts-mls/extension';
// import {
//   createCommit,
//   createGroup, // ✅ Encode the commit message
//   decodeMlsMessage, // ✅ Decode KeyPackage messages
//   defaultCapabilities,
//   defaultLifetime, // ✅ Create commits with proposals
//   emptyPskIndex, // ✅ Type for proposals
//   encodeMlsMessage,
//   encodeRequiredCapabilities,
//   generateKeyPackage, // ✅ Return type of createCommit
//   type Proposal,
//   type RequiredCapabilities
// } from '@ts-mls/index';
// import { publishThunk, sendWrapped } from '@welshman/app';
// import { makeEvent } from '@welshman/util';

// // Nostr Group Data Extension types according to MLS-NostrEE spec
// export interface NostrGroupData {
//   nostr_group_id: string;  // 32-byte hex string - public group identifier
//   name: string;            // Group name
//   description: string;     // Group description
//   admin_pubkeys: string[]; // Array of hex-encoded admin public keys
//   relays: string[];        // Array of relay URLs for the group
// }

// export interface AddMemberOptions {
//   groupData: { group: any, nostrGroupId: string, impl: any }; // Full group data from the map
//   keyPackageEvent: {
//     id: string;
//     pubkey: string;
//     content: string;
//   }; // KeyPackage event (kind: 443) from the person to add
// }

// export interface KeyPackageGenerationOptions {
//   pubkey: string;
//   impl: any;
// }

// export interface GroupCreationOptions {
//   keyPackage: any;
//   requiredCapabilitiesExt: Extension;
//   nostrGroupData: NostrGroupData;
//   impl: any;
// }

// /**
//  * Generate a random Nostr group ID (32-byte hex string)
//  */
// export function generateNostrGroupId(impl: any): string {
//   return bytesToHex(impl.rng.randomBytes(32));
// }
// //future may have capabilites as an argument
// export async function generateKeyPackageWithCapabilities(options: KeyPackageGenerationOptions): Promise<{
//   keyPackage: any;
//   requiredCapabilitiesExt: Extension;
// }> {
//   const { pubkey, impl } = options;

//   const credential = {
//     credentialType: "basic" as const,
//     identity: new TextEncoder().encode(pubkey)
//   };

//   // extensionTypes: 2=ratchet_tree, 3=required_capabilities, 4=external_pub, 100=nostr_group_data
//   const requiredCapabilities: RequiredCapabilities = {
//     extensionTypes: [2, 3, 4, 100],
//     credentialTypes: ["basic"],
//     proposalTypes: [],
//   };

//   const requiredCapabilitiesExt: Extension = {
//     extensionType: "required_capabilities",
//     extensionData: encodeRequiredCapabilities(requiredCapabilities),
//   };

//   // Start with default capabilities and modify them to support our extensions
//   const customCapabilities = {
//     ...defaultCapabilities(),
//     extensions: [2, 3, 4, 100]  // Override to support all required extension types
//   };

//   // Only add required_capabilities extension to KeyPackage
//   const keyPackageExtensions: Extension[] = [requiredCapabilitiesExt];

//   const keyPackage = await generateKeyPackage(
//     credential,
//     customCapabilities,
//     defaultLifetime,
//     keyPackageExtensions,
//     impl
//   );

//   // Validate that capabilities were properly included
//   if (!keyPackage.publicPackage.leafNode.capabilities) {
//     throw new Error('KeyPackage generation failed: capabilities are undefined. This indicates a bug in the MLS library or our capabilities configuration.');
//   }

//   // Validate that the required extensions are supported
//   const keyPackageCapabilities = keyPackage.publicPackage.leafNode.capabilities;
//   if (!keyPackageCapabilities.extensions || !keyPackageCapabilities.extensions.includes(2) ||
//       !keyPackageCapabilities.extensions.includes(3) || !keyPackageCapabilities.extensions.includes(4) ||
//       !keyPackageCapabilities.extensions.includes(100)) {
//     throw new Error(`KeyPackage generation failed: missing required extensions. Got: ${JSON.stringify(keyPackageCapabilities.extensions)}, expected: [2, 3, 4, 100]`);
//   }

//   return { keyPackage, requiredCapabilitiesExt };
// }

// /**
//  * Create an MLS group
//  */
// export async function createMlsGroup(options: GroupCreationOptions): Promise<{
//   group: any;
//   mlsGroupId: string;
//   nostrGroupId: string;
// }> {
//   const { keyPackage, requiredCapabilitiesExt, nostrGroupData, impl } = options;

//   // Create MLS group with just the creator
//   const mlsGroupIdBytes = impl.rng.randomBytes(32);
//   const nostrGroupId = generateNostrGroupId(impl);

//   const nostrExtension: Extension = {
//     extensionType: 100, // nostr_group_data extension type
//     extensionData: encodeNostrGroupData(nostrGroupData),
//   };

//   const groupExtensions: Extension[] = [
//     requiredCapabilitiesExt,
//     nostrExtension
//   ];

//   const group = await createGroup(
//     mlsGroupIdBytes,
//     keyPackage.publicPackage,
//     keyPackage.privatePackage,
//     groupExtensions,
//     impl
//   );

//   const mlsGroupId = bytesToHex(mlsGroupIdBytes);

//   return { group, mlsGroupId, nostrGroupId };
// }

// /**
//  * Publish a KeyPackage event to make the user discoverable
//  */
// export async function publishKeyPackageEvent(keyPackage: any, impl: any, relays: string[] = ["wss://relay.damus.io", "wss://nos.lol"]): Promise<any> {
//   // Encode the KeyPackage as MLS message
//   const keyPackageBytes = encodeMlsMessage({
//     keyPackage: keyPackage.publicPackage,
//     wireformat: "mls_key_package",
//     version: "mls10",
//   });

//   const content = bytesToHex(keyPackageBytes);

//   const keyPackageEvent = makeEvent(443, {
//     content,
//     created_at: Math.floor(Date.now() / 1000),
//     tags: [
//       ['mls_protocol_version', '1.0'],
//       ['ciphersuite', '0x0001'], // MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519
//       ['extensions', '0x0001', '0x0002', '0x0064'], // required_capabilities, ratchet_tree, nostr_group_data
//       ['relays', ...relays]
//     ]
//   });

//   const result = await publishThunk({
//     event: keyPackageEvent,
//     relays
//   });

//   return result;
// }

// /**
//  * Encodes Nostr Group Data according to MLS-NostrEE specification
//  * This creates the extensionData for the nostr_group_data MLS extension
//  */
// export function encodeNostrGroupData(groupData: NostrGroupData): Uint8Array {
//   // Convert the group data to a structured format that can be encoded
//   const encodedData = {
//     nostr_group_id: groupData.nostr_group_id,
//     name: groupData.name,
//     description: groupData.description,
//     admin_pubkeys: groupData.admin_pubkeys,
//     relays: groupData.relays
//   };

//   // Convert to JSON string and then to Uint8Array
//   const jsonString = JSON.stringify(encodedData);
//   return new TextEncoder().encode(jsonString);
// }

// /**
//  * Decodes Nostr Group Data from MLS extension data
//  */
// export function decodeNostrGroupData(extensionData: Uint8Array): NostrGroupData {
//   const jsonString = new TextDecoder().decode(extensionData);
//   return JSON.parse(jsonString);
// }

// /**
//  * Adds a member to an MLS group by creating an Add proposal, committing it, and publishing the group event
//  * This implements Step 2 of the MLS-NostrEE flow
//  */
// export async function addMemberToGroup(options: AddMemberOptions): Promise<{
//   success: boolean;
//   groupEvent?: any;
//   error?: string;
// }> {
//   try {
//     const { groupData, keyPackageEvent } = options;
//     const { group, nostrGroupId, impl } = groupData;

//     // Step 1: Parse the KeyPackage from the event
//     const keyPackageBytes = hexToBytes(keyPackageEvent.content);
//     const decodeResult = decodeMlsMessage(keyPackageBytes, 0);

//     if (!decodeResult) {
//       throw new Error('Failed to decode MLS message');
//     }

//     const [decodedMessage, offset] = decodeResult;

//     // Check if this is a KeyPacckage message
//     if (decodedMessage.wireformat !== 'mls_key_package') {
//       throw new Error('Event does not contain a KeyPackage message');
//     }

//     // Access the KeyPackage from the decoded message
//     const keyPackage = decodedMessage.keyPackage;
//     if (!keyPackage) {
//       throw new Error('Invalid KeyPackage in event');
//     }
//     // Step 2: Create Add proposal using the KeyPackage

//     const addProposal: Proposal = {
//       proposalType: "add",
//       add: {
//         keyPackage: keyPackage
//       }
//     };

//     // Step 3: Commit the proposal to update group state
//     const commitResult = await createCommit(
//       group,                    // Current group state
//       emptyPskIndex,           // No PSKs for this commit
//       false,                   // Not a public message
//       [addProposal],           // Array of proposals
//       impl,                    // Ciphersuite implementation
//       true
//     );
//     const commitMessageBytes = encodeMlsMessage(commitResult.commit);

//     // Step 5: Publish the Commit as a Group Event (kind: 445)
//     console.log('📤 Publishing Group Event...');

//     const groupEvent = makeEvent(445, {
//       content: bytesToHex(commitMessageBytes), // Convert to hex string
//       created_at: Math.floor(Date.now() / 1000),
//       tags: [['h', nostrGroupId]]
//     });

//     await publishThunk({
//       event: groupEvent,
//       relays: group.relays || ["wss://relay.damus.io", "wss://nos.lol"]
//     });

//     let welcomeEvent = null;

//     if (commitResult.welcome) {
//       console.log('🎉 Creating Welcome Event for new member...');

//       const welcomeMessage = encodeMlsMessage({
//         version: "mls10",
//         wireformat: "mls_welcome",
//         welcome: commitResult.welcome
//       });

//       // Create Welcome Event (kind: 444) according to MLS-NostrEE spec
//       welcomeEvent = makeEvent(444, {  // ✅ Correct kind: 444
//         content: bytesToHex(welcomeMessage),
//         created_at: Math.floor(Date.now() / 1000),
//         tags: [
//           ['e', keyPackageEvent.id],                    // ✅ KeyPackage Event ID (not group event)
//           ['h', nostrGroupId],                          // ✅ Group ID for filtering
//           ['relays', ...(group.relays || ["wss://relay.damus.io", "wss://nos.lol"])]  // ✅ Relay list
//         ]
//         // ✅ No signature - Welcome events are never signed (will be gift-wrapped)
//       });

//         // Send Welcome Event via NIP-59 gift-wrapping (not direct publishing)
//       await sendWrapped({
//         pubkeys: [keyPackageEvent.pubkey],  // Send to the new member
//         template: welcomeEvent               // The Welcome event template
//       });
//     }
//     return {
//       success: true,
//       groupEvent
//     };
//   } catch (error) {
//     console.error('❌ Failed to add member to group:', error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : String(error)
//     };
//   }
// }
