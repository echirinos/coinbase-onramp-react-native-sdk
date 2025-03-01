/**
 * This file provides polyfills for Node.js modules that are required by the SDK.
 * Import this file at the top of your entry point file to ensure all required modules are available.
 */

// Include crypto polyfills
if (typeof global.Buffer === "undefined") {
  global.Buffer = require("buffer").Buffer;
}

if (typeof global.process === "undefined") {
  global.process = require("process");
}

// Needed for react-native-crypto
if (typeof __dirname === "undefined") global.__dirname = "/";
if (typeof __filename === "undefined") global.__filename = "";
if (typeof process.browser === "undefined") process.browser = true;

// Add events module for stream-browserify
if (typeof global.EventEmitter === "undefined") {
  global.EventEmitter = require("events");
}

// Initialize crypto with a random seed
const crypto = require("react-native-crypto");

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

// Ensure crypto.randomBytes.seed is available
if (typeof crypto.randomBytes === "function") {
  // If randomBytes is a function, add the seed method to it
  crypto.randomBytes.seed = function (seed) {
    console.log("Seed function called with:", seed);
    return true;
  };
} else if (!crypto.randomBytes) {
  // If randomBytes doesn't exist, create it as an object
  crypto.randomBytes = {
    seed: function (seed) {
      console.log("Seed function called with:", seed);
      return true;
    },
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

// Make crypto globally available
global.crypto = crypto;

// Log that shim has been loaded
console.log("Crypto shim loaded successfully");

// Export crypto for direct usage
module.exports = crypto;
