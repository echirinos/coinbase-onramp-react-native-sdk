import { CoinbaseOnramp } from './CoinbaseOnramp';
import {
  OnrampConfig,
  PurchaseParams,
  SupportedAsset,
  OnrampTransaction,
  OnrampEventCallback
} from './types';
import { OnrampButton, OnrampWebView } from './components';

export {
  CoinbaseOnramp,
  OnrampConfig,
  PurchaseParams,
  SupportedAsset,
  OnrampTransaction,
  OnrampEventCallback,
  OnrampButton,
  OnrampWebView
};

// Export the singleton instance as default
export default new CoinbaseOnramp();
