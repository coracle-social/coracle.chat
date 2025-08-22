const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

// LocalStorage polyfill (needed for some web-first deps)
if (typeof global !== 'undefined' && !global.localStorage) {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0
  };
}

const config = getDefaultConfig(__dirname);

// --------------------
// Extensions
// --------------------
const { assetExts, sourceExts } = config.resolver;
config.resolver.assetExts = assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg', 'ts', 'tsx', 'mjs'];

// --------------------
// SVG transformer
// --------------------
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// --------------------
// Resolution tweaks
// --------------------
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// ts-mls node_modules removed - using source files directly

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'nostr-signer-capacitor-plugin') {
    return {
      filePath: require.resolve('./lib/utils/empty-module.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// --------------------
// @noble aliases removed - using source files directly

// --------------------
// Local packages
// --------------------
const localWelshmanPath = path.resolve(__dirname, '../welshman/welshman/packages');
const localTsMlsPath = path.resolve(__dirname, '../ts-mls');

// We point to the built version for better compatibility
console.log('localTsMlsPath', localTsMlsPath);

// Try the standard build first, fallback to metro-specific if needed
let tsMlsEntry = path.resolve(localTsMlsPath, 'dist/src/index.js');

// Fallback to metro build if standard doesn't exist
if (!fs.existsSync(tsMlsEntry)) {
  tsMlsEntry = path.resolve(localTsMlsPath, 'dist/metro/index.js');
  console.log('⚠️  Standard ts-mls build not found, using Metro build');
} else {
  console.log('✅ Using standard ts-mls build');
}

// Safety check
if (!fs.existsSync(tsMlsEntry)) {
  throw new Error(`❌ ts-mls built file not found: ${tsMlsEntry}. Make sure to run 'npm run build' in the ts-mls directory first.`);
}

// Add local ts-mls to watchFolders
config.watchFolders.push(path.resolve(__dirname, '../ts-mls'));

// ts-mls alias removed - using direct imports instead

// Welshman local setup
if (fs.existsSync(localWelshmanPath)) {
  console.log('🔗 Using local Welshman packages for development');

  config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, 'node_modules'),
    localWelshmanPath,
  ];

  config.resolver.alias = {
    ...config.resolver.alias,
    '@welshman/app': path.resolve(localWelshmanPath, 'app/dist/app/src/index.js'),
    '@welshman/net': path.resolve(localWelshmanPath, 'net/dist/net/src/index.js'),
    '@welshman/signer': path.resolve(localWelshmanPath, 'signer/dist/signer/src/index.js'),
    '@welshman/util': path.resolve(localWelshmanPath, 'util/dist/util/src/index.js'),
    '@welshman/store': path.resolve(localWelshmanPath, 'store/dist/store/src/index.js'),
    '@welshman/lib': path.resolve(localWelshmanPath, 'lib/dist/index.js'),
    '@welshman/relay': path.resolve(localWelshmanPath, 'relay/dist/relay/src/index.js'),
    '@welshman/router': path.resolve(localWelshmanPath, 'router/dist/index.js'),
    '@ts-mls': path.resolve(localTsMlsPath, 'dist/src'),
  };

  config.watchFolders.push(localWelshmanPath);
} else {
  console.log('📦 Using npm Welshman packages');

  // Add ts-mls alias for local development
  config.resolver.alias = {
    ...config.resolver.alias,
    '@ts-mls': path.resolve(localTsMlsPath, 'dist/src'),
  };
}

module.exports = config;




/*
// MLSReactNativeCompatibilityTest.tsx
import { useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import {
    getCiphersuiteFromName,
    getCiphersuiteImpl,
    type CiphersuiteName
} from './ts-mls/dist/metro/index.js';

export default function MLSReactNativeCompatibilityTest() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runCompatibilityTests = async () => {
    setResults([]);

    try {
      const ciphersuiteName: CiphersuiteName = "MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519";
      addResult(`Testing ciphersuite: ${ciphersuiteName}`);

      const ciphersuite = getCiphersuiteFromName(ciphersuiteName);
      const impl = await getCiphersuiteImpl(ciphersuite);

      // Test 1: Basic crypto operations
      addResult("1. Testing basic crypto operations...");
      const testMessage = new TextEncoder().encode("Test message");
      const hash = await impl.hash.digest(testMessage);
      addResult(`   ✅ Hash: ${hash.length} bytes`);

      const { signKey, publicKey } = await impl.signature.keygen();
      const signature = await impl.signature.sign(signKey, testMessage);
      const isValid = await impl.signature.verify(publicKey, testMessage, signature);
      addResult(`   ✅ Signature: ${isValid ? 'PASSED' : 'FAILED'}`);

      // Test 2: HPKE operations (This is the critical test!)
      addResult("2. Testing HPKE operations...");
      try {
        // This will fail without react-native-webcrypto
        const hpke = impl.hpke;
        addResult("   ✅ HPKE object created successfully");

        // Test actual HPKE operations
        const { publicKey: hpkePub, privateKey: hpkePriv } = await hpke.generateKeyPair();
        addResult("   ✅ HPKE key pair generated");

        const plaintext = new TextEncoder().encode("Secret message");
        const { ct, enc } = await hpke.seal(hpkePub, plaintext, new Uint8Array());
        addResult("   ✅ HPKE encryption successful");

        const decrypted = await hpke.open(hpkePriv, enc, ct, new Uint8Array());
        const decryptedText = new TextDecoder().decode(decrypted);
        addResult(`   ✅ HPKE decryption successful: "${decryptedText}"`);

      } catch (hpkeError) {
        addResult(`   ❌ HPKE failed: ${hpkeError.message}`);
        addResult("   💡 This means you need react-native-webcrypto!");
        return; // Stop here if HPKE fails
      }

      // Test 3: Full MLS operations
      addResult("3. Testing MLS operations...");
      // Add tests for group creation, message sending, etc.

      addResult("🎉 FULL REACT NATIVE COMPATIBILITY CONFIRMED!");

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      addResult(`❌ Test failed: ${errorMessage}`);
    }
  };

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        MLS React Native Compatibility Test
      </Text>

      <Button title="Run Compatibility Tests" onPress={runCompatibilityTests} />

      <ScrollView style={{ marginTop: 20, flex: 1 }}>
        {results.map((result, index) => (
          <Text key={index} style={{ marginBottom: 5, fontSize: 12 }}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}
*/


// const { getDefaultConfig } = require('expo/metro-config');
// const path = require('path');

// // Add localStorage polyfill for Node.js builds
// if (typeof global !== 'undefined' && !global.localStorage) {
//   global.localStorage = {
//     getItem: () => null,
//     setItem: () => {},
//     removeItem: () => {},
//     clear: () => {},
//     key: () => null,
//     length: 0
//   };
// }

// const config = getDefaultConfig(__dirname);

// // Extract the default values first
// const { assetExts, sourceExts } = config.resolver;

// // ⚠️ Important: Remove 'svg' from assetExts and add it to sourceExts
// config.resolver.assetExts = assetExts.filter(ext => ext !== 'svg');
// config.resolver.sourceExts = [...sourceExts, 'svg'];

// // Configure SVG transformer
// config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// // Add fallback resolution fields
// config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// // Platform overrides
// config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// // Handle ES modules and dynamic imports better
// config.resolver.unstable_enableSymlinks = false;
// config.resolver.unstable_enablePackageExports = true;

// // Custom module resolver for incompatible packages
// config.resolver.resolveRequest = (context, moduleName, platform) => {
//   if (moduleName === 'nostr-signer-capacitor-plugin') {
//     return {
//       filePath: require.resolve('./lib/utils/empty-module.js'),
//       type: 'sourceFile',
//     };
//   }

//   // Default resolution
//   return context.resolveRequest(context, moduleName, platform);
// };

// // Add @noble module aliases outside the conditional logic
// config.resolver.alias = {
//   // Ensure @noble modules resolve from ts-mls package with explicit subpath mappings
//   '@noble/curves': path.resolve(__dirname, '../ts-mls/node_modules/@noble/curves'),
//   '@noble/curves/ed25519': path.resolve(__dirname, '../ts-mls/node_modules/@noble/curves/esm/ed25519.js'),
//   '@noble/curves/ed448': path.resolve(__dirname, '../ts-mls/node_modules/@noble/curves/esm/ed448.js'),
//   '@noble/curves/nist': path.resolve(__dirname, '../ts-mls/node_modules/@noble/curves/esm/nist.js'),
//   '@noble/post-quantum': path.resolve(__dirname, '../ts-mls/node_modules/@noble/post-quantum'),
//   '@noble/post-quantum/ml-dsa': path.resolve(__dirname, '../ts-mls/node_modules/@noble/post-quantum/esm/ml-dsa.js'),
// };

// // LOCAL WELSHMAN CONFIGURATION (only for local development)
// const fs = require('fs');

// // Check if local Welshman packages exist - using hardcoded path for iOS compatibility
// const localWelshmanPath = '/Users/devinstuddard/coracle/welshman/welshman/packages';
// const hasLocalWelshman = fs.existsSync(localWelshmanPath);
// console.log('hasLocalWelshman', hasLocalWelshman);
// if (!hasLocalWelshman) {
//   console.log('🔗 Using local Welshman packages for development');

//   // Add resolver configuration for local Welshman packages
//   config.resolver.nodeModulesPaths = [
//     path.resolve(__dirname, 'node_modules'),
//     localWelshmanPath,
//     path.resolve(__dirname, '../ts-mls/node_modules'),
//   ];

//   // Force Metro to treat ts-mls as a local package with its own node_modules
//   config.resolver.platforms = ['ios', 'android', 'native', 'web'];
//   config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

//   // Ensure Metro can resolve modules from ts-mls dependencies
//   config.resolver.unstable_enableSymlinks = false;
//   config.resolver.unstable_enablePackageExports = true;

//   // Add alias for Welshman packages to ensure they resolve correctly
//   config.resolver.alias = {
//     '@welshman/app': path.resolve(localWelshmanPath, 'app/dist/app/src/index.js'),
//     '@welshman/net': path.resolve(localWelshmanPath, 'net/dist/net/src/index.js'),
//     '@welshman/signer': path.resolve(localWelshmanPath, 'signer/dist/signer/src/index.js'),
//     '@welshman/util': path.resolve(localWelshmanPath, 'util/dist/util/src/index.js'),
//     '@welshman/store': path.resolve(localWelshmanPath, 'store/dist/store/src/index.js'),
//     '@welshman/lib': path.resolve(localWelshmanPath, 'lib/dist/index.js'),
//     '@welshman/relay': path.resolve(localWelshmanPath, 'relay/dist/relay/src/index.js'),
//     '@welshman/router': path.resolve(localWelshmanPath, 'router/dist/router/src/index.js'),
//     'ts-mls': path.resolve(__dirname, '../ts-mls/dist/src/index.js'),
//   };

//   // Add watchFolders to ensure Metro watches the Welshman packages
//   config.watchFolders = [localWelshmanPath, path.resolve(__dirname, '../ts-mls')];
// } else {
//   console.log('📦 Using npm Welshman packages');

//   // Add basic ts-mls alias for local development
//   config.resolver.alias = {
//     'ts-mls': path.resolve(__dirname, '../ts-mls/dist/src/index.js'),
//   };

//   // Add watchFolders for ts-mls
//   config.watchFolders = [path.resolve(__dirname, '../ts-mls')];
// }
// module.exports = config;
