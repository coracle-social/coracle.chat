import { sync } from '@welshman/store';
import { pubkey, sessions } from '@welshman/app';
import { platformStorageProvider } from '@/core/state/storage-provider';

// Sync existing Welshman stores with platform storage
export const initializeWelshmanStorage = async () => {
  console.log("Initializing Welshman storage with platform provider");

  try {
    // Sync the main Welshman stores with persistent storage
    sync({
      key: "pubkey",
      store: pubkey,
      storage: platformStorageProvider,
    });

    sync({
      key: "sessions",
      store: sessions,
      storage: platformStorageProvider,
    });

    console.log("Welshman storage synced successfully");
  } catch (error) {
    console.error("Failed to initialize Welshman storage:", error);
  }
};
/*
import { synced, localStorageProvider } from '@welshman/store'
const store = synced({ key: "data", storage: localStorageProvider, defaultValue: {} }), const rnProvider = { get: async (k) => AsyncStorage.getItem(k), set: async (k, v) => AsyncStorage.setItem(k, v) }
const store = synced({ key: "data", storage: rnProvider, defaultValue: {} })
*/