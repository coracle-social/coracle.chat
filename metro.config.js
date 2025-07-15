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
      filePath: require.resolve('./utils/empty-module.js'),
      type: 'sourceFile',
    };
  }

  // Default resolution
  return context.resolveRequest(context, moduleName, platform);
};


// OLD LOCAL WELSHMAN CONFIGURATION (commented out for reference)
// const path = require('path');
// 
// // Add resolver configuration for local Welshman packages
// config.resolver.nodeModulesPaths = [
//   path.resolve(__dirname, 'node_modules'),
//   path.resolve(__dirname, '../welshman/welshman/packages'),
// ];
//
// // Add alias for Welshman packages to ensure they resolve correctly
// config.resolver.alias = {
//   '@welshman/app': path.resolve(__dirname, '../welshman/welshman/packages/app/dist/app/src/index.js'),
//   '@welshman/net': path.resolve(__dirname, '../welshman/welshman/packages/net/dist/net/src/index.js'),
//   '@welshman/signer': path.resolve(__dirname, '../welshman/welshman/packages/signer/dist/signer/src/index.js'),
//   '@welshman/util': path.resolve(__dirname, '../welshman/welshman/packages/util/dist/util/src/index.js'),
//   '@welshman/store': path.resolve(__dirname, '../welshman/welshman/packages/store/dist/store/src/index.js'),
//   '@welshman/lib': path.resolve(__dirname, '../welshman/welshman/packages/lib/dist/index.js'),
//   '@welshman/relay': path.resolve(__dirname, '../welshman/welshman/packages/relay/dist/relay/src/index.js'),
//   '@welshman/router': path.resolve(__dirname, '../welshman/welshman/packages/router/dist/index.js'),
// };
//
// // Add watchFolders to ensure Metro watches the Welshman packages
// config.watchFolders = [
//   path.resolve(__dirname, '../welshman/welshman/packages'),
// ];

module.exports = config; 