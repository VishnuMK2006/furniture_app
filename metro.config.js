const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure GLB models are treated as static assets
config.resolver.assetExts = config.resolver.assetExts.concat(['glb']);

module.exports = config;
