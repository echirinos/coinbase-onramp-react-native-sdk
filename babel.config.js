module.exports = {
  presets: [
    "module:metro-react-native-babel-preset",
    "@babel/preset-typescript",
  ],
  plugins: [
    "@babel/plugin-transform-flow-strip-types",
    "@babel/plugin-proposal-export-namespace-from",
  ],
};
