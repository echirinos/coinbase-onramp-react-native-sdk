module.exports = {
  name: "coinbase-npm-tester",
  slug: "coinbase-npm-tester",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.coinbase.npmtester",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.coinbase.npmtester",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    eas: {
      projectId: "coinbase-npm-tester",
    },
  },
  // Add this to ensure proper module resolution
  resolver: {
    sourceExts: ["jsx", "js", "ts", "tsx", "cjs", "json"],
    extraNodeModules: {
      crypto: "react-native-crypto",
      stream: "stream-browserify",
      buffer: "buffer",
      events: "events",
    },
  },
};
