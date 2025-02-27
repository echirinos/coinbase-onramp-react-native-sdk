import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import CoinbaseOnramp from "../index";
import { PurchaseParams, OnrampEventCallback } from "../types";
import { OnrampWebView } from "./OnrampWebView";

interface OnrampButtonProps {
  purchaseParams: PurchaseParams;
  eventCallbacks?: OnrampEventCallback;
  buttonText?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loadingColor?: string;
  openIn?: "popup" | "tab"; // Control how the WebView opens
}

export const OnrampButton: React.FC<OnrampButtonProps> = ({
  purchaseParams,
  eventCallbacks,
  buttonText = "Buy Crypto",
  style,
  textStyle,
  loadingColor = "#FFFFFF",
  openIn = "popup",
}) => {
  const [loading, setLoading] = useState(false);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [country, setCountry] = useState<string>("US"); // Default to US
  const [supportedAssets, setSupportedAssets] = useState<string[]>([]);

  // Fetch supported assets for the country on mount
  useEffect(() => {
    const fetchSupportedOptions = async () => {
      if (CoinbaseOnramp.isInitialized()) {
        try {
          const options = await CoinbaseOnramp.getOptions(country);
          const assets = options.purchase_currencies.map(
            (currency) => currency.code
          );
          setSupportedAssets(assets);
        } catch (error) {
          console.error("Error fetching supported assets:", error);
        }
      }
    };

    fetchSupportedOptions();
  }, [country]);

  const handlePress = async () => {
    try {
      if (!CoinbaseOnramp.isInitialized()) {
        throw new Error("CoinbaseOnramp SDK not initialized");
      }

      setLoading(true);

      // Ensure the asset is supported
      if (
        purchaseParams.asset &&
        !supportedAssets.includes(purchaseParams.asset)
      ) {
        console.warn(
          `Asset ${purchaseParams.asset} might not be supported in ${country}. Proceeding anyway.`
        );
      }

      // Create destination addresses format required by the API
      const destinationAddresses = purchaseParams.destinationAddresses || {
        [purchaseParams.asset]: [purchaseParams.network || "ethereum"],
      };

      // Generate the Onramp URL
      const url = await CoinbaseOnramp.startPurchase(
        {
          ...purchaseParams,
          destinationAddresses,
          // Ensure partnerUserId is passed for transaction tracking
          partnerUserId:
            purchaseParams.partnerUserId ||
            `user_${Math.random().toString(36).substring(2, 9)}`,
        },
        eventCallbacks
      );

      setSessionUrl(url);
    } catch (error) {
      console.error("Error starting purchase:", error);
      if (eventCallbacks?.onFailure) {
        eventCallbacks.onFailure(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSessionUrl(null);
    if (eventCallbacks?.onCancel) {
      eventCallbacks.onCancel();
    }
  };

  // Different handling for mobile vs web platforms
  const isWeb = Platform.OS === "web";

  const handleWebOpen = () => {
    if (sessionUrl) {
      if (openIn === "tab") {
        // Open in a new tab
        window.open(sessionUrl, "_blank");
      } else {
        // Open in a popup
        const width = 450;
        const height = 700;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        window.open(
          sessionUrl,
          "CoinbaseOnramp",
          `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0`
        );
      }

      // We need to rely on redirect URLs for callbacks in this case
      // so the WebView component is not needed
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={
          isWeb ? (sessionUrl ? handleWebOpen : handlePress) : handlePress
        }
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={loadingColor} />
        ) : (
          <Text style={[styles.buttonText, textStyle]}>{buttonText}</Text>
        )}
      </TouchableOpacity>

      {!isWeb && sessionUrl && (
        <OnrampWebView
          sessionUrl={sessionUrl}
          onClose={handleClose}
          onSuccess={(txId) => {
            if (eventCallbacks?.onSuccess && purchaseParams.partnerUserId) {
              // Start polling for transaction status
              CoinbaseOnramp.startStatusPolling(purchaseParams.partnerUserId);
            }
          }}
          onFailure={eventCallbacks?.onFailure}
          onCancel={eventCallbacks?.onCancel}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0052FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
