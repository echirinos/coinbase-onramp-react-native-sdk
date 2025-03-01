// Mock the crypto module
jest.mock("crypto", () => ({
  createHmac: jest.fn().mockImplementation(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue("mocked-signature"),
  })),
}));

// Mock the shim module
jest.mock("./src/utils/shim", () => {
  return {
    __esModule: true,
    default: {
      createHmac: jest.fn().mockImplementation(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("mocked-signature"),
      })),
      randomBytes: {
        seed: jest.fn().mockReturnValue(true),
      },
    },
  };
});

// Mock the utils module
jest.mock("./src/utils", () => ({
  shim: {
    createHmac: jest.fn().mockImplementation(() => ({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue("mocked-signature"),
    })),
    randomBytes: {
      seed: jest.fn().mockReturnValue(true),
    },
  },
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

// Mock react-native-crypto
jest.mock("react-native-crypto", () => ({
  createHmac: jest.fn().mockImplementation(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue("mocked-signature"),
  })),
  randomBytes: jest.fn().mockImplementation((size) => {
    return Buffer.from(new Array(size).fill(0));
  }),
}));

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

// Set up global variables that might be needed
global.Buffer = Buffer;
global.process = process;
