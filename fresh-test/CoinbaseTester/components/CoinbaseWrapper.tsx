import React, { ReactNode, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import ErrorBoundary from "./ErrorBoundary";

// Define the props for the CoinbaseWrapper component
interface CoinbaseWrapperProps {
  children: ReactNode;
}

/**
 * A wrapper component for Coinbase SDK components that handles errors
 * and provides fallbacks for missing functionality.
 */
const CoinbaseWrapper: React.FC<CoinbaseWrapperProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  // Initialize global ErrorBoundary immediately
  if (!global.ErrorBoundary) {
    console.log("Setting global ErrorBoundary in CoinbaseWrapper");
    global.ErrorBoundary = ErrorBoundary;
  }

  // Also use useEffect to ensure everything is set up after component mount
  useEffect(() => {
    // Create a mock ErrorBoundary for the SDK to use
    if (!global.ErrorBoundary) {
      console.log("Setting global ErrorBoundary in CoinbaseWrapper useEffect");
      global.ErrorBoundary = ErrorBoundary;
    }

    // Ensure crypto.randomBytes.seed is available
    if (!global.crypto) {
      console.log("Creating crypto object in CoinbaseWrapper");
      global.crypto = {};
    }

    if (!global.crypto.randomBytes) {
      console.log("Creating randomBytes in CoinbaseWrapper");
      global.crypto.randomBytes = function (size) {
        console.log("Using CoinbaseWrapper randomBytes implementation");
        const arr = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return Buffer.from(arr);
      };
    }

    if (!global.crypto.randomBytes.seed) {
      console.log(
        "Adding seed method to crypto.randomBytes in CoinbaseWrapper"
      );
      global.crypto.randomBytes.seed = function (seed) {
        console.log("Seed function called with:", seed);
        return true;
      };
    }

    // Mark component as ready
    setIsReady(true);

    return () => {
      // Cleanup is not needed, but this is a good place to log component unmount
      console.log("CoinbaseWrapper unmounted");
    };
  }, []);

  // Show loading indicator while initializing
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Initializing Coinbase SDK...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>{children}</View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default CoinbaseWrapper;
