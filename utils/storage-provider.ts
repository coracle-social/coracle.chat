import { Platform } from 'react-native'

const webStorageProvider = {
  get: async (key: string) => {
    try {
      if (typeof key !== 'string') {
        console.warn('[STORAGE] Web provider received non-string key:', key, 'Type:', typeof key);
      }
      
      // Check if localStorage is available and working
      if (typeof window === 'undefined' || typeof localStorage === 'undefined' || !localStorage) {
        return undefined
      }
      
      try {
        localStorage.setItem('test', 'test')
        localStorage.removeItem('test')
      } catch (testError) {
        console.warn('localStorage not available:', testError)
        return undefined
      }
      
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : undefined
    } catch (error) {
      console.warn('Failed to get from localStorage:', error)
      return undefined
    }
  },
  set: async (key: string, value: any) => {
    try {
      if (typeof key !== 'string') {
        console.warn('[STORAGE] Web provider received non-string key:', key, 'Type:', typeof key);
      }
      
      // Check if localStorage is available and working
      if (typeof window === 'undefined' || typeof localStorage === 'undefined' || !localStorage) {
        return
      }
      
      try {
        localStorage.setItem('test', 'test')
        localStorage.removeItem('test')
      } catch (testError) {
        console.warn('localStorage not available:', testError)
        return
      }
      
      if (value === undefined || value === null) {
        localStorage.removeItem(key)
        return
      }
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to set to localStorage:', error)
    }
  }
}

const mobileStorageProvider = {
  get: async (key: string) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default
      
      // Debug: Log if key is not a string
      if (typeof key !== 'string') {
        console.warn('[STORAGE] Mobile provider received non-string key:', key, 'Type:', typeof key);
      }
      
      // Ensure key is a string
      const stringKey = typeof key === 'string' ? key : JSON.stringify(key)
      
      const value = await AsyncStorage.getItem(stringKey)
      return value ? JSON.parse(value) : undefined
    } catch (error) {
      console.warn('Failed to get from AsyncStorage:', error)
      return undefined
    }
  },
  set: async (key: string, value: any) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default
      
      // Debug: Log if key is not a string
      if (typeof key !== 'string') {
        console.warn('[STORAGE] Mobile provider received non-string key:', key, 'Type:', typeof key);
      }
      
      // Ensure key is a string
      const stringKey = typeof key === 'string' ? key : JSON.stringify(key)
      
      // Don't store undefined/null values - use removeItem instead
      if (value === undefined || value === null) {
        await AsyncStorage.removeItem(stringKey)
        return
      }
      await AsyncStorage.setItem(stringKey, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to set to AsyncStorage:', error)
    }
  }
}

// Choose provider based on platform
export const platformStorageProvider = Platform.OS === 'web' 
  ? webStorageProvider 
  : mobileStorageProvider


/*
import { synced, localStorageProvider } from '@welshman/store'
const store = synced({ key: "data", storage: localStorageProvider, defaultValue: {} }), const rnProvider = { get: async (k) => AsyncStorage.getItem(k), set: async (k, v) => AsyncStorage.setItem(k, v) }
const store = synced({ key: "data", storage: rnProvider, defaultValue: {} })
*/


/*
// React Native version
const reactNativeStorageProvider = {
  get: async (key) => {
    const value = await AsyncStorage.getItem(key)
    return value ? JSON.parse(value) : undefined
  },
  set: async (key, value) => {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  }
}

const persistentPubkey = synced({
  key: "pubkey",
  storage: reactNativeStorageProvider,
  defaultValue: undefined
})
*/