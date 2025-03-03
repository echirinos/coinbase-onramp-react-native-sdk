/**
 * This file is loaded before anything else to ensure critical globals are set
 * It should be imported at the very top of index.js
 */

// Create a basic ErrorBoundary if one doesn't exist yet
// This will be replaced by the real one later, but ensures something is available
if (!global.ErrorBoundary) {
  console.log("Creating temporary ErrorBoundary in pre-init");

  // Create a more robust temporary ErrorBoundary
  global.ErrorBoundary = class TempErrorBoundary {
    constructor(props) {
      this.props = props || {};
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.log("TempErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
      if (this.state && this.state.hasError) {
        // Return a simple fallback UI
        return null;
      }
      return this.props.children;
    }
  };
}

// Ensure crypto is available
if (!global.crypto) {
  console.log("Creating temporary crypto object in pre-init");
  global.crypto = {};
}

// Ensure randomBytes exists
if (!global.crypto.randomBytes) {
  console.log("Creating temporary randomBytes in pre-init");
  global.crypto.randomBytes = function (size) {
    console.log("Using pre-init randomBytes implementation");
    const arr = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return typeof Buffer !== "undefined" && Buffer.from
      ? Buffer.from(arr)
      : arr;
  };
}

// Always set the seed method directly to ensure it exists
console.log("Adding temporary seed method in pre-init");
global.crypto.randomBytes.seed = function (seed) {
  console.log("Temporary seed function called with:", seed);
  return true;
};

// Double-check that ErrorBoundary is properly set
if (!global.ErrorBoundary) {
  console.error("ErrorBoundary not set in pre-init, something went wrong");
}

// Final check for crypto.randomBytes.seed
if (
  !global.crypto ||
  !global.crypto.randomBytes ||
  !global.crypto.randomBytes.seed
) {
  console.error("CRITICAL: Crypto not properly initialized in pre-init");

  // Last resort initialization
  if (!global.crypto) global.crypto = {};

  if (!global.crypto.randomBytes) {
    global.crypto.randomBytes = function (size) {
      console.log("Using pre-init last resort randomBytes");
      const arr = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    };
  }

  if (!global.crypto.randomBytes.seed) {
    global.crypto.randomBytes.seed = function (seed) {
      console.log("Using pre-init last resort seed with:", seed);
      return true;
    };
  }
}

console.log("Pre-initialization complete");
