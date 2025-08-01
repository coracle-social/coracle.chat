import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const webStorageProvider = {
  get: async (key: string) => {
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

    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : undefined
    } catch (error) {
      console.warn('Failed to get from localStorage:', error)
      return undefined
    }
  },
  set: async (key: string, value: unknown) => {
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
  }
}

const mobileStorageProvider = {
  get: async (key: string) => {
    if (typeof key !== 'string') {
      console.warn('[STORAGE] Mobile provider received non-string key:', key, 'Type:', typeof key);
    }

    // Ensure key is a string
    const stringKey = typeof key === 'string' ? key : JSON.stringify(key)

    const value = await AsyncStorage.getItem(stringKey)
    return value ? JSON.parse(value) : undefined
  },
  set: async (key: string, value: unknown) => {
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
  }
}

// Choose provider based on platform
export const platformStorageProvider = Platform.OS === 'web'
  ? webStorageProvider
  : mobileStorageProvider
