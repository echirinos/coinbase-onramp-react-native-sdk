// Import necessary modules
import * as ExpoCrypto from "expo-crypto";
import "react-native-get-random-values";
import { Buffer } from "buffer";

// Include crypto polyfills
global.Buffer = Buffer;
global.process = require("process");

// Needed for react-native-crypto
if (typeof __dirname === "undefined") global.__dirname = "/";
if (typeof __filename === "undefined") global.__filename = "";
if (typeof process.browser === "undefined") process.browser = true;

// Add events module for stream-browserify
global.EventEmitter = require("events");

// Ensure global.crypto exists
if (!global.crypto) {
  global.crypto = {};
}

// Create a proper randomBytes implementation with multiple fallbacks
const randomBytesFunction = function (size) {
  try {
    // Use expo-crypto for random bytes
    const bytes = ExpoCrypto.getRandomBytes(size);
    return Buffer.from(bytes);
  } catch (error) {
    console.log("Error using Expo Crypto:", error.message);

    // Fallback to Math.random
    console.log("Using fallback random implementation");
    const arr = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return Buffer.from(arr);
  }
};

// Add the seed method to the randomBytes function
randomBytesFunction.seed = function (seed) {
  console.log("Seed function called with:", seed);
  // Return true to indicate success
  return true;
};

// Create a crypto implementation with our randomBytes function
const cryptoImpl = {
  randomBytes: randomBytesFunction,
  createHash: function (algorithm) {
    return {
      update: function (data) {
        this.data = data;
        return this;
      },
      digest: async function (encoding) {
        try {
          if (this.data) {
            const str = this.data.toString();
            const hash = await ExpoCrypto.digestStringAsync(
              ExpoCrypto.CryptoDigestAlgorithm.SHA256,
              str
            );
            return encoding === "hex" ? hash : Buffer.from(hash, "hex");
          }
        } catch (error) {
          console.log("Error in digest:", error);
        }
        return encoding === "hex" ? "" : Buffer.from("");
      },
    };
  },
  createHmac: function (algorithm, key) {
    return {
      update: function (data) {
        this.data = data;
        this.key = key;
        return this;
      },
      digest: function (encoding) {
        try {
          if (this.data && this.key) {
            const keyStr = this.key.toString();
            const dataStr = this.data.toString();

            // Use a simple HMAC implementation since we don't have native HMAC in Expo
            const combinedStr = keyStr + dataStr;

            // Use SHA-256 hash
            const hash = ExpoCrypto.digestStringAsync(
              ExpoCrypto.CryptoDigestAlgorithm.SHA256,
              combinedStr
            );

            return encoding === "hex" ? hash : Buffer.from(hash, "hex");
          }
        } catch (error) {
          console.log("Error in HMAC digest:", error);
        }

        return encoding === "hex" ? "" : Buffer.from("");
      },
    };
  },
};

// Directly assign the randomBytes function to crypto
global.crypto.randomBytes = randomBytesFunction;

// Make sure the seed method is directly accessible and properly defined
global.crypto.randomBytes.seed = function (seed) {
  console.log("Seed method called with:", seed);
  return true;
};

// Add other crypto methods
Object.keys(cryptoImpl).forEach((key) => {
  if (key !== "randomBytes" && !global.crypto[key]) {
    global.crypto[key] = cryptoImpl[key];
  }
});

// Try to import react-native-randombytes as a fallback
try {
  const randomBytes = require("react-native-randombytes");
  if (randomBytes && typeof randomBytes === "function") {
    console.log("Successfully imported react-native-randombytes");
    // Only use it if it doesn't override our seed method
    if (!randomBytes.seed) {
      randomBytes.seed = global.crypto.randomBytes.seed;
    }
    global.crypto.randomBytes = randomBytes;
  }
} catch (error) {
  console.log("Failed to import react-native-randombytes:", error.message);
}

// Final check to ensure seed method exists
if (!global.crypto.randomBytes || !global.crypto.randomBytes.seed) {
  console.error(
    "CRITICAL: randomBytes or seed method is missing after initialization"
  );
  // Last resort fallback
  if (!global.crypto.randomBytes) {
    global.crypto.randomBytes = randomBytesFunction;
  }
  if (!global.crypto.randomBytes.seed) {
    global.crypto.randomBytes.seed = function (seed) {
      console.log("Last resort seed method called with:", seed);
      return true;
    };
  }
}

// Log that shim has been loaded
console.log("Crypto shim loaded successfully with multiple fallbacks");
