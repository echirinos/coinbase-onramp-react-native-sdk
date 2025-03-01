module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Add module resolver for Node.js polyfills
      [
        "module-resolver",
        {
          alias: {
            stream: "stream-browserify",
            crypto: "react-native-crypto",
            buffer: "buffer",
            events: "events",
            process: "process",
          },
        },
      ],
      // expo-router/babel is deprecated in SDK 50
    ],
  };
};
