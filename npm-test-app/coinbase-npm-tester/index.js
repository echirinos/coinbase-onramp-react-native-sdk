// Import shim first
import "./shim";

// Import the registerRootComponent function from expo
import { registerRootComponent } from "expo";

// Import the App component
import App from "./App";

// Register the App component as the root component
registerRootComponent(App);
