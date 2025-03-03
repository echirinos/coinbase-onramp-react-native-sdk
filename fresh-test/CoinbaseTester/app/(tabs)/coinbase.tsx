// Import pre-init first to ensure critical globals are set
import "../../pre-init";

// Import global initialization next
import "../../global-init";

// Import shim to ensure crypto is available
import "../../shim";

import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import CoinbaseWrapper from "../../components/CoinbaseWrapper";
import ErrorBoundary from "../../components/ErrorBoundary";

// Ensure ErrorBoundary is set globally
if (!global.ErrorBoundary) {
  console.log("Setting global ErrorBoundary in coinbase.tsx");
  global.ErrorBoundary = ErrorBoundary;
}

// Ensure crypto.randomBytes.seed is available
if (
  global.crypto &&
  global.crypto.randomBytes &&
  !global.crypto.randomBytes.seed
) {
  console.log("Adding seed method to crypto.randomBytes in coinbase.tsx");
  global.crypto.randomBytes.seed = function (seed) {
    console.log("Seed function called with:", seed);
    return true;
  };
}

// Define supported payment methods
const PAYMENT_METHODS = [
  { id: "CARD", label: "Credit/Debit Card" },
  { id: "ACH_BANK_ACCOUNT", label: "ACH Bank Account" },
  { id: "APPLE_PAY", label: "Apple Pay" },
  { id: "PAYPAL", label: "PayPal" },
];

// Define supported countries
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
];

export default function CoinbaseScreen() {
  const [appId, setAppId] = useState("YOUR_COINBASE_APP_ID_HERE");
  const [walletAddress, setWalletAddress] = useState(
    "0x4315d134aCd3221a02dD380ADE3aF39Ce219037c"
  );
  const [networks, setNetworks] = useState(["ethereum", "base"]);
  const [assets, setAssets] = useState(["ETH", "USDC"]);
  const [fiatAmount, setFiatAmount] = useState("10");
  const [fiatCurrency, setFiatCurrency] = useState("USD");
  const [country, setCountry] = useState("US");
  const [subdivision, setSubdivision] = useState("CA");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [partnerUserId, setPartnerUserId] = useState(`user-${Date.now()}`);
  const [showWebView, setShowWebView] = useState(false);
  const [onrampUrl, setOnrampUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const webViewRef = useRef<WebView>(null);

  // Ensure crypto and ErrorBoundary are set up when component mounts
  useEffect(() => {
    // Ensure ErrorBoundary is set
    if (!global.ErrorBoundary) {
      console.log("Setting global ErrorBoundary in CoinbaseScreen useEffect");
      global.ErrorBoundary = ErrorBoundary;
    }

    // Ensure crypto.randomBytes.seed is available
    if (
      global.crypto &&
      global.crypto.randomBytes &&
      !global.crypto.randomBytes.seed
    ) {
      console.log("Adding seed method to crypto.randomBytes in CoinbaseScreen");
      global.crypto.randomBytes.seed = function (seed) {
        console.log("Seed function called with:", seed);
        return true;
      };
    }

    addLog("Component mounted, global objects initialized");
  }, []);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prevLogs) => [
      ...prevLogs,
      `${new Date().toISOString()}: ${message}`,
    ]);
  };

  const generateOnrampUrl = () => {
    try {
      setIsLoading(true);
      addLog("Generating Onramp URL...");

      // Create the addresses parameter as a JSON object
      const addressesObj = { [walletAddress]: networks };
      const addressesParam = encodeURIComponent(JSON.stringify(addressesObj));

      // Create the assets parameter as a JSON array
      const assetsParam = encodeURIComponent(JSON.stringify(assets));

      // Build the URL with all parameters
      let url = `https://pay.coinbase.com/buy/select-asset?appId=${appId}`;

      // Add addresses and assets
      url += `&addresses=${addressesParam}`;
      url += `&assets=${assetsParam}`;

      // Add optional parameters
      if (fiatAmount) {
        url += `&presetFiatAmount=${fiatAmount}`;
      }

      if (fiatCurrency) {
        url += `&fiatCurrency=${fiatCurrency}`;
      }

      if (country) {
        url += `&country=${country}`;
      }

      if (country === "US" && subdivision) {
        url += `&subdivision=${subdivision}`;
      }

      if (paymentMethod) {
        url += `&paymentMethod=${paymentMethod}`;
      }

      if (partnerUserId) {
        url += `&partnerUserId=${encodeURIComponent(partnerUserId)}`;
      }

      // Add success and failure URLs for web
      const successUrl = encodeURIComponent("https://success.example.com");
      const failureUrl = encodeURIComponent("https://failure.example.com");
      url += `&successUrl=${successUrl}&failureUrl=${failureUrl}`;

      // Add a timestamp to prevent caching
      url += `&_t=${Date.now()}`;

      setOnrampUrl(url);
      addLog(`Generated Onramp URL: ${url}`);

      setIsLoading(false);
      return url;
    } catch (error) {
      setIsLoading(false);
      addLog(`Error generating URL: ${error}`);
      Alert.alert("Error", `Failed to generate URL: ${error}`);
      return null;
    }
  };

  const openOnrampWebView = () => {
    const url = generateOnrampUrl();
    if (url) {
      setShowWebView(true);
      addLog("Opening WebView with Onramp URL");
    }
  };

  const closeWebView = () => {
    setShowWebView(false);
    addLog("Closed WebView");
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    addLog(`WebView navigated to: ${navState.url}`);

    // Handle success URL
    if (navState.url.includes("success.example.com")) {
      addLog("Transaction completed successfully");
      Alert.alert("Success", "Your transaction was completed successfully!");
      closeWebView();
    }

    // Handle failure URL
    if (navState.url.includes("failure.example.com")) {
      addLog("Transaction failed");
      Alert.alert("Failed", "Your transaction could not be completed.");
      closeWebView();
    }

    // Handle transaction_complete
    if (navState.url.includes("transaction_complete")) {
      addLog("Transaction completed");
      // You can extract transaction details from the URL if needed
    }
  };

  const openExternalLink = (url: string) => {
    addLog(`Opening external link: ${url}`);
    Linking.openURL(url).catch((err) => {
      addLog(`Error opening URL: ${err}`);
      Alert.alert("Error", `Could not open URL: ${err}`);
    });
  };

  return (
    <ErrorBoundary>
      <CoinbaseWrapper>
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.title}>Coinbase Onramp Direct Integration</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>App ID:</Text>
              <TextInput
                style={styles.input}
                value={appId}
                onChangeText={setAppId}
                placeholder="Enter your Coinbase App ID"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Wallet Address:</Text>
              <TextInput
                style={styles.input}
                value={walletAddress}
                onChangeText={setWalletAddress}
                placeholder="Enter wallet address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Networks (comma-separated):</Text>
              <TextInput
                style={styles.input}
                value={networks.join(",")}
                onChangeText={(text) =>
                  setNetworks(text.split(",").map((n) => n.trim()))
                }
                placeholder="ethereum,base"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Assets (comma-separated):</Text>
              <TextInput
                style={styles.input}
                value={assets.join(",")}
                onChangeText={(text) =>
                  setAssets(text.split(",").map((a) => a.trim()))
                }
                placeholder="ETH,USDC"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fiat Amount:</Text>
              <TextInput
                style={styles.input}
                value={fiatAmount}
                onChangeText={setFiatAmount}
                keyboardType="numeric"
                placeholder="10"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fiat Currency:</Text>
              <TextInput
                style={styles.input}
                value={fiatCurrency}
                onChangeText={setFiatCurrency}
                placeholder="USD"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Country:</Text>
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
                placeholder="US"
              />
              <Text style={styles.helperText}>
                Two-letter country code (e.g., US, GB)
              </Text>
            </View>

            {country === "US" && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>State/Subdivision:</Text>
                <TextInput
                  style={styles.input}
                  value={subdivision}
                  onChangeText={setSubdivision}
                  placeholder="CA"
                />
                <Text style={styles.helperText}>
                  Two-letter state code (e.g., CA, NY)
                </Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Payment Method:</Text>
              <TextInput
                style={styles.input}
                value={paymentMethod}
                onChangeText={setPaymentMethod}
                placeholder="CARD"
              />
              <Text style={styles.helperText}>
                CARD, ACH_BANK_ACCOUNT, APPLE_PAY, PAYPAL, etc.
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Partner User ID:</Text>
              <TextInput
                style={styles.input}
                value={partnerUserId}
                onChangeText={setPartnerUserId}
                placeholder="Your app's user ID"
              />
              <Text style={styles.helperText}>
                Used to track transactions for this user
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Generate Onramp URL"
                onPress={generateOnrampUrl}
                disabled={isLoading}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Open Coinbase Onramp"
                onPress={openOnrampWebView}
                disabled={isLoading}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Open in External Browser"
                onPress={() => {
                  const url = generateOnrampUrl();
                  if (url) openExternalLink(url);
                }}
                disabled={isLoading}
              />
            </View>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>Generating URL...</Text>
              </View>
            )}

            {onrampUrl && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>Onramp URL:</Text>
                <Text style={styles.resultText} selectable={true}>
                  {onrampUrl}
                </Text>
              </View>
            )}

            <View style={styles.logsContainer}>
              <Text style={styles.resultTitle}>Logs:</Text>
              <ScrollView style={styles.logsScrollView}>
                {logs.map((log, index) => (
                  <Text key={index} style={styles.logText}>
                    {log}
                  </Text>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* WebView Modal */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={showWebView}
            onRequestClose={closeWebView}
          >
            <SafeAreaView style={styles.webViewContainer}>
              <View style={styles.webViewHeader}>
                <TouchableOpacity
                  onPress={closeWebView}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                <Text style={styles.webViewTitle}>Coinbase Onramp</Text>
                <View style={styles.placeholder} />
              </View>

              <WebView
                ref={webViewRef}
                source={{ uri: onrampUrl }}
                style={styles.webView}
                onNavigationStateChange={handleWebViewNavigationStateChange}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.webViewLoading}>
                    <ActivityIndicator size="large" color="#0066cc" />
                  </View>
                )}
              />
            </SafeAreaView>
          </Modal>
        </View>
      </CoinbaseWrapper>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingTop: 50,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
  buttonContainer: {
    marginBottom: 10,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  resultContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  resultText: {
    fontSize: 14,
  },
  logsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    maxHeight: 200,
  },
  logsScrollView: {
    maxHeight: 180,
  },
  logText: {
    fontSize: 12,
    marginBottom: 3,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 50,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});
