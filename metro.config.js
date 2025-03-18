// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Ensure the watchFolders includes the project directory
defaultConfig.watchFolders = [__dirname];

// Make sure we correctly resolve all file types
defaultConfig.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
defaultConfig.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = defaultConfig;
