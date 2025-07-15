import { load } from '@welshman/net';
import { deriveProfile } from '@welshman/app';
import { Router } from '@welshman/router';
import { publishThunk } from '@welshman/app';
import { makeEvent } from '@welshman/util';
import { pubkey } from '@welshman/app';

/**
 * Establishes initial relay connections on app launch
 * @returns Promise that resolves when connections are established
 */
export const establishRelayConnections = async (): Promise<void> => {
  const startTime = Date.now();
  console.log("Establishing relay connections on app launch...");
  
  try {
    const defaultRelays = ["wss://relay.damus.io/", "wss://nos.lol/"];
    console.log("Using default relays:", defaultRelays);
    
    const events = await load({ 
      relays: defaultRelays, 
      filters: [{ kinds: [0], limit: 1 }] //load 1 profile event to establish connections
    });
    
    const duration = Date.now() - startTime;
    console.log(`Relay connections established in ${duration}ms, loaded ${events.length} events`);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.warn(`Failed to establish relay connections after ${duration}ms:`, error);
  }
};

/**
 * Loads a user's profile from Nostr relays
 * @param pubkey - The user's public key
 * @returns Promise that resolves with the profile data
 */
export const loadUserProfile = async (pubkey: string): Promise<any> => {
  if (!pubkey) {
    throw new Error('Pubkey is required');
  }

  try {
    console.log('[PROFILE] Loading profile for pubkey:', pubkey);
    
    const router = Router.get();
    let readRelays = router.ForPubkey(pubkey).getUrls();
    console.log('[PROFILE] Router read relays:', readRelays);
    
    if (readRelays.length === 0) {
      console.warn('[PROFILE] Router relays empty, using default relays');
      readRelays = ["wss://relay.damus.io/", "wss://nos.lol/"];
    }
    
    console.log('[PROFILE] Final read relays:', readRelays);

    const store = deriveProfile(pubkey);
    console.log('[PROFILE] Store created:', store);
    
    const timeoutMs = 10000;
    const pollInterval = 200;
    let done = false;

    const profile = await new Promise<any>((resolve, reject) => {
      const start = Date.now();
      let unsub: (() => void) | undefined; 
      let timer: number | undefined; 

      unsub = store.subscribe((value) => {
        console.log('[PROFILE] Store callback received:', value);
        console.log('[PROFILE] Value type:', typeof value);
        console.log('[PROFILE] Value keys:', value ? Object.keys(value) : 'null/undefined');
        console.log('[PROFILE] Full value:', JSON.stringify(value, null, 2));
        
        if (value && (value.name || value.display_name || value.about)) {
          if (!done) {
            done = true;
            console.log('[PROFILE] Resolved profile:', value);
            unsub?.(); 
            clearInterval(timer);
            resolve(value);
          }
        }
      });

      timer = setInterval(() => {
        if (Date.now() - start > timeoutMs) {
          if (!done) {
            done = true;
            console.warn('[PROFILE] Timeout waiting for profile');
            unsub?.();
            clearInterval(timer);
            reject(new Error('Timed out waiting for profile'));
          }
        }
      }, pollInterval);
    });

    return profile;
  } catch (error: any) {
    console.error('[PROFILE] Error loading profile:', error);
    throw new Error(error.message || 'Failed to load profile');
  }
}; 

/**
 * Updates the user's profile name by publishing a kind 0 metadata event
 * @param newName - The new name to set
 * @param currentProfile - Optional current profile data to avoid reloading
 * @returns Promise that resolves when the event is published
 */
export const changeName = async (newName: string, currentProfile?: any): Promise<void> => {
  if (!newName || newName.trim() === '') {
    throw new Error('Name cannot be empty');
  }
  try {
    console.log('[PROFILE] Updating name to:', newName);
    
    const currentPubkey = pubkey.get();
    if (!currentPubkey) {
      throw new Error('No user logged in');
    }

    //get total profile data so updating doesnt lose anything
    let profileData = currentProfile;
    if (!profileData) {
      profileData = await loadUserProfile(currentPubkey);
    }
    console.log('[PROFILE] Current profile data:', profileData);

    const profileContent = JSON.stringify({
      ...profileData, // Preserve existing fields
      name: newName.trim(), // Update only the name
    });
    
    const profileEvent = makeEvent(0, { content: profileContent });

    // Get relays to publish to
    const router = Router.get();
    const publishRelays = router.FromUser().getUrls();
    
    if (publishRelays.length === 0) {
      console.warn('[PROFILE] No publish relays found, using default relays');
      publishRelays.push("wss://relay.damus.io/", "wss://nos.lol/");
    }

    console.log('[PROFILE] Publishing to relays:', publishRelays);

    publishThunk({
      relays: publishRelays,
      event: profileEvent,
      delay: 3000, 
    });

    console.log('[PROFILE] Name update published successfully');
  } catch (error: any) {
    console.error('[PROFILE] Error updating name:', error);
    throw new Error(error.message || 'Failed to update name');
  }
}; 

/**
 * Updates the user's profile description by publishing a kind 0 metadata event
 * @param newDescription - The new description/about text to set
 * @param currentProfile - Optional current profile data to avoid reloading
 * @returns Promise that resolves when the event is published
 */
export const changeDescription = async (newDescription: string, currentProfile?: any): Promise<void> => {
  if (newDescription === undefined || newDescription === null) {
    throw new Error('Description cannot be null or undefined');
  }

  try {
    console.log('[PROFILE] Updating description to:', newDescription);
    
    // Get current pubkey
    const currentPubkey = pubkey.get();
    if (!currentPubkey) {
      throw new Error('No user logged in');
    }

    //will not be provided until profile is fully completed
    let profileData = currentProfile;
    if (!profileData) {
      profileData = await loadUserProfile(currentPubkey);
    }
    console.log('[PROFILE] Current profile data:', profileData);

    // Create profile metadata event (kind 0) with merged data
    const profileContent = JSON.stringify({
      ...profileData, // Preserve existing fields
      about: newDescription.trim(), // Update only the description
    });
    
    const profileEvent = makeEvent(0, { content: profileContent });

    // Get relays to publish to
    const router = Router.get();
    const publishRelays = router.FromUser().getUrls();
    
    if (publishRelays.length === 0) {
      console.warn('[PROFILE] No publish relays found, using default relays');
      publishRelays.push("wss://relay.damus.io/", "wss://nos.lol/");
    }

    console.log('[PROFILE] Publishing to relays:', publishRelays);

    publishThunk({
      relays: publishRelays,
      event: profileEvent,
      delay: 3000, 
    });

    console.log('[PROFILE] Description update published successfully');
  } catch (error: any) {
    console.error('[PROFILE] Error updating description:', error);
    throw new Error(error.message || 'Failed to update description');
  }
}; 

/**
 * Updates the user's profile picture by publishing a kind 0 metadata event
 * @param newPictureUrl - The new picture URL to set
 * @param currentProfile - Optional current profile data to avoid reloading
 * @returns Promise that resolves when the event is published
 */
export const changePicture = async (newPictureUrl: string, currentProfile?: any): Promise<void> => {
  if (!newPictureUrl || newPictureUrl.trim() === '') {
    throw new Error('Picture URL cannot be empty');
  }

  try {
    console.log('[PROFILE] Updating picture to:', newPictureUrl);
    
    // Get current pubkey
    const currentPubkey = pubkey.get();
    if (!currentPubkey) {
      throw new Error('No user logged in');
    }

    let profileData = currentProfile;
    if (!profileData) {
      profileData = await loadUserProfile(currentPubkey);
    }
    console.log('[PROFILE] Current profile data:', profileData);

    // Create profile metadata event (kind 0) with merged data
    const profileContent = JSON.stringify({
      ...profileData, // Preserve existing fields
      picture: newPictureUrl.trim(), // Update only the picture
    });
    
    const profileEvent = makeEvent(0, { content: profileContent });

    // Get relays to publish to
    const router = Router.get();
    const publishRelays = router.FromUser().getUrls();
    
    if (publishRelays.length === 0) {
      console.warn('[PROFILE] No publish relays found, using default relays');
      publishRelays.push("wss://relay.damus.io/", "wss://nos.lol/");
    }

    console.log('[PROFILE] Publishing to relays:', publishRelays);

    publishThunk({
      relays: publishRelays,
      event: profileEvent,
      delay: 3000, 
    });

    console.log('[PROFILE] Picture update published successfully');
  } catch (error: any) {
    console.error('[PROFILE] Error updating picture:', error);
    throw new Error(error.message || 'Failed to update picture');
  }
}; 