import './shim';
import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from './App';

// Register the app with the name matching the app.json name
AppRegistry.registerComponent('coinbase-npm-tester', () => App);

// Also register with 'main' for Expo compatibility
AppRegistry.registerComponent('main', () => App);

// Use Expo's registerRootComponent for additional compatibility
registerRootComponent(App);
