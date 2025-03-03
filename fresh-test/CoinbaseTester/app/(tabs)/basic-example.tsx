// Import shim first to ensure crypto is available
import "../../shim";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { useCoinbase } from "@/components/CoinbaseWrapper";
import { OnrampWebView } from "../../app/components/OnrampWebView";

// Pre-defined options for dropdowns
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

const FIAT_CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
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

export default function BasicExampleScreen() {
  const coinbase = useCoinbase();

  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [userCountry, setUserCountry] = useState("US");
  const [appId, setAppId] = useState("YOUR_COINBASE_APP_ID_HERE");
  const [initialized, setInitialized] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState("50");
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState("USD");
  const [selectedWalletAddress, setSelectedWalletAddress] = useState(
    WALLET_ADDRESSES[0].address
  );
  const [searchQuery, setSearchQuery] = useState("");
  const partnerUserId = "user_123"; // This should be unique to your user

  // Modal states
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [fiatCurrencyModalVisible, setFiatCurrencyModalVisible] =
    useState(false);
  const [amountModalVisible, setAmountModalVisible] = useState(false);
  const [walletAddressModalVisible, setWalletAddressModalVisible] =
    useState(false);
  const [assetModalVisible, setAssetModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const [webViewVisible, setWebViewVisible] = useState(false);
  const [onrampUrl, setOnrampUrl] = useState<string | null>(null);

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
        fetchAssets();
      } else {
        Alert.alert("Error", "Failed to initialize SDK");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error initializing SDK:", error);
      Alert.alert("Error", "Failed to initialize SDK");
      setLoading(false);
    }
  };

  // Fetch supported assets when SDK is initialized
  const fetchAssets = async () => {
    try {
      // Get supported options based on user's country
      const options = await coinbase.getOptions(userCountry);
      if (options && options.purchase_currencies) {
        setAssets(options.purchase_currencies);
        if (options.purchase_currencies.length > 0) {
          setSelectedAsset(options.purchase_currencies[0]);
        }
      } else {
        setAssets([]);
        Alert.alert("Error", "No supported assets found");
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      Alert.alert("Error", "Failed to fetch supported assets");
    } finally {
      setLoading(false);
    }
  };

  // Poll for transaction status updates
  useEffect(() => {
    if (!transaction || !initialized) return;

    const intervalId = setInterval(async () => {
      try {
        // Get latest transaction status
        const transactions = await coinbase.getTransactionStatus(partnerUserId);

        if (transactions && transactions.length > 0) {
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
  }, [transaction, initialized]);

  // Handle buy button press
  const handleBuy = async (asset: any) => {
    if (!initialized) {
      Alert.alert("Error", "SDK not initialized");
      return;
    }

    try {
      // Create a purchase configuration
      const purchaseParams = {
        asset: asset.code,
        amount: parseFloat(selectedAmount),
        fiatCurrency: selectedFiatCurrency,
        // Create address format required by Coinbase API
        destinationAddresses: {
          [selectedWalletAddress]: asset.networks || ["ethereum"],
        },
        partnerUserId: partnerUserId,
      };

      // Start the purchase flow
      const url = await coinbase.startPurchase(purchaseParams, {
        onSuccess: (tx: any) => {
          setTransaction(tx);
          Alert.alert("Success", "Transaction initiated! Check status below.");
        },
        onFailure: (error: Error) => {
          Alert.alert("Error", error.message || "Purchase failed");
        },
        onCancel: () => {
          Alert.alert("Cancelled", "Purchase was cancelled");
        },
        onStatusChange: (status: string) => {
          console.log("Transaction status:", status);
        },
      });

      // Set the URL and show the WebView
      setOnrampUrl(url);
      setWebViewVisible(true);
    } catch (error) {
      console.error("Error starting purchase:", error);
      Alert.alert("Error", "Failed to start purchase");
    }
  };

  const handleWebViewClose = () => {
    setWebViewVisible(false);
    setOnrampUrl(null);
  };

  const handleWebViewSuccess = (transactionId: string) => {
    Alert.alert("Success", `Transaction initiated! ID: ${transactionId}`);
    // You can start polling for transaction status here if needed
  };

  const handleWebViewFailure = (error: Error) => {
    Alert.alert("Error", error.message || "Transaction failed");
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
        <Text style={styles.title}>Buy Cryptocurrency</Text>

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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0052FF" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          initialized && (
            <View style={styles.formContainer}>
              {/* Country Selector */}
              {renderDropdownSelector(
                "Country",
                userCountry,
                () => setCountryModalVisible(true),
                COUNTRIES.find((c) => c.code === userCountry)?.name
              )}

              {/* Fiat Currency Selector */}
              {renderDropdownSelector(
                "Fiat Currency",
                selectedFiatCurrency,
                () => setFiatCurrencyModalVisible(true),
                FIAT_CURRENCIES.find((c) => c.code === selectedFiatCurrency)
                  ?.name
              )}

              {/* Amount Selector */}
              {renderDropdownSelector(
                "Amount",
                selectedAmount,
                () => setAmountModalVisible(true),
                `${selectedFiatCurrency} ${selectedAmount}`
              )}

              {/* Wallet Address Selector */}
              {renderDropdownSelector(
                "Wallet Address",
                selectedWalletAddress,
                () => setWalletAddressModalVisible(true),
                WALLET_ADDRESSES.find(
                  (w) => w.address === selectedWalletAddress
                )?.name
              )}

              {/* Asset Selector */}
              {assets.length > 0 && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Select Asset:</Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setAssetModalVisible(true)}
                  >
                    <Text style={styles.dropdownText}>
                      {selectedAsset
                        ? `${selectedAsset.name} (${selectedAsset.code})`
                        : "Select an asset"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Buy Button */}
              {selectedAsset && (
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => handleBuy(selectedAsset)}
                >
                  <Text style={styles.buyButtonText}>
                    Buy {selectedAsset.code} for {selectedFiatCurrency}{" "}
                    {selectedAmount}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )
        )}

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

        {/* WebView for Coinbase Onramp */}
        {onrampUrl && (
          <OnrampWebView
            url={onrampUrl}
            visible={webViewVisible}
            onClose={handleWebViewClose}
            onSuccess={handleWebViewSuccess}
            onFailure={handleWebViewFailure}
          />
        )}
      </View>

      {/* Modals */}
      {renderModal(
        countryModalVisible,
        () => setCountryModalVisible(false),
        COUNTRIES,
        (item) => setUserCountry(item.code),
        "code",
        "name",
        "Select Country"
      )}

      {renderModal(
        fiatCurrencyModalVisible,
        () => setFiatCurrencyModalVisible(false),
        FIAT_CURRENCIES,
        (item) => setSelectedFiatCurrency(item.code),
        "code",
        "name",
        "Select Fiat Currency"
      )}

      {renderModal(
        amountModalVisible,
        () => setAmountModalVisible(false),
        DEFAULT_AMOUNTS,
        (item) => setSelectedAmount(item.value),
        "value",
        "label",
        "Select Amount"
      )}

      {renderModal(
        walletAddressModalVisible,
        () => setWalletAddressModalVisible(false),
        WALLET_ADDRESSES,
        (item) => setSelectedWalletAddress(item.address),
        "address",
        "name",
        "Select Wallet Address"
      )}

      {renderModal(
        assetModalVisible,
        () => setAssetModalVisible(false),
        assets,
        (item) => setSelectedAsset(item),
        "code",
        "name",
        "Select Asset"
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
    backgroundColor: "#0052FF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  noAssetsText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
