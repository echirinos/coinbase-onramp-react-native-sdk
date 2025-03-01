// Import shim first to ensure crypto is available
import "./shim";

// Import React
import React from "react";
import { AppRegistry } from "react-native";

// Import the ExpoRoot component from expo-router
import { ExpoRoot } from "expo-router";

// Create the root component
const App = () => {
  return <ExpoRoot context={require.context("./app")} />;
};

// Register the main component explicitly
AppRegistry.registerComponent("main", () => App);

// Also register with Expo's registerRootComponent for compatibility
import { registerRootComponent } from "expo";
registerRootComponent(App);
