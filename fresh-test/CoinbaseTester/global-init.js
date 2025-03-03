// This file initializes global objects and polyfills needed by the app
// It should be imported before anything else in index.js

// Import ErrorBoundary
import ErrorBoundary from "./components/ErrorBoundary";

// IMPORTANT: Set global.ErrorBoundary immediately
console.log("Setting global ErrorBoundary in global-init");
global.ErrorBoundary = ErrorBoundary;

// Ensure window.ErrorBoundary is also set for web compatibility
if (typeof window !== "undefined") {
  console.log("Setting window.ErrorBoundary for web compatibility");
  window.ErrorBoundary = ErrorBoundary;
}

// Make sure crypto is available globally
if (!global.crypto) {
  console.log("Initializing empty crypto object");
  global.crypto = {};
}

// Ensure randomBytes exists and has a seed method
if (!global.crypto.randomBytes) {
  console.log("Creating basic randomBytes function in global-init");
  global.crypto.randomBytes = function (size) {
    const arr = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return Buffer.from(arr);
  };
}

if (!global.crypto.randomBytes.seed) {
  console.log("Adding seed method to randomBytes in global-init");
  global.crypto.randomBytes.seed = function (seed) {
    console.log("Seed function called with:", seed);
    return true;
  };
}

// Double-check that ErrorBoundary is properly set
if (!global.ErrorBoundary) {
  console.error("ErrorBoundary not set in global-init, setting it again");
  global.ErrorBoundary = ErrorBoundary;
}

console.log("Global initialization complete");
