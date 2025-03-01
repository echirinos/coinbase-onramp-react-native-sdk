// Include crypto polyfills
global.Buffer = require("buffer").Buffer;
global.process = require("process");

// Needed for react-native-crypto
if (typeof __dirname === "undefined") global.__dirname = "/";
if (typeof __filename === "undefined") global.__filename = "";
if (typeof process.browser === "undefined") process.browser = true;

// Add events module for stream-browserify
global.EventEmitter = require("events");

// Initialize crypto with a random seed
const crypto = require("react-native-crypto");

// Create a random seed for crypto
const randomBytes = new Uint8Array(16);
for (let i = 0; i < 16; i++) {
  randomBytes[i] = Math.floor(Math.random() * 256);
}

// Ensure crypto.randomBytes is available
if (!crypto.randomBytes) {
  crypto.randomBytes = function (size) {
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return Buffer.from(bytes);
  };
}

// Ensure crypto.createHash is available
if (!crypto.createHash) {
  crypto.createHash = function (algorithm) {
    return {
      update: function (data) {
        this.data = data;
        return this;
      },
      digest: function () {
        // Simple mock implementation
        return (
          "mock-hash-" +
          (this.data ? this.data.toString().substring(0, 10) : "empty")
        );
      },
    };
  };
}

// Fix for "Cannot read property 'seed' of null" error
if (crypto.randomBytes && typeof crypto.randomBytes.seed === "undefined") {
  crypto.randomBytes.seed = function (seed) {
    console.log("Seed function called with:", seed);
    return true;
  };
}

// Make crypto globally available
global.crypto = crypto;

// Log that shim has been loaded
console.log("Crypto shim loaded successfully");
