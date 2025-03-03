import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import { CoinbaseOnramp } from "coinbase-onramp-react-native-sdk";

// Create a new instance of CoinbaseOnramp
const coinbaseInstance = new CoinbaseOnramp();

// Create context
interface CoinbaseContextType {
  initialize: (appId: string) => Promise<boolean>;
  isInitialized: boolean;
  startPurchase: (params: any, callbacks?: any) => Promise<string>;
  getOptions: (country: string, subdivision?: string) => Promise<any>;
  getTransactionStatus: (partnerUserId: string) => Promise<any[]>;
  generateOneClickBuyUrl: (params: any) => Promise<string>;
  getQuote: (params: any) => Promise<any>;
}

const CoinbaseContext = createContext<CoinbaseContextType | null>(null);

// Provider component
export const CoinbaseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the SDK
  const initialize = async (appId: string): Promise<boolean> => {
    try {
      console.log("Initializing Coinbase SDK with appId:", appId);

      // Initialize with configuration
      coinbaseInstance.initialize({
        appId,
        environment: "production", // or 'sandbox' for testing
      });

      setIsInitialized(true);
      console.log("Coinbase SDK initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing Coinbase SDK:", error);
      Alert.alert("Initialization Error", "Failed to initialize Coinbase SDK");
      return false;
    }
  };

  // Start a purchase
  const startPurchase = async (
    params: any,
    callbacks?: any
  ): Promise<string> => {
    if (!isInitialized) {
      throw new Error("SDK not initialized");
    }

    try {
      return await coinbaseInstance.startPurchase(params, callbacks);
    } catch (error) {
      console.error("Error starting purchase:", error);
      throw error;
    }
  };

  // Get supported options
  const getOptions = async (country: string, subdivision?: string) => {
    if (!isInitialized) {
      throw new Error("SDK not initialized");
    }

    try {
      return await coinbaseInstance.getOptions(country, subdivision);
    } catch (error) {
      console.error("Error getting options:", error);
      throw error;
    }
  };

  // Get transaction status
  const getTransactionStatus = async (partnerUserId: string) => {
    if (!isInitialized) {
      throw new Error("SDK not initialized");
    }

    try {
      return await coinbaseInstance.getTransactionStatus(partnerUserId);
    } catch (error) {
      console.error("Error getting transaction status:", error);
      throw error;
    }
  };

  // Generate one-click buy URL
  const generateOneClickBuyUrl = async (params: any) => {
    if (!isInitialized) {
      throw new Error("SDK not initialized");
    }

    try {
      return await coinbaseInstance.generateOneClickBuyUrl(
        params.quoteId,
        params.presetFiatAmount,
        params.fiatCurrency,
        params.defaultAsset,
        params.defaultPaymentMethod,
        params.destinationAddresses,
        params.defaultNetwork
      );
    } catch (error) {
      console.error("Error generating one-click buy URL:", error);
      throw error;
    }
  };

  // Get quote
  const getQuote = async (params: any) => {
    if (!isInitialized) {
      throw new Error("SDK not initialized");
    }

    try {
      return await coinbaseInstance.getQuote(params);
    } catch (error) {
      console.error("Error getting quote:", error);
      throw error;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log("CoinbaseWrapper unmounted");
    };
  }, []);

  const value = {
    initialize,
    isInitialized,
    startPurchase,
    getOptions,
    getTransactionStatus,
    generateOneClickBuyUrl,
    getQuote,
  };

  return (
    <CoinbaseContext.Provider value={value}>
      {children}
    </CoinbaseContext.Provider>
  );
};

// Hook to use the Coinbase context
export const useCoinbase = () => {
  const context = useContext(CoinbaseContext);
  if (!context) {
    throw new Error("useCoinbase must be used within a CoinbaseProvider");
  }
  return context;
};
