import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import CoinbaseOnramp, {
  OnrampButton,
  PurchaseCurrency,
} from "coinbase-onramp-react-native-sdk";

const CryptoPurchaseScreen = () => {
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<PurchaseCurrency[]>([]);
  const [userCountry, setUserCountry] = useState("US"); // Default to US
  const partnerUserId = "user_123"; // This should be unique to your user

  // Initialize the SDK when component mounts
  useEffect(() => {
    // Initialize the SDK with your Coinbase API credentials
    CoinbaseOnramp.initialize({
      apiKey: "YOUR_API_KEY",
      apiSecret: "YOUR_API_SECRET",
      environment: "sandbox", // or 'production'
      appId: "YOUR_APP_ID",
    });

    fetchAssets();
  }, []);

  // Fetch supported assets when component mounts
  const fetchAssets = async () => {
    try {
      // Get supported options based on user's country
      const options = await CoinbaseOnramp.getOptions(userCountry);
      setAssets(options.purchase_currencies);
    } catch (error) {
      console.error("Error fetching assets:", error);
      Alert.alert("Error", "Failed to fetch supported assets");
    } finally {
      setLoading(false);
    }
  };

  // Poll for transaction status updates
  useEffect(() => {
    if (!transaction) return;

    const intervalId = setInterval(async () => {
      try {
        // Get latest transaction status
        const transactions = await CoinbaseOnramp.getTransactionStatus(
          partnerUserId
        );

        if (transactions.length > 0) {
          // Update with latest transaction
          setTransaction(transactions[0]);

          // If transaction is completed or failed, stop polling
          if (
            transactions[0].status !== "ONRAMP_TRANSACTION_STATUS_IN_PROGRESS"
          ) {
            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Error polling transaction status:", error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [transaction]);

  // Handle buy button press
  const handleBuy = (asset: PurchaseCurrency) => {
    // Create a purchase configuration
    return {
      asset: asset.code,
      amount: 50, // Default to $50
      fiatCurrency: "USD",
      // Create address format required by Coinbase API
      destinationAddresses: {
        "0x4315d134aCd3221a02dD380ADE3aF39Ce219037c": asset.networks || [
          "ethereum",
        ],
      },
      partnerUserId: partnerUserId,
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0052FF" />
        <Text style={styles.loadingText}>Loading supported assets...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Buy Cryptocurrency</Text>

        {/* List of supported assets with buy buttons */}
        {assets.map((asset) => (
          <View key={asset.code} style={styles.assetRow}>
            <View style={styles.assetInfo}>
              <Text style={styles.assetName}>{asset.name}</Text>
              <Text style={styles.assetCode}>{asset.code}</Text>
            </View>

            <OnrampButton
              purchaseParams={handleBuy(asset)}
              eventCallbacks={{
                onSuccess: (tx) => {
                  setTransaction(tx);
                  Alert.alert(
                    "Success",
                    "Transaction initiated! Check status below."
                  );
                },
                onFailure: (error) => {
                  Alert.alert("Error", error.message);
                },
                onCancel: () => {
                  Alert.alert("Cancelled", "Purchase was cancelled");
                },
                onStatusChange: (status) => {
                  console.log("Transaction status:", status);
                },
              }}
              buttonText={`Buy ${asset.code}`}
              style={styles.buyButton}
            />
          </View>
        ))}

        {/* Transaction details */}
        {transaction && (
          <View style={styles.receipt}>
            <Text style={styles.receiptTitle}>Latest Transaction</Text>
            <Text>Transaction ID: {transaction.transaction_id}</Text>
            <Text>Status: {transaction.status}</Text>
            <Text>Asset: {transaction.purchase_currency}</Text>
            <Text>Network: {transaction.purchase_network}</Text>
            <Text>Amount: {transaction.purchase_amount}</Text>
            {transaction.tx_hash && (
              <Text>
                Blockchain Transaction: {transaction.tx_hash.substring(0, 10)}
                ...
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  assetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: "600",
  },
  assetCode: {
    fontSize: 14,
    color: "#666666",
  },
  buyButton: {
    width: 120,
  },
  receipt: {
    marginTop: 32,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    width: "100%",
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
});

export default CryptoPurchaseScreen;
