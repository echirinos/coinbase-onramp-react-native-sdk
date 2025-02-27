module.exports = {
  preset: "react-native",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-webview)/)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],
  setupFiles: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
  moduleNameMapper: {
    "^crypto$": "<rootDir>/node_modules/react-native-crypto-js",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  testEnvironment: "node",
};
