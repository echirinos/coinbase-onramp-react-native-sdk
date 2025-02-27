import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  BackHandler,
  Platform,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import CoinbaseOnramp from "../index";

interface OnrampWebViewProps {
  sessionUrl: string;
  onClose: () => void;
  onSuccess?: (transactionId: string) => void;
  onFailure?: (error: Error) => void;
  onCancel?: () => void;
}

export const OnrampWebView: React.FC<OnrampWebViewProps> = ({
  sessionUrl,
  onClose,
  onSuccess,
  onFailure,
  onCancel,
}) => {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS === "android") {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (canGoBack && webViewRef.current) {
            webViewRef.current.goBack();
            return true;
          }
          onClose();
          return true;
        }
      );

      return () => backHandler.remove();
    }
    return undefined;
  }, [canGoBack, onClose]);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    // Update back button state
    setCanGoBack(navState.canGoBack);

    // Check if the URL is a callback or redirect URL
    if (
      navState.url.includes("callback") ||
      (navState.url.includes("redirectUrl") && navState.loading === false)
    ) {
      // Let the SDK handle the callback
      CoinbaseOnramp.handleCallback(navState.url);

      // Extract parameters from URL
      const url = new URL(navState.url);
      const params = new URLSearchParams(url.search);

      const status = params.get("status");
      const transactionId = params.get("transactionId");
      const partnerUserId = params.get("partnerUserId");

      if (status === "success" && onSuccess && transactionId) {
        onSuccess(transactionId);
      } else if (status === "failure" && onFailure) {
        const errorMsg = params.get("error") || "Transaction failed";
        onFailure(new Error(errorMsg));
      } else if (status === "cancelled" && onCancel) {
        onCancel();
      }

      // Close WebView
      onClose();
    }
  };

  // Special JavaScript to inject to detect transaction completion
  const TRANSACTION_MONITOR_JS = `
    (function() {
      // Monitor DOM changes to detect transaction completion
      const observer = new MutationObserver(function(mutations) {
        // Check if success or failure messages are visible
        if (document.querySelector('.transaction-success') ||
            document.querySelector('.transaction-complete') ||
            document.querySelector('.transaction-failure')) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'transaction_complete',
            status: document.querySelector('.transaction-success') ? 'success' : 'failure'
          }));
        }
      });

      // Start observing the document
      observer.observe(document.body, { childList: true, subtree: true });
    })();
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "transaction_complete") {
        if (data.status === "success" && onSuccess) {
          // Since we don't have the transaction ID here, pass a placeholder
          // The SDK will poll for the actual transaction details
          onSuccess("pending");
        } else if (data.status === "failure" && onFailure) {
          onFailure(new Error("Transaction failed"));
        }

        // Close WebView
        onClose();
      }
    } catch (e) {
      // Ignore parsing errors
    }
  };

  return (
    <Modal animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Coinbase Onramp</Text>
          {canGoBack && (
            <TouchableOpacity
              onPress={() => webViewRef.current?.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
        </View>

        <WebView
          ref={webViewRef}
          source={{ uri: sessionUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onMessage={handleMessage}
          injectedJavaScript={TRANSACTION_MONITOR_JS}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          // For iOS in-app browser support
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          // For Android in-app browser support
          useWebKit={true}
          // Support for Apple Pay in WebView
          allowsBackForwardNavigationGestures={true}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0052FF" />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    left: 16,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "400",
  },
  backButton: {
    position: "absolute",
    left: 56,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "400",
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
});
