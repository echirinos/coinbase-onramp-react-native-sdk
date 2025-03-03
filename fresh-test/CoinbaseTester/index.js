// Import pre-init first to ensure critical globals are set
import "./pre-init";

// Import shim to ensure crypto is available BEFORE global-init
import "./shim";

// Import ErrorBoundary directly
import ErrorBoundaryComponent from "./components/ErrorBoundary";

// Import global initialization next
import "./global-init";

// Import React
import React from "react";
import { AppRegistry } from "react-native";

// Set global ErrorBoundary directly from the imported component
console.log("Setting global ErrorBoundary in index.js");
global.ErrorBoundary = ErrorBoundaryComponent;

// Double-check crypto initialization
if (
  !global.crypto ||
  !global.crypto.randomBytes ||
  !global.crypto.randomBytes.seed
) {
  console.error("CRITICAL: Crypto not properly initialized in index.js");

  // Last resort initialization
  if (!global.crypto) global.crypto = {};

  if (!global.crypto.randomBytes) {
    global.crypto.randomBytes = function (size) {
      console.log("Using index.js fallback randomBytes");
      const arr = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return Buffer.from(arr);
    };
  }

  if (!global.crypto.randomBytes.seed) {
    global.crypto.randomBytes.seed = function (seed) {
      console.log("Using index.js fallback seed with:", seed);
      return true;
    };
  }
}

// Import the ExpoRoot component from expo-router
import { ExpoRoot } from "expo-router";

// Create the root component
const App = () => {
  // Ensure ErrorBoundary is set before rendering
  if (!global.ErrorBoundary) {
    console.error("ErrorBoundary not found in global scope, setting it now");
    global.ErrorBoundary = ErrorBoundaryComponent;
  }

  // Use the directly imported component instead of relying on global
  return (
    <ErrorBoundaryComponent>
      <ExpoRoot context={require.context("./app")} />
    </ErrorBoundaryComponent>
  );
};

// Register the main component explicitly
AppRegistry.registerComponent("main", () => App);

// Also register with Expo's registerRootComponent for compatibility
import { registerRootComponent } from "expo";
registerRootComponent(App);
