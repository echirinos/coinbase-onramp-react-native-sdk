import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import CoinbaseOnramp, {
  OnrampWebView,
} from "coinbase-onramp-react-native-sdk";

const OneClickBuyExample = () => {
  const [loading, setLoading] = useState(false);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const partnerUserId = "user_123"; // Should be unique per user

  // Example wallet address (should be your user's wallet)
  const walletAddress = "0x4315d134aCd3221a02dD380ADE3aF39Ce219037c";

  // Initialize the SDK when component mounts
  useEffect(() => {
    // Initialize the SDK with your Coinbase API credentials
    CoinbaseOnramp.initialize({
      apiKey: "YOUR_API_KEY",
      apiSecret: "YOUR_API_SECRET",
      environment: "sandbox", // or 'production'
      appId: "YOUR_APP_ID",
    });
  }, []);

  // Generate a quote for ETH purchase
  const generateQuote = async () => {
    setLoading(true);
    try {
      // Create quote parameters
      const quoteParams = {
        purchase_currency: "ETH",
        purchase_network: "ethereum",
        payment_amount: "50.00",
        payment_currency: "USD",
        payment_method: "CARD",
        country: "US",
      };

      // Get a quote from Coinbase
      const quote = await CoinbaseOnramp.getQuote(quoteParams);
      setQuoteId(quote.quote_id);

      Alert.alert(
        "Quote Generated",
        `Quote ID: ${quote.quote_id.substring(0, 8)}...`
      );
    } catch (error) {
      console.error("Error generating quote:", error);
      Alert.alert("Error", "Failed to generate quote");
    } finally {
      setLoading(false);
    }
  };

  // Generate One-Click-Buy URL with the quote
  const handleOneClickBuy = async () => {
    if (!quoteId) {
      Alert.alert("Error", "Please generate a quote first");
      return;
    }

    setLoading(true);
    try {
      // Create the One-Click-Buy URL
      const oneClickBuyUrl = await CoinbaseOnramp.generateOneClickBuyUrl(
        quoteId,
        50, // presetFiatAmount
        "USD", // fiatCurrency
        "ETH", // defaultAsset
        "CARD", // defaultPaymentMethod
        { [walletAddress]: ["ethereum"] } // addresses
      );

      // Set the session URL to open the WebView
      setSessionUrl(oneClickBuyUrl);
    } catch (error) {
      console.error("Error generating One-Click-Buy URL:", error);
      Alert.alert("Error", "Failed to generate One-Click-Buy URL");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSessionUrl(null);
  };

  const handleSuccess = (transactionId: string) => {
    Alert.alert("Success", `Transaction initiated! ID: ${transactionId}`);
    // Start polling for transaction status
    CoinbaseOnramp.startStatusPolling(partnerUserId);
  };

  const handleFailure = (error: Error) => {
    Alert.alert("Error", error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>One-Click-Buy Example</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={generateQuote}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Generate Quote"}
        </Text>
      </TouchableOpacity>

      {quoteId && (
        <TouchableOpacity
          style={[styles.button, styles.buyButton]}
          onPress={handleOneClickBuy}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Loading..." : "One-Click-Buy ETH"}
          </Text>
        </TouchableOpacity>
      )}

      {loading && (
        <ActivityIndicator size="large" color="#0052FF" style={styles.loader} />
      )}

      {sessionUrl && (
        <OnrampWebView
          sessionUrl={sessionUrl}
          onClose={handleClose}
          onSuccess={handleSuccess}
          onFailure={handleFailure}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#0052FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginVertical: 8,
    width: 200,
    alignItems: "center",
  },
  buyButton: {
    backgroundColor: "#00C087",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loader: {
    marginTop: 20,
  },
});

export default OneClickBuyExample;
