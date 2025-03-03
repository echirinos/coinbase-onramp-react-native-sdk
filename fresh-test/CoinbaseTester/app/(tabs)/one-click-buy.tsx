// Import shim first to ensure crypto is available
import "../../shim";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { useCoinbase } from "@/components/CoinbaseWrapper";
import { OnrampWebView } from "../../app/components/OnrampWebView";

// Pre-defined options for dropdowns
const ASSETS = [
  { code: "ETH", name: "Ethereum", network: "ethereum" },
  { code: "BTC", name: "Bitcoin", network: "bitcoin" },
  { code: "SOL", name: "Solana", network: "solana" },
  { code: "USDC", name: "USD Coin", network: "ethereum" },
  { code: "MATIC", name: "Polygon", network: "polygon" },
  { code: "AVAX", name: "Avalanche", network: "avalanche" },
];

const NETWORKS = [
  { code: "ethereum", name: "Ethereum" },
  { code: "bitcoin", name: "Bitcoin" },
  { code: "solana", name: "Solana" },
  { code: "polygon", name: "Polygon" },
  { code: "avalanche", name: "Avalanche" },
  { code: "optimism", name: "Optimism" },
  { code: "arbitrum", name: "Arbitrum" },
  { code: "base", name: "Base" },
];

const FIAT_CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
];

const PAYMENT_METHODS = [
  { code: "CARD", name: "Credit/Debit Card" },
  { code: "ACH", name: "ACH Bank Transfer" },
  { code: "APPLE_PAY", name: "Apple Pay" },
  { code: "GOOGLE_PAY", name: "Google Pay" },
];

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "AU", name: "Australia" },
];

const DEFAULT_AMOUNTS = [
  { value: "10", label: "$10" },
  { value: "25", label: "$25" },
  { value: "50", label: "$50" },
  { value: "100", label: "$100" },
  { value: "250", label: "$250" },
  { value: "500", label: "$500" },
  { value: "1000", label: "$1000" },
];

// Example wallet addresses
const WALLET_ADDRESSES = [
  {
    address: "0x4315d134aCd3221a02dD380ADE3aF39Ce219037c",
    name: "Default Ethereum Wallet",
  },
  {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    name: "Vitalik's Wallet",
  },
];

export default function OneClickBuyScreen() {
  const coinbase = useCoinbase();

  const [loading, setLoading] = useState(false);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [appId, setAppId] = useState("YOUR_COINBASE_APP_ID_HERE");
  const [initialized, setInitialized] = useState(false);
  const [amount, setAmount] = useState("50");
  const [asset, setAsset] = useState("ETH");
  const [network, setNetwork] = useState("ethereum");
  const [fiatCurrency, setFiatCurrency] = useState("USD");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [country, setCountry] = useState("US");
  const [transaction, setTransaction] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [walletAddress, setWalletAddress] = useState(
    WALLET_ADDRESSES[0].address
  );
  const partnerUserId = "user_123"; // Should be unique per user

  // Modal states
  const [assetModalVisible, setAssetModalVisible] = useState(false);
  const [networkModalVisible, setNetworkModalVisible] = useState(false);
  const [amountModalVisible, setAmountModalVisible] = useState(false);
  const [fiatCurrencyModalVisible, setFiatCurrencyModalVisible] =
    useState(false);
  const [paymentMethodModalVisible, setPaymentMethodModalVisible] =
    useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [walletAddressModalVisible, setWalletAddressModalVisible] =
    useState(false);

  const [webViewVisible, setWebViewVisible] = useState(false);

  // Initialize the SDK when component mounts
  useEffect(() => {
    if (appId) {
      initializeSDK();
    }
  }, []);

  const initializeSDK = async () => {
    setLoading(true);
    try {
      // Initialize the SDK with your Coinbase API credentials
      const success = await coinbase.initialize(appId);
      if (success) {
        setInitialized(true);
      } else {
        Alert.alert("Error", "Failed to initialize SDK");
      }
    } catch (error) {
      console.error("Error initializing SDK:", error);
      Alert.alert("Error", "Failed to initialize SDK");
    } finally {
      setLoading(false);
    }
  };

  // Generate a quote for ETH purchase
  const generateQuote = async () => {
    if (!initialized) {
      Alert.alert("Error", "SDK not initialized");
      return;
    }

    setLoading(true);
    try {
      // Create quote parameters
      const quoteParams = {
        purchase_currency: asset,
        purchase_network: network,
        payment_amount: amount,
        payment_currency: fiatCurrency,
        payment_method: paymentMethod,
        country: country,
      };

      // Get a quote from Coinbase
      const quote = await coinbase.getQuote(quoteParams);
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
    if (!initialized) {
      Alert.alert("Error", "SDK not initialized");
      return;
    }

    if (!quoteId) {
      Alert.alert("Error", "Please generate a quote first");
      return;
    }

    setLoading(true);
    try {
      // Create the One-Click-Buy URL
      const oneClickBuyUrl = await coinbase.generateOneClickBuyUrl({
        quoteId: quoteId,
        presetFiatAmount: parseFloat(amount),
        fiatCurrency: fiatCurrency,
        defaultAsset: asset,
        defaultPaymentMethod: paymentMethod,
        destinationAddresses: { [walletAddress]: [network] },
        defaultNetwork: network,
      });

      // Set the session URL
      setSessionUrl(oneClickBuyUrl);

      // Show the WebView
      setWebViewVisible(true);
    } catch (error) {
      console.error("Error generating One-Click-Buy URL:", error);
      Alert.alert("Error", "Failed to generate One-Click-Buy URL");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWebViewVisible(false);
    setSessionUrl(null);
  };

  const handleSuccess = (transactionId: string) => {
    Alert.alert("Success", `Transaction initiated! ID: ${transactionId}`);
    // Start polling for transaction status
    pollTransactionStatus(transactionId);
  };

  const handleFailure = (error: Error) => {
    Alert.alert("Error", error.message || "Transaction failed");
  };

  const pollTransactionStatus = async (transactionId: string) => {
    try {
      const intervalId = setInterval(async () => {
        try {
          // Get latest transaction status
          const transactions = await coinbase.getTransactionStatus(
            partnerUserId
          );

          if (transactions && transactions.length > 0) {
            // Find the transaction with the matching ID
            const tx = transactions.find(
              (t) => t.transaction_id === transactionId
            );

            if (tx) {
              setTransaction(tx);

              // If transaction is completed or failed, stop polling
              if (tx.status !== "ONRAMP_TRANSACTION_STATUS_IN_PROGRESS") {
                clearInterval(intervalId);
              }
            }
          }
        } catch (error) {
          console.error("Error polling transaction status:", error);
          clearInterval(intervalId);
        }
      }, 5000);

      // Clear interval after 5 minutes (300000ms) to prevent infinite polling
      setTimeout(() => clearInterval(intervalId), 300000);
    } catch (error) {
      console.error("Error setting up polling:", error);
    }
  };

  // Filter function for search
  const filterData = (data: any[], query: string, keyField = "name") => {
    if (!query) return data;
    return data.filter((item) =>
      item[keyField].toLowerCase().includes(query.toLowerCase())
    );
  };

  // Render dropdown selector
  const renderDropdownSelector = (
    label: string,
    value: string,
    onPress: () => void,
    displayValue?: string
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}:</Text>
      <TouchableOpacity style={styles.dropdown} onPress={onPress}>
        <Text style={styles.dropdownText}>{displayValue || value}</Text>
      </TouchableOpacity>
    </View>
  );

  // Render modal with search and selection
  const renderModal = (
    visible: boolean,
    onClose: () => void,
    data: any[],
    onSelect: (item: any) => void,
    keyField: string = "code",
    displayField: string = "name",
    title: string
  ) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <FlatList
            data={filterData(data, searchQuery, displayField)}
            keyExtractor={(item) => item[keyField]}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  setSearchQuery("");
                  onClose();
                }}
              >
                <Text style={styles.modalItemText}>{item[displayField]}</Text>
                {item.code && (
                  <Text style={styles.modalItemSubtext}>{item.code}</Text>
                )}
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>One-Click-Buy Example</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>App ID:</Text>
          <TextInput
            style={styles.input}
            value={appId}
            onChangeText={setAppId}
            placeholder="Enter your Coinbase App ID"
          />
        </View>

        {!initialized && (
          <TouchableOpacity style={styles.button} onPress={initializeSDK}>
            <Text style={styles.buttonText}>Initialize SDK</Text>
          </TouchableOpacity>
        )}

        {initialized && (
          <View style={styles.formContainer}>
            {/* Asset Selector */}
            {renderDropdownSelector(
              "Asset",
              asset,
              () => setAssetModalVisible(true),
              ASSETS.find((a) => a.code === asset)?.name
            )}

            {/* Network Selector */}
            {renderDropdownSelector(
              "Network",
              network,
              () => setNetworkModalVisible(true),
              NETWORKS.find((n) => n.code === network)?.name
            )}

            {/* Amount Selector */}
            {renderDropdownSelector(
              "Amount",
              amount,
              () => setAmountModalVisible(true),
              `${fiatCurrency} ${amount}`
            )}

            {/* Fiat Currency Selector */}
            {renderDropdownSelector(
              "Fiat Currency",
              fiatCurrency,
              () => setFiatCurrencyModalVisible(true),
              FIAT_CURRENCIES.find((c) => c.code === fiatCurrency)?.name
            )}

            {/* Payment Method Selector */}
            {renderDropdownSelector(
              "Payment Method",
              paymentMethod,
              () => setPaymentMethodModalVisible(true),
              PAYMENT_METHODS.find((p) => p.code === paymentMethod)?.name
            )}

            {/* Country Selector */}
            {renderDropdownSelector(
              "Country",
              country,
              () => setCountryModalVisible(true),
              COUNTRIES.find((c) => c.code === country)?.name
            )}

            {/* Wallet Address Selector */}
            {renderDropdownSelector(
              "Wallet Address",
              walletAddress,
              () => setWalletAddressModalVisible(true),
              WALLET_ADDRESSES.find((w) => w.address === walletAddress)?.name
            )}

            {/* Generate Quote Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={generateQuote}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Generate Quote</Text>
              )}
            </TouchableOpacity>

            {/* One-Click-Buy Button */}
            {quoteId && (
              <TouchableOpacity
                style={[styles.button, styles.buyButton]}
                onPress={handleOneClickBuy}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    One-Click-Buy {asset} for {fiatCurrency} {amount}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {/* Quote ID Display */}
            {quoteId && (
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Quote ID:</Text>
                <Text style={styles.infoValue}>{quoteId}</Text>
              </View>
            )}

            {/* Session URL Display */}
            {sessionUrl && (
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Session URL:</Text>
                <Text
                  style={styles.infoValue}
                  numberOfLines={3}
                  ellipsizeMode="middle"
                >
                  {sessionUrl}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Transaction details */}
        {transaction && (
          <View style={styles.receipt}>
            <Text style={styles.receiptTitle}>Transaction Details</Text>
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

        {/* WebView for Coinbase Onramp */}
        {sessionUrl && (
          <OnrampWebView
            url={sessionUrl}
            visible={webViewVisible}
            onClose={handleClose}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
          />
        )}
      </View>

      {/* Modals */}
      {renderModal(
        assetModalVisible,
        () => setAssetModalVisible(false),
        ASSETS,
        (item) => {
          setAsset(item.code);
          // Auto-select the corresponding network
          setNetwork(item.network);
        },
        "code",
        "name",
        "Select Asset"
      )}

      {renderModal(
        networkModalVisible,
        () => setNetworkModalVisible(false),
        NETWORKS,
        (item) => setNetwork(item.code),
        "code",
        "name",
        "Select Network"
      )}

      {renderModal(
        amountModalVisible,
        () => setAmountModalVisible(false),
        DEFAULT_AMOUNTS,
        (item) => setAmount(item.value),
        "value",
        "label",
        "Select Amount"
      )}

      {renderModal(
        fiatCurrencyModalVisible,
        () => setFiatCurrencyModalVisible(false),
        FIAT_CURRENCIES,
        (item) => setFiatCurrency(item.code),
        "code",
        "name",
        "Select Fiat Currency"
      )}

      {renderModal(
        paymentMethodModalVisible,
        () => setPaymentMethodModalVisible(false),
        PAYMENT_METHODS,
        (item) => setPaymentMethod(item.code),
        "code",
        "name",
        "Select Payment Method"
      )}

      {renderModal(
        countryModalVisible,
        () => setCountryModalVisible(false),
        COUNTRIES,
        (item) => setCountry(item.code),
        "code",
        "name",
        "Select Country"
      )}

      {renderModal(
        walletAddressModalVisible,
        () => setWalletAddressModalVisible(false),
        WALLET_ADDRESSES,
        (item) => setWalletAddress(item.address),
        "address",
        "name",
        "Select Wallet Address"
      )}
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
    marginBottom: 24,
    color: "#0052FF",
  },
  formContainer: {
    width: "100%",
    marginBottom: 20,
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
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: "100%",
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#0052FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 16,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buyButton: {
    backgroundColor: "#00C087",
    marginTop: 0,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  infoBox: {
    width: "100%",
    padding: 12,
    backgroundColor: "#f0f0f5",
    borderRadius: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
  },
  receipt: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    width: "100%",
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#0052FF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#0052FF",
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  modalItemSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});
