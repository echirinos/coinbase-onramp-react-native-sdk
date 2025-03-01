import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TextInput,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import * as CoinbaseOnramp from "coinbase-onramp-react-native-sdk";

export default function App() {
  const [appId, setAppId] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [options, setOptions] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [oneClickUrl, setOneClickUrl] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prevLogs) => [
      ...prevLogs,
      `${new Date().toISOString()}: ${message}`,
    ]);
  };

  const handleInitialize = async () => {
    if (!appId) {
      Alert.alert("Error", "Please enter your App ID");
      return;
    }

    try {
      addLog("Initializing SDK...");
      await CoinbaseOnramp.initialize(appId);
      setInitialized(true);
      addLog("SDK initialized successfully");
    } catch (error) {
      addLog(`Initialization error: ${error}`);
      Alert.alert("Error", `Failed to initialize: ${error}`);
    }
  };

  const checkInitialized = async () => {
    try {
      const isInit = await CoinbaseOnramp.isInitialized();
      addLog(`Is SDK initialized: ${isInit}`);
      Alert.alert("Status", `SDK initialized: ${isInit}`);
    } catch (error) {
      addLog(`Check initialization error: ${error}`);
      Alert.alert("Error", `Failed to check initialization: ${error}`);
    }
  };

  const getSDKConfig = async () => {
    try {
      addLog("Getting SDK config...");
      const config = await CoinbaseOnramp.getConfig();
      setConfig(config);
      addLog(`Got config: ${JSON.stringify(config)}`);
    } catch (error) {
      addLog(`Get config error: ${error}`);
      Alert.alert("Error", `Failed to get config: ${error}`);
    }
  };

  const getSDKOptions = async () => {
    try {
      addLog("Getting SDK options...");
      const options = await CoinbaseOnramp.getOptions();
      setOptions(options);
      addLog(`Got options: ${JSON.stringify(options)}`);
    } catch (error) {
      addLog(`Get options error: ${error}`);
      Alert.alert("Error", `Failed to get options: ${error}`);
    }
  };

  const getSDKQuote = async () => {
    try {
      addLog("Getting quote...");
      const quote = await CoinbaseOnramp.getQuote();
      setQuote(quote);
      addLog(`Got quote: ${JSON.stringify(quote)}`);
    } catch (error) {
      addLog(`Get quote error: ${error}`);
      Alert.alert("Error", `Failed to get quote: ${error}`);
    }
  };

  const createSDKSessionToken = async () => {
    try {
      addLog("Creating session token...");
      const token = await CoinbaseOnramp.createSessionToken();
      setSessionToken(token);
      addLog(`Got session token: ${token}`);
    } catch (error) {
      addLog(`Create session token error: ${error}`);
      Alert.alert("Error", `Failed to create session token: ${error}`);
    }
  };

  const startSDKPurchase = async () => {
    try {
      addLog("Starting purchase...");
      await CoinbaseOnramp.startPurchase();
      addLog("Purchase flow initiated");
    } catch (error) {
      addLog(`Start purchase error: ${error}`);
      Alert.alert("Error", `Failed to start purchase: ${error}`);
    }
  };

  const generateSDKOneClickBuyUrl = async () => {
    try {
      addLog("Generating one-click buy URL...");
      const url = await CoinbaseOnramp.generateOneClickBuyUrl();
      setOneClickUrl(url);
      addLog(`Got one-click buy URL: ${url}`);
    } catch (error) {
      addLog(`Generate one-click buy URL error: ${error}`);
      Alert.alert("Error", `Failed to generate one-click buy URL: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Coinbase Onramp SDK Tester</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>App ID:</Text>
          <TextInput
            style={styles.input}
            value={appId}
            onChangeText={setAppId}
            placeholder="Enter your Coinbase App ID"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Initialize SDK" onPress={handleInitialize} />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Check Initialized" onPress={checkInitialized} />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Get Config" onPress={getSDKConfig} />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Get Options" onPress={getSDKOptions} />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Get Quote" onPress={getSDKQuote} />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Create Session Token"
            onPress={createSDKSessionToken}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Start Purchase" onPress={startSDKPurchase} />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Generate One-Click Buy URL"
            onPress={generateSDKOneClickBuyUrl}
          />
        </View>

        {config && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Config:</Text>
            <Text style={styles.resultText}>
              {JSON.stringify(config, null, 2)}
            </Text>
          </View>
        )}

        {options && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Options:</Text>
            <Text style={styles.resultText}>
              {JSON.stringify(options, null, 2)}
            </Text>
          </View>
        )}

        {quote && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Quote:</Text>
            <Text style={styles.resultText}>
              {JSON.stringify(quote, null, 2)}
            </Text>
          </View>
        )}

        {sessionToken && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Session Token:</Text>
            <Text style={styles.resultText}>{sessionToken}</Text>
          </View>
        )}

        {oneClickUrl && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>One-Click Buy URL:</Text>
            <Text style={styles.resultText}>{oneClickUrl}</Text>
          </View>
        )}

        <View style={styles.logsContainer}>
          <Text style={styles.resultTitle}>Logs:</Text>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
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
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  buttonContainer: {
    marginBottom: 10,
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
  },
  logText: {
    fontSize: 12,
    marginBottom: 3,
  },
});
