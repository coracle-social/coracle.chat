import { load } from '@welshman/net';
import { deriveProfile, userProfile, setProfile } from '@welshman/app';
import { Router } from '@welshman/router';
import { publishThunk } from '@welshman/app';
import { makeEvent } from '@welshman/util';
import { pubkey } from '@welshman/app';

// ForPubkey is used to select relay the user reads notes created by other people that mention him from

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

    const currentPubkey = pubkey.get();
    if (!currentPubkey) {
      throw new Error('No user logged in');
    }

    // Get current profile data to merge with updates
    const currentProfile = userProfile.get();
    console.log('[PROFILE] Current profile data:', currentProfile);

    const updatedProfile = {
      ...currentProfile,
      ...updates,
    };

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

    // Get current pubkey
    const currentPubkey = pubkey.get();
    if (!currentPubkey) {
      throw new Error('No user logged in');
    }

    // Get current profile data directly from the store
    const profileData = userProfile.get();
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

    console.log('[PROFILE] Publishing to relays:', publishRelays);

    await publishThunk({
      relays: publishRelays,
      event: profileEvent,
      delay: 3000,
    });

    console.log('[PROFILE] Picture update published successfully');
  } catch (error: unknown) {
    console.error('[PROFILE] Error updating picture:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update picture';
    throw new Error(errorMessage);
  }
};