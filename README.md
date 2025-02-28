# Coinbase Onramp React Native SDK

<p align="center">
  <img src="https://www.coinbase.com/img/coinbase-logo.svg" alt="Coinbase Logo" width="250"/>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/coinbase-onramp-react-native-sdk"><img src="https://img.shields.io/npm/v/coinbase-onramp-react-native-sdk.svg" alt="npm version"></a>
  <a href="https://github.com/echirinos/coinbase-onramp-react-native-sdk/actions/workflows/tests.yml"><img src="https://github.com/echirinos/coinbase-onramp-react-native-sdk/actions/workflows/tests.yml/badge.svg" alt="Build Status"></a>
  <a href="https://github.com/echirinos/coinbase-onramp-react-native-sdk/blob/main/LICENSE"><img src="https://img.shields.io/github/license/echirinos/coinbase-onramp-react-native-sdk" alt="License"></a>
</p>

The Coinbase Onramp React Native SDK allows you to build delightful cryptocurrency purchasing experiences in your native Android and iOS apps using React Native. We provide powerful and customizable UI components that can be used out-of-the-box to enable your users to buy crypto directly within your app.

## Features

- 🚀 **Simple Integration** - Get up and running in minutes with pre-built UI components
- 🔒 **Secure** - Built with security best practices and Coinbase's trusted infrastructure
- 🎨 **Customizable** - Style components to match your app's design language
- 📱 **Cross-Platform** - Works on iOS, Android, and Web platforms
- 🌐 **Global Support** - Access to Coinbase's wide range of supported countries and payment methods
- 💸 **Multiple Cryptocurrencies** - Support for Bitcoin, Ethereum, and many other digital assets

## Getting Started

Get started with our [integration guides](#basic-implementation) and [example projects](#examples), or browse the [API reference](#api-reference).

## Installation

### React Native CLI

```bash
# Using npm
npm install coinbase-onramp-react-native-sdk

# Using yarn
yarn add coinbase-onramp-react-native-sdk
```

### Expo

```bash
# Using expo
expo install coinbase-onramp-react-native-sdk
```

Next, add the following to your `app.json` file:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-webview",
        {
          "packageImportPath": "import WebView from 'react-native-webview'"
        }
      ]
    ]
  }
}
```

## Requirements

### Android

- Android 5.0 (API level 21) and above
- Gradle plugin 4.x and above

### iOS

- iOS 12 or above
- Xcode 12 or later

### Peer Dependencies

The SDK requires the following peer dependencies:

```bash
# Using npm
npm install react-native-webview

# Using yarn
yarn add react-native-webview

# Using expo
expo install react-native-webview
```

### Platform-Specific Setup

#### iOS

For iOS, you need to install the pods:

```bash
cd ios && pod install
```

#### Android

No additional setup required for Android.

## Basic Usage Example

```javascript
// App.js
import React, { useEffect } from "react";
import { View, Button, Alert } from "react-native";
import CoinbaseOnramp, { OnrampButton } from "coinbase-onramp-react-native-sdk";

export default function App() {
  useEffect(() => {
    // Initialize the SDK with your Coinbase API credentials
    CoinbaseOnramp.initialize({
      apiKey: "YOUR_API_KEY",
      apiSecret: "YOUR_API_SECRET",
      environment: "sandbox", // Use 'production' for live transactions
      appId: "YOUR_APP_ID",
    });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <OnrampButton
        purchaseParams={{
          asset: "ETH",
          amount: 50,
          destinationAddresses: {
            "0x4315d134aCd3221a02dD380ADE3aF39Ce219037c": ["ethereum"],
          },
          partnerUserId: "user_123",
        }}
        eventCallbacks={{
          onSuccess: (transaction) => {
            Alert.alert("Success", "Crypto purchase successful!");
            console.log(transaction);
          },
          onFailure: (error) => {
            Alert.alert("Error", error.message);
          },
          onCancel: () => {
            Alert.alert("Cancelled", "Transaction was cancelled");
          },
        }}
        buttonText="Buy ETH"
      />
    </View>
  );
}
```

## SDK Initialization

To initialize the Coinbase Onramp SDK in your React Native app, call the `initialize` method as early as possible in your application:

```javascript
import CoinbaseOnramp from "coinbase-onramp-react-native-sdk";

// Initialize the SDK with your Coinbase API credentials
CoinbaseOnramp.initialize({
  apiKey: "YOUR_API_KEY",
  apiSecret: "YOUR_API_SECRET",
  environment: "sandbox", // Use 'production' for live transactions
  appId: "YOUR_APP_ID",
});
```

You can obtain your API credentials from the [Coinbase Developer Portal](https://developer.coinbase.com):

1. Create a developer account at [developer.coinbase.com](https://developer.coinbase.com)
2. Create a new application in the Developer Dashboard
3. Enable the Onramp API for your application
4. Generate API keys for your application
5. Note your API Key, API Secret, and App ID

## Components

### OnrampButton

The simplest way to integrate Coinbase Onramp is using the pre-built `OnrampButton` component:

```javascript
import React from "react";
import { View, StyleSheet } from "react-native";
import { OnrampButton } from "coinbase-onramp-react-native-sdk";

const BuyCryptoScreen = () => {
  return (
    <View style={styles.container}>
      <OnrampButton
        purchaseParams={{
          asset: "ETH",
          amount: 50, // Default amount in USD
          destinationAddresses: {
            "0x4315d134aCd3221a02dD380ADE3aF39Ce219037c": ["ethereum"],
          },
          partnerUserId: "user_123", // Unique identifier for your user
        }}
        eventCallbacks={{
          onSuccess: (transaction) => {
            console.log("Transaction successful:", transaction);
            // Update your UI or navigate to a success screen
          },
          onFailure: (error) => {
            console.error("Transaction failed:", error);
            // Handle the error appropriately
          },
          onCancel: () => {
            console.log("Transaction cancelled");
            // Handle cancellation
          },
          onStatusChange: (status) => {
            console.log("Transaction status changed:", status);
            // Update transaction status in your UI
          },
        }}
        buttonText="Buy ETH"
        buttonStyle={styles.button}
        textStyle={styles.buttonText}
        loadingColor="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  button: {
    backgroundColor: "#0052FF", // Coinbase blue
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 200,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default BuyCryptoScreen;
```

### OnrampWebView

For more control over the user experience, you can use the `OnrampWebView` component:

```javascript
import React, { useState } from "react";
import { View, Button, Alert } from "react-native";
import CoinbaseOnramp, {
  OnrampWebView,
} from "coinbase-onramp-react-native-sdk";

const CustomOnrampScreen = () => {
  const [sessionUrl, setSessionUrl] = useState(null);

  const startPurchase = async () => {
    try {
      // Generate the Onramp URL
      const url = await CoinbaseOnramp.startPurchase({
        asset: "BTC",
        amount: 100,
        destinationAddresses: {
          bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh: ["bitcoin"],
        },
        partnerUserId: "user_456",
      });

      setSessionUrl(url);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {!sessionUrl ? (
        <Button title="Buy Bitcoin" onPress={startPurchase} />
      ) : (
        <OnrampWebView
          sessionUrl={sessionUrl}
          onClose={() => setSessionUrl(null)}
          onSuccess={(txId) => {
            Alert.alert("Success", `Transaction ID: ${txId}`);
            setSessionUrl(null);
          }}
          onFailure={(error) => {
            Alert.alert("Error", error.message);
            setSessionUrl(null);
          }}
        />
      )}
    </View>
  );
};

export default CustomOnrampScreen;
```

## Advanced Usage

### One-Click Buy

For a streamlined purchase experience, you can implement a one-click buy flow using pre-generated quotes:

```javascript
import React, { useState } from "react";
import {
  View,
  Button,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import CoinbaseOnramp, {
  OnrampWebView,
} from "coinbase-onramp-react-native-sdk";

const OneClickBuyScreen = () => {
  const [loading, setLoading] = useState(false);
  const [quoteId, setQuoteId] = useState(null);
  const [sessionUrl, setSessionUrl] = useState(null);

  const generateQuote = async () => {
    try {
      setLoading(true);

      // Generate a quote for the purchase
      const quote = await CoinbaseOnramp.getQuote({
        purchase_currency: "ETH",
        payment_amount: "100.00",
        payment_currency: "USD",
        payment_method: "CARD",
        country: "US",
      });

      setQuoteId(quote.quote_id);
      Alert.alert("Quote Generated", `Quote ID: ${quote.quote_id}`);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickBuy = async () => {
    if (!quoteId) {
      Alert.alert("Error", "Please generate a quote first");
      return;
    }

    try {
      setLoading(true);

      // Generate a one-click-buy URL using the quote ID
      const url = await CoinbaseOnramp.generateOneClickBuyUrl({
        quoteId: quoteId,
        destinationAddresses: {
          "0x4315d134aCd3221a02dD380ADE3aF39Ce219037c": ["ethereum"],
        },
        partnerUserId: "user_789",
      });

      setSessionUrl(url);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0052FF" />}

      {!sessionUrl && !loading && (
        <>
          <Button
            title="Generate Quote"
            onPress={generateQuote}
            color="#0052FF"
            disabled={loading}
          />

          <View style={styles.spacer} />

          <Button
            title="One-Click Buy"
            onPress={handleOneClickBuy}
            color="#00C244"
            disabled={!quoteId || loading}
          />
        </>
      )}

      {sessionUrl && (
        <OnrampWebView
          sessionUrl={sessionUrl}
          onClose={() => setSessionUrl(null)}
          onSuccess={(txId) => {
            Alert.alert("Success", `Transaction ID: ${txId}`);
            setSessionUrl(null);
            setQuoteId(null);
          }}
          onFailure={(error) => {
            Alert.alert("Error", error.message);
            setSessionUrl(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  spacer: {
    height: 20,
  },
});

export default OneClickBuyScreen;
```

## API Reference

### CoinbaseOnramp

#### Core Methods

| Method                   | Description                                               | Parameters                                                | Return Type                |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------------- | -------------------------- |
| `initialize`             | Initialize the SDK with your Coinbase API credentials     | `config: OnrampConfig`                                    | `void`                     |
| `isInitialized`          | Check if the SDK has been initialized                     | None                                                      | `boolean`                  |
| `getConfig`              | Get supported countries and payment methods               | None                                                      | `Promise<CountriesConfig>` |
| `getOptions`             | Get supported fiat currencies and available crypto assets | `country: string, subdivision?: string`                   | `Promise<OnrampOptions>`   |
| `getQuote`               | Get a quote for a cryptocurrency purchase                 | `params: QuoteParams`                                     | `Promise<OnrampQuote>`     |
| `createSessionToken`     | Create a session token for secure authentication          | `params: SessionTokenParams`                              | `Promise<string>`          |
| `startPurchase`          | Start the cryptocurrency purchase flow                    | `params: PurchaseParams, callbacks?: OnrampEventCallback` | `Promise<string>`          |
| `generateOneClickBuyUrl` | Generate a one-click-buy URL with a quote                 | `params: OneClickBuyParams`                               | `Promise<string>`          |

## Examples

The SDK includes several example implementations to help you get started:

- [Basic Example](https://github.com/echirinos/coinbase-onramp-react-native-sdk/blob/main/examples/BasicExample.tsx) - Simple implementation using the OnrampButton component
- [One-Click Buy Example](https://github.com/echirinos/coinbase-onramp-react-native-sdk/blob/main/examples/OneClickBuyExample.tsx) - Implementation of the one-click buy flow
