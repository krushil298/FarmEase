const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure web platform is properly bundled
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add web-compatible source extensions
config.resolver.sourceExts = [
    ...config.resolver.sourceExts,
    'web.js',
    'web.jsx',
    'web.ts',
    'web.tsx',
];

module.exports = config;
