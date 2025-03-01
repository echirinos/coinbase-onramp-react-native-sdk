const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Crypto module resolution
config.resolver.extraNodeModules = {
  crypto: require.resolve("react-native-crypto"),
  stream: require.resolve("stream-browserify"),
  buffer: require.resolve("buffer"),
  events: require.resolve("events"),
};

module.exports = config;
