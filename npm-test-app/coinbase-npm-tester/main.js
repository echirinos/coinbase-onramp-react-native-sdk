// Import shim first
import "./shim";

// Import React Native
import { AppRegistry } from "react-native";
import { registerRootComponent } from "expo";

// Import the app
import App from "./App";

// Register the app with both methods
AppRegistry.registerComponent("main", () => App);
AppRegistry.registerComponent("coinbase-npm-tester", () => App);

// Register with Expo
registerRootComponent(App);

// Ensure the app is registered as the default export
export default App;
