import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Text,
} from "react-native";
import { WebView } from "react-native-webview";
import { useCoinbase } from "./CoinbaseWrapper";

interface OnrampWebViewProps {
  url: string;
  visible: boolean;
  onClose: () => void;
  onSuccess?: (transactionId: string) => void;
  onFailure?: (error: Error) => void;
}

export const OnrampWebView: React.FC<OnrampWebViewProps> = ({
  url,
  visible,
  onClose,
  onSuccess,
  onFailure,
}) => {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const coinbase = useCoinbase();

  // Handle navigation state changes
  const handleNavigationStateChange = (navState: any) => {
    console.log("WebView navigated to:", navState.url);

    // Check for success or failure in the URL
    if (navState.url.includes("success")) {
      setLoading(false);
      console.log("Transaction completed successfully");
      if (onSuccess) {
        // Extract transaction ID from URL if available
        const urlObj = new URL(navState.url);
        const params = new URLSearchParams(urlObj.search);
        const transactionId = params.get("transactionId") || "unknown";
        onSuccess(transactionId);
      }
      onClose();
    } else if (navState.url.includes("failure")) {
      setLoading(false);
      console.log("Transaction failed");
      if (onFailure) {
        const urlObj = new URL(navState.url);
        const params = new URLSearchParams(urlObj.search);
        const errorMsg = params.get("error") || "Unknown error";
        onFailure(new Error(errorMsg));
      }
      onClose();
    }
  };

  // Handle WebView load end
  const handleLoadEnd = () => {
    setLoading(false);
  };

  // Handle WebView errors
  const handleError = (error: any) => {
    console.error("WebView error:", error);
    if (onFailure) {
      onFailure(new Error("Failed to load Coinbase Onramp"));
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0052FF" />
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webView}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 60,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#0052FF",
    fontWeight: "600",
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 1,
  },
});
