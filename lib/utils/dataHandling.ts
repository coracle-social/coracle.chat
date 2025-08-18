import { getSession, getSigner, loginWithNip01, loginWithNip55, pubkey, publishThunk, setProfile, userProfile } from '@welshman/app';
import { publish } from '@welshman/net'; // ✅ Import publish directly
import { Router } from '@welshman/router';
import { getNip55, Nip55Signer } from '@welshman/signer';
import { makeEvent, NOTE } from '@welshman/util';
import { Alert, Platform } from 'react-native';


let nip55Initialized = false;
let nip55Available = false;

// Development fallback - load private key from environment
const getDevPrivateKey = (): string | null => {
  // Temporary hardcoded private key for development
  const devPrivateKey = 'insert private key here';

  if (devPrivateKey) {
    if (/^[0-9a-fA-F]{64}$/.test(devPrivateKey)) {
      return devPrivateKey;
    }
  }
  return null;
};

// Initialize NIP-55 session with NIP-01 fallback
const initializeNip55Session = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return true;
  if (nip55Initialized) return nip55Available;

  try {
    const apps = await getNip55();

    if (apps && apps.length > 0) {
      const damusApp = apps.find(app =>
        app.packageName.toLowerCase().includes('damus') ||
        app.packageName.toLowerCase().includes('nostr') ||
        app.packageName.toLowerCase().includes('amethyst')
      );

      const selectedApp = damusApp || apps[0];

      const signer = new Nip55Signer(selectedApp.packageName);
      const userPubkey = await signer.getPubkey();

      if (userPubkey) {
        await loginWithNip55(userPubkey, selectedApp.packageName);
        nip55Initialized = true;
        nip55Available = true;
        return true;
      }
    }

    // nip01 fallback while testing, just trying to spoof how nip55 will sign
    const devPrivateKey = getDevPrivateKey();
    if (devPrivateKey) {
      await loginWithNip01(devPrivateKey);
      nip55Initialized = true;
      nip55Available = true;
      return true;
    }

    nip55Initialized = true;
    nip55Available = false;
    return false;
  } catch (error) {
    console.error('[NIP-55] Error initializing session:', error);

    // nip01 fallback while testing, just trying to spoof how nip55 will sign
    const devPrivateKey = getDevPrivateKey();
    if (devPrivateKey) {
      try {
        await loginWithNip01(devPrivateKey);
        nip55Initialized = true;
        nip55Available = true;
        return true;
      } catch (nip01Error) {
        console.error('[DEV] NIP-01 fallback also failed:', nip01Error);
      }
    }

    nip55Initialized = true;
    nip55Available = false;
    return false;
  }
};



/**
 * Updates the user's profile by publishing a kind 0 metadata event
 * @param updates - Object containing profile fields to update
 * @returns Promise that resolves when the event is published
 */
export const updateProfile = async (updates: Partial<{
  name?: string;
  about?: string;
  picture?: string;
  display_name?: string;
  website?: string;
  nip05?: string;
  lud06?: string;
  lud16?: string;
}>): Promise<void> => {
  try {
    console.log('[PROFILE] Updating profile with:', updates);

    // Initialize NIP-55 session on mobile and check availability
    const nip55Available = await initializeNip55Session();

    if (Platform.OS !== 'web' && !nip55Available) {
      Alert.alert(
        'Signing App Required',
        'You need a Nostr signing app (like Damus) installed to update your profile on mobile. Please install a compatible app and try again.',
        [{ text: 'OK' }]
      );
      throw new Error('No NIP-55 signing app available');
    }

    // Check if we have a valid session after initialization
    const currentPubkey = pubkey.get();
    if (!currentPubkey) {
      throw new Error('No user logged in or session not properly initialized');
    }

    console.log('[PROFILE] Current pubkey:', currentPubkey);

    // Get current profile data to merge with updates
    const currentProfile = userProfile.get();
    console.log('[PROFILE] Current profile data:', currentProfile);

    const updatedProfile = {
      ...currentProfile,
      ...updates,
    };

    // Create profile metadata event (kind 0) with merged data
    const profileContent = JSON.stringify(updatedProfile);
    const profileEvent = makeEvent(0, { content: profileContent });

    console.log('[PROFILE] Created event:', profileEvent);

    // Get relays to publish to
    const router = Router.get();
    const publishRelays = router.FromUser().getUrls();

    console.log('[PROFILE] Publishing to relays:', publishRelays);

    // Try to use publishThunk first (for web/NIP-55)
    if (Platform.OS === 'web'){//} || nip55Available ) { // ✅ Temporary disabled for testing
      console.log('[PROFILE] Using publishThunk');
      const thunk = await publishThunk({
        relays: publishRelays,
        event: profileEvent,
        delay: 3000,
      });
      await thunk.result;
    } else {
      // Fallback: Manual signing and publishing for NIP-01
      console.log('[PROFILE] Using manual signing for NIP-01');
      const session = getSession(currentPubkey);
      if (!session) {
        throw new Error('No session found for current pubkey');
      }

      const signer = getSigner(session);
      if (!signer) {
        throw new Error('No signer found for current session');
      }

      // Manually sign the event
      const signedEvent = await signer.sign(profileEvent);
      console.log('[PROFILE] Event signed manually:', signedEvent);

      // Publish directly
      const publishResult = await publish({
        event: signedEvent,
        relays: publishRelays,
        timeout: 10000,
      });

      console.log('[PROFILE] Publish result:', publishResult);
    }

    // Update local store after successful publish
    setProfile(updatedProfile);

    console.log('[PROFILE] Profile update published successfully');
  } catch (error: unknown) {
    console.error('[PROFILE] Error updating profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
    throw new Error(errorMessage);
  }
};

//kept in as a placeholder, will be replaced by an implmentation using blossom
export const changePicture = async (newPictureUrl: string): Promise<void> => {
  if (!newPictureUrl || newPictureUrl.trim() === '') {
    throw new Error('Picture URL cannot be empty');
  }

  try {
    console.log('[PROFILE] Updating picture to:', newPictureUrl);

    // Initialize NIP-55 session on mobile and check availability
    const nip55Available = await initializeNip55Session();

    if (Platform.OS !== 'web' && !nip55Available) {
      Alert.alert(
        'Signing App Required',
        'You need a Nostr signing app (like Damus) installed to update your profile on mobile. Please install a compatible app and try again.',
        [{ text: 'OK' }]
      );
      throw new Error('No NIP-55 signing app available');
    }

    // Check if we have a valid session after initialization
    const currentPubkey = pubkey.get();
    if (!currentPubkey) {
      throw new Error('No user logged in or session not properly initialized');
    }

    console.log('[PROFILE] Current pubkey:', currentPubkey);

    // Get current profile data directly from the store
    const profileData = userProfile.get();
    console.log('[PROFILE] Current profile data:', profileData);

    // Create profile metadata event (kind 0) with merged data
    const profileContent = JSON.stringify({
      ...profileData, // Preserve existing fields
      picture: newPictureUrl.trim(), // Update only the picture
    });

    const profileEvent = makeEvent(0, { content: profileContent });

    console.log('[PROFILE] Created picture event:', profileEvent);

    // Get relays to publish to
    const router = Router.get();
    const publishRelays = router.FromUser().getUrls();

    console.log('[PROFILE] Publishing picture to relays:', publishRelays);

    // Try to use publishThunk first (for web/NIP-55)
    if (Platform.OS === 'web' || nip55Available) {
      console.log('[PROFILE] Using publishThunk for picture');
      const thunk = await publishThunk({
        relays: publishRelays,
        event: profileEvent,
        delay: 3000,
      });
      await thunk.result;
    } else {
      // Fallback: Manual signing and publishing for NIP-01
      console.log('[PROFILE] Using manual signing for picture (NIP-01)');
      const session = getSession(currentPubkey);
      if (!session) {
        throw new Error('No session found for current pubkey');
      }

      const signer = getSigner(session);
      if (!signer) {
        throw new Error('No signer found for current session');
      }

      // Manually sign the event
      const signedEvent = await signer.sign(profileEvent);
      console.log('[PROFILE] Picture event signed manually:', signedEvent);

      // Publish directly
      const publishResult = await publish({
        event: signedEvent,
        relays: publishRelays,
        timeout: 10000,
      });

      console.log('[PROFILE] Picture publish result:', publishResult);
    }

    console.log('[PROFILE] Picture update published successfully');
  } catch (error: unknown) {
    console.error('[PROFILE] Error updating picture:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update picture';
    throw new Error(errorMessage);
  }
};
//need to partially eject for damus to work via ios nip 55 signig
//probably implement nip01 manually signign for now?
//amethyst with nip 46/55 may work on android

/**
 * Publish a comment (NOTE event) that references another event
 * @param content - The comment content
 * @param eventId - The ID of the event being commented on
 * @returns Promise that resolves when the comment is published
 */
export const publishComment = async (content: string, eventId: string): Promise<void> => {
  try {
    console.log('[COMMENT] Publishing comment:', content, 'for event:', eventId);

    // Check if user is logged in
    const currentUserPubkey = pubkey.get();
    if (!currentUserPubkey) {
      throw new Error('No user logged in');
    }

    // Create a NOTE event that references the original post
    const commentEvent = makeEvent(NOTE, {
      content: content.trim(),
      tags: [
        ['e', eventId], // Reference to the original post
        ['p', currentUserPubkey], // Reference to the author
      ]
    });

    console.log('[COMMENT] Created comment event:', commentEvent);

    // Get relays to publish to
    const router = Router.get();
    const publishRelays = router.FromUser().getUrls();
    console.log('[COMMENT] Publishing to relays:', publishRelays);

    // Publish the comment
    await publishThunk({
      event: commentEvent,
      relays: publishRelays,
      delay: 3000,
    });

    console.log('[COMMENT] Comment published successfully');
  } catch (error: unknown) {
    console.error('[COMMENT] Error publishing comment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to publish comment';
    throw new Error(errorMessage);
  }
};
