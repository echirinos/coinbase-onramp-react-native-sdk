import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { OnrampWebView } from "../../app/components/OnrampWebView";

export default function DirectUrlScreen() {
  const [appId, setAppId] = useState("YOUR_COINBASE_APP_ID_HERE");
  const [walletAddress, setWalletAddress] = useState(
    "0x4315d134aCd3221a02dD380ADE3aF39Ce219037c"
  );
  const [amount, setAmount] = useState("10");
  const [fiatCurrency, setFiatCurrency] = useState("USD");
  const [country, setCountry] = useState("US");
  const [subdivision, setSubdivision] = useState("CA");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [assets, setAssets] = useState("ETH,USDC");
  const [partnerUserId, setPartnerUserId] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [webViewVisible, setWebViewVisible] = useState(false);

  // Generate a unique partner user ID on component mount
  useEffect(() => {
    setPartnerUserId(`user-${Date.now()}`);
  }, []);

  const generateOnrampUrl = () => {
    try {
      console.log("Generating Onramp URL...");

      // Create the destination addresses object
      const addressesObj = {
        [walletAddress]: ["ethereum", "base"],
      };

      // Create the assets array
      const assetsArray = assets.split(",").map((a) => a.trim());

      // Build the URL with query parameters
      const baseUrl = "https://pay.coinbase.com/buy/select-asset";
      const params = new URLSearchParams();

      params.append("appId", appId);
      params.append("addresses", JSON.stringify(addressesObj));
      params.append("assets", JSON.stringify(assetsArray));
      params.append("presetFiatAmount", amount);
      params.append("fiatCurrency", fiatCurrency);
      params.append("country", country);
      params.append("subdivision", subdivision);
      params.append("paymentMethod", paymentMethod);
      params.append("partnerUserId", partnerUserId);
      params.append("successUrl", "https://success.example.com");
      params.append("failureUrl", "https://failure.example.com");
      params.append("_t", Date.now().toString());

      const url = `${baseUrl}?${params.toString()}`;
      setGeneratedUrl(url);
      console.log("Generated Onramp URL:", url);

      return url;
    } catch (error) {
      console.error("Error generating URL:", error);
      Alert.alert("Error", "Failed to generate URL");
      return null;
    }
  };

  const handleOpenExternalLink = () => {
    const url = generateOnrampUrl();
    if (url) {
      console.log("Opening external link:", url);
      Linking.openURL(url).catch((err) => {
        console.error("Error opening URL:", err);
        Alert.alert("Error", "Could not open URL");
      });
    }
  };

  const handleOpenWebView = () => {
    const url = generateOnrampUrl();
    if (url) {
      console.log("Opening WebView with Onramp URL");
      setWebViewVisible(true);
    }
  };

  const handleWebViewClose = () => {
    setWebViewVisible(false);
  };

  const handleWebViewSuccess = (transactionId: string) => {
    console.log("Transaction completed successfully");
    Alert.alert("Success", `Transaction completed! ID: ${transactionId}`);
  };

  const handleWebViewFailure = (error: Error) => {
    console.log("Transaction failed");
    Alert.alert("Error", error.message || "Transaction failed");
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Direct URL Generator</Text>
        <Text style={styles.subtitle}>
          Generate a Coinbase Onramp URL without using the SDK
        </Text>

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
            placeholder="Enter destination wallet address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount:</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Enter amount"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fiat Currency:</Text>
          <TextInput
            style={styles.input}
            value={fiatCurrency}
            onChangeText={setFiatCurrency}
            placeholder="Enter fiat currency (e.g., USD)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Country:</Text>
          <TextInput
            style={styles.input}
            value={country}
            onChangeText={setCountry}
            placeholder="Enter country code (e.g., US)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Subdivision:</Text>
          <TextInput
            style={styles.input}
            value={subdivision}
            onChangeText={setSubdivision}
            placeholder="Enter subdivision (e.g., CA)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Payment Method:</Text>
          <TextInput
            style={styles.input}
            value={paymentMethod}
            onChangeText={setPaymentMethod}
            placeholder="Enter payment method (e.g., CARD)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Assets (comma-separated):</Text>
          <TextInput
            style={styles.input}
            value={assets}
            onChangeText={setAssets}
            placeholder="Enter assets (e.g., ETH,USDC)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Partner User ID:</Text>
          <TextInput
            style={styles.input}
            value={partnerUserId}
            onChangeText={setPartnerUserId}
            placeholder="Enter partner user ID"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleOpenExternalLink}
          >
            <Text style={styles.buttonText}>Open in Browser</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.webViewButton]}
            onPress={handleOpenWebView}
          >
            <Text style={styles.buttonText}>Open in WebView</Text>
          </TouchableOpacity>
        </View>

        {generatedUrl ? (
          <View style={styles.urlContainer}>
            <Text style={styles.urlLabel}>Generated URL:</Text>
            <Text style={styles.url} numberOfLines={3} ellipsizeMode="middle">
              {generatedUrl}
            </Text>
          </View>
        ) : null}

        {/* WebView for Coinbase Onramp */}
        {generatedUrl && (
          <OnrampWebView
            url={generatedUrl}
            visible={webViewVisible}
            onClose={handleWebViewClose}
            onSuccess={handleWebViewSuccess}
            onFailure={handleWebViewFailure}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#0052FF",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: "#666",
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: "100%",
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#0052FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  webViewButton: {
    backgroundColor: "#00C087",
    marginRight: 0,
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  urlContainer: {
    width: "100%",
    padding: 16,
    backgroundColor: "#f0f0f5",
    borderRadius: 8,
    marginTop: 16,
  },
  urlLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  url: {
    fontSize: 14,
    color: "#666",
  },
});
