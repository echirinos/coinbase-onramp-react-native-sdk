# Setting Up a React Native Project with Coinbase Onramp SDK

This guide will walk you through setting up a new React Native project with the Coinbase Onramp SDK.

## 1. Create a new React Native project

```bash
npx react-native init CoinbaseOnrampExample
cd CoinbaseOnrampExample
```

## 2. Install the required dependencies

```bash
npm install coinbase-onramp-react-native-sdk
npm install buffer events process react-native-crypto stream-browserify
npm install --save-dev babel-plugin-module-resolver
```

## 3. Create a shim.js file in the project root

```javascript
// shim.js
global.Buffer = require("buffer").Buffer;
global.process = require("process");
global.EventEmitter = require("events");

// Needed for react-native-crypto
if (typeof __dirname === "undefined") global.__dirname = "/";
if (typeof __filename === "undefined") global.__filename = "";
if (typeof process.browser === "undefined") process.browser = true;

// Initialize crypto
const crypto = require("react-native-crypto");

// Ensure crypto.randomBytes is available
if (!crypto.randomBytes) {
  crypto.randomBytes = function (size) {
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return Buffer.from(bytes);
  };
}

// Ensure crypto.randomBytes.seed is available
if (typeof crypto.randomBytes === "function") {
  // If randomBytes is a function, add the seed method to it
  crypto.randomBytes.seed = function (seed) {
    console.log("Seed function called with:", seed);
    return true;
  };
} else if (!crypto.randomBytes) {
  // If randomBytes doesn't exist, create it as an object
  crypto.randomBytes = {
    seed: function (seed) {
      console.log("Seed function called with:", seed);
      return true;
    },
  };
}

// Ensure crypto.createHash is available
if (!crypto.createHash) {
  crypto.createHash = function (algorithm) {
    return {
      update: function (data) {
        this.data = data;
        return this;
      },
      digest: function () {
        // Simple mock implementation
        return (
          "mock-hash-" +
          (this.data ? this.data.toString().substring(0, 10) : "empty")
        );
      },
    };
  };
}

// Make crypto globally available
global.crypto = crypto;

console.log("Crypto shim loaded successfully");
```

## 4. Update the index.js file

```javascript
// index.js
import "./shim"; // Import the shim first
import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);
```

## 5. Create a metro.config.js file

```javascript
// metro.config.js
const { getDefaultConfig } = require("metro-config");

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      sourceExts,
      assetExts,
      extraNodeModules: {
        crypto: require.resolve("react-native-crypto"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        events: require.resolve("events"),
        process: require.resolve("process"),
      },
    },
  };
})();
```

## 6. Update the babel.config.js file

```javascript
// babel.config.js
module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        alias: {
          crypto: "react-native-crypto",
          stream: "stream-browserify",
          buffer: "buffer",
          events: "events",
          process: "process",
        },
      },
    ],
  ],
};
```

## 7. Update the App.js file with a basic example

```javascript
// App.js
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
} from "react-native";
import CoinbaseOnramp, { OnrampButton } from "coinbase-onramp-react-native-sdk";

const App = () => {
  const [initialized, setInitialized] = useState(false);
  const [appId, setAppId] = useState("YOUR_APP_ID");
  const [walletAddress, setWalletAddress] = useState(
    "0x1234567890abcdef1234567890abcdef12345678"
  );

  useEffect(() => {
    // You can initialize the SDK here if you have the credentials
    // Otherwise, use the initializeSDK function below
  }, []);

  const initializeSDK = () => {
    try {
      CoinbaseOnramp.initialize({
        apiKey: "YOUR_API_KEY",
        apiSecret: "YOUR_API_SECRET",
        environment: "sandbox",
        appId: appId,
      });
      setInitialized(true);
      console.log("SDK initialized successfully");
    } catch (error) {
      console.error("Failed to initialize SDK:", error);
    }
  };

  const getConfig = async () => {
    try {
      const config = await CoinbaseOnramp.getConfig();
      console.log("Config:", config);
    } catch (error) {
      console.error("Failed to get config:", error);
    }
  };

  const getOptions = async () => {
    try {
      const options = await CoinbaseOnramp.getOptions("US");
      console.log("Options:", options);
    } catch (error) {
      console.error("Failed to get options:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Coinbase Onramp Example</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SDK Initialization</Text>
          <TextInput
            style={styles.input}
            placeholder="App ID"
            value={appId}
            onChangeText={setAppId}
          />
          <Button
            title="Initialize SDK"
            onPress={initializeSDK}
            disabled={initialized}
          />
          <Text style={styles.status}>
            Status: {initialized ? "Initialized" : "Not Initialized"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Ethereum Wallet Address"
            value={walletAddress}
            onChangeText={setWalletAddress}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Methods</Text>
          <View style={styles.buttonRow}>
            <Button
              title="Get Config"
              onPress={getConfig}
              disabled={!initialized}
            />
            <Button
              title="Get Options"
              onPress={getOptions}
              disabled={!initialized}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Onramp Button</Text>
          {initialized && (
            <OnrampButton
              asset="ETH"
              network="ethereum"
              amount={100}
              destinationAddresses={{
                ethereum: [walletAddress],
              }}
              fiatCurrency="USD"
              paymentMethod="card"
              onSuccess={(transaction) => console.log("Success:", transaction)}
              onFailure={(error) => console.error("Error:", error)}
              onCancel={() => console.log("Cancelled")}
              style={styles.onrampButton}
              textStyle={styles.onrampButtonText}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  status: {
    marginTop: 10,
    fontStyle: "italic",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  onrampButton: {
    backgroundColor: "#0052FF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  onrampButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default App;
```

## 8. Run the app

```bash
npx react-native run-ios
# or
npx react-native run-android
```

## Troubleshooting

If you encounter any issues:

1. Make sure you've imported the shim at the top of your index.js file
2. Check that all dependencies are installed correctly
3. Verify that your metro.config.js and babel.config.js files are set up correctly
4. Look for any errors in the console logs

For more detailed information, refer to the [Coinbase Onramp SDK documentation](https://github.com/echirinos/coinbase-onramp-react-native-sdk).
