# Minimal MLS-NostrEE Implementation Guide

## 1. Key Concepts
- **Identity key**: The user's main Nostr key (persistent across devices)
- **MLS KeyPackage**: Public info about a user's MLS capabilities, published as kind: 443 event

- **MLS Group ID**: Private 32-byte identifier (never published to relays)
- **Nostr Group ID**: Public 32-byte identifier used in event tags (can change over time)
- **Sender epoch key**: Short-term symmetric keys MLS derives per epoch for encrypting messages
- **Receiver**: Uses its MLS group state to decrypt messages with epoch keys

## 2. Minimal Flow: One-on-One Group

### Step 1: Alice wants to message Bob
1. **Alice generates a fresh KeyPackage** for herself using MLS
2. **Alice publishes KeyPackage Event** (kind: 443) to relays with required tags:
   - `mls_protocol_version`: "1.0"
   - `ciphersuite`: MLS ciphersuite ID
   - `extensions`: Required extensions (ratchet_tree, nostr_group_data, last_resort)
   - `relays`: Array of relay URLs
3. **Alice creates a new MLS group** with just herself, including required extensions:
   - `required_capabilities`: [ratchet_tree, nostr_group_data]
   - `nostr_group_data`: {name, description, admin_pubkeys, relays, nostr_group_id}

RATCHET TREE EXTENSION gets added when creating commits not on group creations


4. **Bob generates his KeyPackage** and publishes it as kind: 443 event

### Step 2: Alice adds Bob to group
1. **Alice creates Add proposal** using Bob's KeyPackage
2. **Alice commits the proposal** to update group state
3. **Alice publishes Group Event** (kind: 445) with encrypted Commit message
4. **Alice sends Welcome Event** (kind: 444) to Bob via NIP-59 gift-wrapping

### Step 3: Bob receives and joins
1. **Bob decrypts Welcome Event** using his identity key
2. **Bob processes Welcome message** → initializes his MLS group state
3. **Bob now has shared group key state** and can derive epoch keys for messages


### Step 4: Message exchange
1. **Alice sends a message in the group**:
   - MLS encrypts plaintext with current sender epoch key
   - Creates Group Event (kind: 445) with encrypted MLSMessage
   - Uses ephemeral Nostr keypair derived from MLS exporter_secret
   - Tags with nostr_group_id (not MLS group ID)

2. **Bob receives it**:
   - Uses his MLS group state to decrypt ciphertext using corresponding epoch key
   - MLS updates group state if rekey or commit occurred
   - Epoch keys rotate regularly for forward secrecy

## 3. Required MLS Extensions

### nostr_group_data Extension
```typescript
{
  nostr_group_id: "32-byte hex string", // Public group identifier
  name: "Group Name",
  description: "Group description",
  admin_pubkeys: ["alice_pubkey"],
  relays: ["wss://relay1.com", "wss://relay2.com"]
}
```

### Required Capabilities
- `ratchet_tree`: Required for group operations
- `nostr_group_data`: Required for Nostr integration
- `last_resort`: Recommended for KeyPackage reuse prevention

## 4. Event Types

### KeyPackage Event (kind: 443)
- Content: Serialized MLS KeyPackageBundle
- Tags: mls_protocol_version, ciphersuite, extensions, relays
- Signed with identity key

### Welcome Event (kind: 444)
- Content: Serialized MLS Welcome object
- Tags: e (KeyPackage Event ID), relays
- Gift-wrapped with NIP-59, never signed

### Group Event (kind: 445)
- Content: NIP-44 encrypted MLSMessage
- Tags: h (nostr_group_id)
- Uses ephemeral keypair derived from MLS exporter_secret
- Signed with ephemeral key

## 5. Security Considerations

- **MLS Group ID**: Never publish to relays (private)
- **Nostr Group ID**: Can be published and changed over time
- **Key rotation**: Rotate signing keys regularly for post-compromise security
- **Forward secrecy**: MLS handles automatic key rotation per epoch
- **Device compromise**: Consider group compromised if device is compromised

## 6. Implementation Notes

- Use `ts-mls` library for core MLS operations
- Implement proper error handling for race conditions
- Store group state securely on device
- Handle Commit message ordering carefully
- Support self-destructing messages for enhanced privacy
