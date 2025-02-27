export interface OnrampConfig {
  apiKey: string;
  apiSecret: string;
  environment: 'sandbox' | 'production';
  appId: string;
}

// Session Token Types
export interface Address {
  address: string;
  blockchains: string[];
}

export interface SessionTokenParams {
  addresses: Address[];
  assets?: string[];
}

export interface SessionTokenResponse {
  token: string;
  channel_id?: string;
}

// Config API Types
export interface CountryPaymentMethod {
  type: string;
  min_amount?: number;
  max_amount?: number;
}

export interface Country {
  payment_methods: CountryPaymentMethod[];
  states?: string[]; // US only
}

export interface CountriesConfig {
  countries: Record<string, Country>;
}

// Options API Types
export interface PaymentMethod {
  id: string;
  name: string;
  min_purchase_amount: number;
  max_purchase_amount: number;
}

export interface PaymentCurrency {
  code: string;
  name: string;
  payment_methods: PaymentMethod[];
}

export interface PurchaseCurrency {
  code: string;
  name: string;
  networks: string[];
  min_purchase_amount?: number;
  max_purchase_amount?: number;
}

export interface OnrampOptions {
  payment_currencies: PaymentCurrency[];
  purchase_currencies: PurchaseCurrency[];
}

// Quote API Types
export interface QuoteParams {
  purchase_currency: string;
  purchase_network?: string;
  payment_amount: string;
  payment_currency: string;
  payment_method: string;
  country: string;
  subdivision?: string;
}

export interface AmountObject {
  amount: string;
  currency: string;
}

export interface OnrampQuote {
  payment_total: AmountObject;
  payment_subtotal: AmountObject;
  purchase_amount: AmountObject;
  coinbase_fee: AmountObject;
  network_fee: AmountObject;
  quote_id: string;
}

// Transaction Types
export interface OnrampTransaction {
  status: 'ONRAMP_TRANSACTION_STATUS_IN_PROGRESS' | 'ONRAMP_TRANSACTION_STATUS_SUCCESS' | 'ONRAMP_TRANSACTION_STATUS_FAILED';
  purchase_currency: string;
  purchase_network: string;
  purchase_amount: string;
  payment_total: string;
  payment_subtotal: string;
  coinbase_fee: string;
  network_fee: string;
  exchange_rate: string;
  country: string;
  user_id: string;
  payment_method: 'CARD' | 'ACH_BANK_ACCOUNT' | 'APPLE_PAY' | 'FIAT_WALLET' | 'CRYPTO_WALLET';
  tx_hash?: string;
  transaction_id: string;
  wallet_address: string;
  type: 'ONRAMP_TRANSACTION_TYPE_BUY_AND_SEND' | 'ONRAMP_TRANSACTION_TYPE_SEND';
}

export interface TransactionStatusParams {
  page_key?: string;
  page_size?: number;
}

// Legacy/Simplified Types for SDK Interface
export interface SupportedAsset {
  code: string;  // e.g., "BTC", "ETH"
  name: string;  // e.g., "Bitcoin", "Ethereum"
  displaySymbol?: string; // e.g., "₿", "Ξ"
  networks: string[];
  minPurchaseAmount?: number;
  maxPurchaseAmount?: number;
}

export interface PurchaseParams {
  asset: string;
  network?: string;
  amount: number;
  destinationAddresses: Record<string, string[]>;
  fiatCurrency?: string;
  paymentMethod?: string;
  partnerUserId?: string;
  redirectUrl?: string;
}

export interface OnrampEventCallback {
  onSuccess?: (transaction: OnrampTransaction) => void;
  onFailure?: (error: Error) => void;
  onCancel?: () => void;
  onStatusChange?: (status: string) => void;
}
