const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Extract the default values first
const { assetExts, sourceExts } = config.resolver;

// ⚠️ Important: Remove 'svg' from assetExts and add it to sourceExts
config.resolver.assetExts = assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg'];

// Configure SVG transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Add fallback resolution fields
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Platform overrides
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Custom module resolver for incompatible packages
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'nostr-signer-capacitor-plugin') {
    return {
      filePath: require.resolve('./lib/utils/empty-module.js'),
      type: 'sourceFile',
    };
  }

  // Default resolution
  return context.resolveRequest(context, moduleName, platform);
};


// LOCAL WELSHMAN CONFIGURATION (only for local development)
const path = require('path');
const fs = require('fs');

// Check if local Welshman packages exist
const localWelshmanPath = path.resolve(__dirname, '../welshman/welshman/packages');
const hasLocalWelshman = fs.existsSync(localWelshmanPath);

if (hasLocalWelshman) {
  console.log('🔗 Using local Welshman packages for development');

  // Add resolver configuration for local Welshman packages
  config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, 'node_modules'),
    localWelshmanPath,
  ];

  // Add alias for Welshman packages to ensure they resolve correctly
  config.resolver.alias = {
    '@welshman/app': path.resolve(localWelshmanPath, 'app/dist/app/src/index.js'),
    '@welshman/net': path.resolve(localWelshmanPath, 'net/dist/net/src/index.js'),
    '@welshman/signer': path.resolve(localWelshmanPath, 'signer/dist/signer/src/index.js'),
    '@welshman/util': path.resolve(localWelshmanPath, 'util/dist/util/src/index.js'),
    '@welshman/store': path.resolve(localWelshmanPath, 'store/dist/store/src/index.js'),
    '@welshman/lib': path.resolve(localWelshmanPath, 'lib/dist/index.js'),
    '@welshman/relay': path.resolve(localWelshmanPath, 'relay/dist/relay/src/index.js'),
    '@welshman/router': path.resolve(localWelshmanPath, 'router/dist/index.js'),
  };

  // Add watchFolders to ensure Metro watches the Welshman packages
  config.watchFolders = [localWelshmanPath];
} else {
  console.log('📦 Using npm Welshman packages');
}

module.exports = config;
