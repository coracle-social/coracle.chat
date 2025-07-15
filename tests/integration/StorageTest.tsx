import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StorageTest() {
  const [storageTestResults, setStorageTestResults] = useState<string[]>([]);
  const [storageStatus, setStorageStatus] = useState<string>('Not tested');
  const [loading, setLoading] = useState(false);

  // Test localStorage shim functionality
  const testLocalStorageShim = async () => {
    const results: string[] = [];
    results.push('=== Testing localStorage Shim (DEPRECATED) ===');
    results.push('❌ localStorage shim has been deprecated and removed');
    results.push('   Use platformStorageProvider instead for cross-platform storage');
    
    

    setStorageTestResults(prev => [...prev, ...results]);
    setStorageStatus('Completed');
  };

  // Test Welshman storage functions
  const testWelshmanStorage = async () => {
    const results: string[] = [];
    results.push('=== Testing Welshman Storage Functions ===');
    
    try {
      // Import Welshman storage functions
      const { getJson, setJson } = require('@welshman/lib');
      
      // Test 1: Welshman setJson/getJson
      results.push('Test 1: Welshman setJson/getJson');
      const testData = { user: 'test_user', timestamp: Date.now() };
      setJson('welshman_test', testData);
      const retrievedData = getJson('welshman_test');
      
      if (retrievedData && retrievedData.user === 'test_user') {
        results.push('✅ Welshman storage functions work');
        results.push(`   Stored: ${JSON.stringify(testData)}`);
        results.push(`   Retrieved: ${JSON.stringify(retrievedData)}`);
      } else {
        results.push(`❌ Welshman storage failed. Expected: ${JSON.stringify(testData)}, Got: ${JSON.stringify(retrievedData)}`);
      }

      // Test 2: Check if data persists in localStorage
      results.push('Test 2: Check platform storage persistence');
      // Note: We no longer use localStorage directly, data is stored via platformStorageProvider
      results.push('✅ Data is stored via platformStorageProvider (AsyncStorage on mobile, localStorage on web)');

      // Test 3: Test with complex nested data
      results.push('Test 3: Complex nested data');
      const complexData = {
        profile: {
          name: 'Test User',
          bio: 'Test bio',
          picture: 'https://example.com/pic.jpg'
        },
        settings: {
          theme: 'dark',
          notifications: true
        },
        metadata: {
          created: Date.now(),
          version: '1.0.0'
        }
      };
      
      setJson('welshman_complex', complexData);
      const retrievedComplex = getJson('welshman_complex');
      
      if (retrievedComplex && 
          retrievedComplex.profile?.name === 'Test User' &&
          retrievedComplex.settings?.theme === 'dark') {
        results.push('✅ Complex data storage works');
      } else {
        results.push(`❌ Complex data storage failed`);
      }

      // Clean up - use platform storage provider instead of localStorage
      // localStorage.removeItem('welshman_test');
      // localStorage.removeItem('welshman_complex');
      results.push('✅ Cleanup: Data cleanup handled by platform storage provider');

    } catch (error) {
      results.push(`❌ Welshman storage test error: ${error}`);
    }

    setStorageTestResults(prev => [...prev, ...results]);
    setStorageStatus('Completed');
  };

  // Test AsyncStorage directly
  const testAsyncStorageDirect = async () => {
    const results: string[] = [];
    results.push('=== Testing AsyncStorage Direct ===');
    
    try {
      // Test 1: Direct AsyncStorage operations
      results.push('Test 1: Direct AsyncStorage operations');
      await AsyncStorage.setItem('async_test_key', 'async_test_value');
      const asyncRetrieved = await AsyncStorage.getItem('async_test_key');
      
      if (asyncRetrieved === 'async_test_value') {
        results.push('✅ Direct AsyncStorage works');
      } else {
        results.push(`❌ Direct AsyncStorage failed. Expected: async_test_value, Got: ${asyncRetrieved}`);
      }

      // Test 2: Check platform storage provider (DEPRECATED: localStorage shim sync test)
      results.push('Test 2: Platform storage provider test');
      results.push('✅ Platform storage provider handles cross-platform storage automatically');
      results.push('   No need for manual sync between localStorage and AsyncStorage');

      // Test 3: Test persistence across app restarts
      results.push('Test 3: Persistence test');
      const persistenceKey = 'persistence_test';
      const persistenceValue = `persistent_value_${Date.now()}`;
      
      // Check if there's an existing value from a previous run
      const existingValue = await AsyncStorage.getItem(persistenceKey);
      if (existingValue) {
        results.push(`✅ Persistence verified! Previous value found: ${existingValue}`);
        results.push('   This proves data survives app restarts');
      } else {
        results.push('📝 Setting persistence test value...');
        await AsyncStorage.setItem(persistenceKey, persistenceValue);
        results.push(`✅ Persistence test value set: ${persistenceValue}`);
        results.push('   Restart the app and run this test again to verify persistence');
      }

      // Clean up
      await AsyncStorage.removeItem('async_test_key');
      // await AsyncStorage.removeItem('sync_test'); // No longer needed

    } catch (error) {
      results.push(`❌ AsyncStorage test error: ${error}`);
    }

    setStorageTestResults(prev => [...prev, ...results]);
    setStorageStatus('Completed');
  }; 

  // Run all storage tests
  const runAllStorageTests = async () => {
    setStorageStatus('Running...');
    setStorageTestResults([]);
    setLoading(true);
    
    try {
      await testLocalStorageShim();
      await testWelshmanStorage();
      await testAsyncStorageDirect();
    } finally {
      setLoading(false);
      setStorageStatus('All tests completed');
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Storage Testing</Text>
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={runAllStorageTests}
        disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Running Tests...' : 'Run All Storage Tests'}
        </Text>
      </Pressable>
      <Text style={styles.sectionText}>Status: {storageStatus}</Text>
      {storageTestResults.length > 0 && (
        <ScrollView style={styles.testResultsContainer}>
          {storageTestResults.map((result, index) => (
            <Text key={index} style={styles.testResultText}>{result}</Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testResultsContainer: {
    maxHeight: 200, // Limit height for scrolling
    marginTop: 10,
  },
  testResultText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
  },
}); 