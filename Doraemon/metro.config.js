const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for worklets
config.resolver.assetExts.push('worklet');

module.exports = config;