// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Ensure the watchFolders includes the project directory
defaultConfig.watchFolders = [__dirname];

// Make sure we correctly resolve all file types
defaultConfig.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
defaultConfig.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add resolver to help with module aliasing and avoid duplicate modules
defaultConfig.resolver.extraNodeModules = new Proxy({}, {
  get: (target, name) => {
    return name in target ? target[name] : path.join(__dirname, `node_modules/${name}`);
  }
});

// Performance optimizations
defaultConfig.maxWorkers = 2;  // Reduce workers to help with memory issues

// Export the configuration
module.exports = defaultConfig;
