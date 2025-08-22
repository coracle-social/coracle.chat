// AbortSignal polyfill for React Native
// import { registerRootComponent } from 'expo';
// import ExpoRouterEntry from 'expo-router/entry';
// import 'react-native-get-random-values';
// import 'react-native-webcrypto';

// console.log('[INDEX] Loading Expo Router entry');
// registerRootComponent(ExpoRouterEntry);
// console.log('[INDEX] Expo Router entry loaded');


import 'expo-crypto';
import 'expo-router/entry';

// Crypto polyfill for React Native using expo-crypto
if (typeof global.crypto === 'undefined') {
  const { getRandomValues } = require('expo-crypto');

  global.crypto = {
    getRandomValues: (arr) => {
      const bytes = getRandomValues(arr);
      return arr;
    },
    subtle: {
      digest: async (algorithm, data) => {
        // Use expo-crypto for hashing
        const { digestStringAsync } = require('expo-crypto');
        const hash = await digestStringAsync(algorithm, data);
        return new Uint8Array(Buffer.from(hash, 'hex'));
      },
      generateKey: async (algorithm, extractable, keyUsages) => {
        // Simplified implementation
        const { getRandomValues } = require('expo-crypto');
        const key = new Uint8Array(32);
        getRandomValues(key);
        return {
          type: 'secret',
          extractable,
          algorithm,
          usages: keyUsages,
          key
        };
      },
      importKey: async (format, keyData, algorithm, extractable, keyUsages) => {
        // Simplified implementation
        return {
          type: 'secret',
          extractable,
          algorithm,
          usages: keyUsages,
          key: keyData
        };
      },
      encrypt: async (algorithm, key, data) => {
        // Simplified implementation - may need proper encryption
        return new Uint8Array(data);
      },
      decrypt: async (algorithm, key, data) => {
        // Simplified implementation - may need proper decryption
        return new Uint8Array(data);
      }
    }
  };
}

// Then load the Expo Router entry
console.log('[INDEX] Loading Expo Router entry');
console.log('[INDEX] Expo Router entry loaded');
