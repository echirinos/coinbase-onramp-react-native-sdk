// Mock the crypto module
jest.mock("crypto", () => ({
  createHmac: jest.fn().mockImplementation(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue("mocked-signature"),
  })),
}));

// Mock react-native modules that might not be available in the test environment
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// Mock react-native-webview
jest.mock("react-native-webview", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    WebView: jest.fn().mockImplementation((props) => {
      return <View {...props} testID="webview" />;
    }),
  };
});

// Mock timers
jest.useFakeTimers();

// Global console mocks to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Add a global fetch mock if needed
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    ok: true,
  })
);
