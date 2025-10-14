const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Avoid conflicts with parent node_modules
    blockList: [
      /.*\/node_modules\/react-native-sound\/node_modules\/.*/,
      /.*\/node_modules\/react-native-sound\/example\/.*/,
    ],
  },
  watchFolders: [
    // Only watch current directory
    __dirname,
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
