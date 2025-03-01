// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add resolution for Node.js modules
config.resolver.extraNodeModules = {
  stream: require.resolve("stream-browserify"),
  crypto: require.resolve("react-native-crypto"),
  buffer: require.resolve("buffer"),
  events: require.resolve("events"),
  process: require.resolve("process"),
};

module.exports = config;
