import { synced, withGetter } from '@welshman/store';
import { platformStorageProvider } from '@/utils/storage-provider';

// Create synced stores with platform storage provider
export const persistentPubkey = withGetter(synced({
  key: "pubkey",
  storage: platformStorageProvider,
  defaultValue: undefined as string | undefined,
}));

export const persistentSessions = withGetter(synced({
  key: "sessions",
  storage: platformStorageProvider,
  defaultValue: {} as Record<string, any>,
}));

// Initialize storage by loading initial values
export const initializeWelshmanStorage = async () => {
  console.log("Initializing Welshman storage with platform provider");
  
  try {
    // The synced stores will automatically load from storage on initialization
    // and sync changes back to storage via subscriptions
    console.log("Welshman storage initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Welshman storage:", error);
  }
}; 
/*
import { synced, localStorageProvider } from '@welshman/store'
const store = synced({ key: "data", storage: localStorageProvider, defaultValue: {} }), const rnProvider = { get: async (k) => AsyncStorage.getItem(k), set: async (k, v) => AsyncStorage.setItem(k, v) }
const store = synced({ key: "data", storage: rnProvider, defaultValue: {} })
*/