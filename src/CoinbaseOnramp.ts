import { CoinbaseApi } from './api/CoinbaseApi';
import {
  OnrampConfig,
  PurchaseParams,
  SupportedAsset,
  OnrampEventCallback,
  OnrampTransaction,
  CountriesConfig,
  OnrampOptions,
  QuoteParams,
  OnrampQuote,
  SessionTokenParams
} from './types';

export class CoinbaseOnramp {
  private api: CoinbaseApi | null = null;
  private initialized = false;
  private config: OnrampConfig | null = null;
  private activeTransaction: string | null = null;
  private statusPollingInterval: NodeJS.Timeout | null = null;
  private eventCallbacks: OnrampEventCallback = {};

  /**
   * Initialize the SDK with your Coinbase API credentials
   */
  initialize(config: OnrampConfig): void {
    this.api = new CoinbaseApi(config);
    this.config = config;
    this.initialized = true;
  }

  /**
   * Check if the SDK has been initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get supported countries and payment methods
   */
  async getConfig(): Promise<CountriesConfig> {
    this.checkInitialization();
    return this.api!.getConfig();
  }

  /**
   * Get supported fiat currencies and available crypto assets
   */
  async getOptions(country: string, subdivision?: string): Promise<OnrampOptions> {
    this.checkInitialization();
    return this.api!.getOptions(country, subdivision);
  }

  /**
   * Get a quote for a cryptocurrency purchase
   */
  async getQuote(params: QuoteParams): Promise<OnrampQuote> {
    this.checkInitialization();
    return this.api!.getQuote(params);
  }

  /**
   * Create a session token for secure authentication
   */
  async createSessionToken(params: SessionTokenParams): Promise<string> {
    this.checkInitialization();
    const response = await this.api!.createSessionToken(params);
    return response.token;
  }

  /**
   * Start the cryptocurrency purchase flow by generating an Onramp URL
   */
  async startPurchase(
    params: PurchaseParams,
    callbacks?: OnrampEventCallback
  ): Promise<string> {
    this.checkInitialization();

    // Save callbacks for later use
    if (callbacks) {
      this.eventCallbacks = callbacks;
    }

    // If we don't have a quote ID, we'll need to generate a basic URL
    const urlParams: any = {
      appId: this.config!.appId,
      addresses: params.destinationAddresses
    };

    // Add optional parameters if provided
    if (params.asset) urlParams.defaultAsset = params.asset;
    if (params.network) urlParams.defaultNetwork = params.network;
    if (params.fiatCurrency) urlParams.fiatCurrency = params.fiatCurrency;
    if (params.paymentMethod) urlParams.defaultPaymentMethod = params.paymentMethod;
    if (params.amount) urlParams.presetFiatAmount = params.amount;
    if (params.partnerUserId) urlParams.partnerUserId = params.partnerUserId;
    if (params.redirectUrl) urlParams.redirectUrl = params.redirectUrl;

    // Generate and return the URL
    return this.api!.generateOnrampUrl(urlParams);
  }

  /**
   * Generate a one-click-buy URL with a quote
   */
  async generateOneClickBuyUrl(
    quoteId: string,
    presetFiatAmount: number,
    fiatCurrency: string,
    defaultAsset: string,
    defaultPaymentMethod: string,
    addresses: Record<string, string[]>,
    defaultNetwork?: string
  ): Promise<string> {
    this.checkInitialization();

    return this.api!.generateOnrampUrl({
      appId: this.config!.appId,
      addresses,
      quoteId,
      presetFiatAmount,
      fiatCurrency,
      defaultAsset,
      defaultPaymentMethod,
      defaultNetwork
    });
  }

  /**
   * Get transaction status for a specific user
   */
  async getTransactionStatus(partnerUserId: string): Promise<OnrampTransaction[]> {
    this.checkInitialization();
    const response = await this.api!.getTransactionStatus(partnerUserId);
    return response.transactions;
  }

  /**
   * Start polling for transaction status updates
   */
  startStatusPolling(partnerUserId: string): void {
    this.activeTransaction = partnerUserId;

    // Poll every 5 seconds
    this.statusPollingInterval = setInterval(async () => {
      try {
        const response = await this.api!.getTransactionStatus(partnerUserId);

        if (response.transactions.length > 0) {
          const latestTransaction = response.transactions[0];

          // Call the status change callback
          if (this.eventCallbacks.onStatusChange) {
            this.eventCallbacks.onStatusChange(latestTransaction.status);
          }

          // Handle completion events
          if (latestTransaction.status === 'ONRAMP_TRANSACTION_STATUS_SUCCESS' && this.eventCallbacks.onSuccess) {
            this.eventCallbacks.onSuccess(latestTransaction);
            this.stopStatusPolling();
          } else if (latestTransaction.status === 'ONRAMP_TRANSACTION_STATUS_FAILED' && this.eventCallbacks.onFailure) {
            this.eventCallbacks.onFailure(new Error('Transaction failed'));
            this.stopStatusPolling();
          }
        }
      } catch (error) {
        console.error('Error polling transaction status:', error);
      }
    }, 5000);
  }

  /**
   * Stop polling for transaction status updates
   */
  stopStatusPolling(): void {
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
      this.statusPollingInterval = null;
    }
    this.activeTransaction = null;
  }

  /**
   * Handle a callback from the Coinbase Onramp flow
   */
  handleCallback(url: string): void {
    // Parse callback URL to extract transaction data
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    const status = params.get('status');
    const transactionId = params.get('transactionId');
    const partnerUserId = params.get('partnerUserId');

    if (status && partnerUserId) {
      if (status === 'success' && this.eventCallbacks.onSuccess) {
        // Start polling for status updates
        this.startStatusPolling(partnerUserId);
      } else if (status === 'failure' && this.eventCallbacks.onFailure) {
        const errorMsg = params.get('error') || 'Unknown error';
        this.eventCallbacks.onFailure(new Error(errorMsg));
      } else if (status === 'cancelled' && this.eventCallbacks.onCancel) {
        this.eventCallbacks.onCancel();
      }
    }
  }

  /**
   * Verify that the SDK has been initialized
   */
  private checkInitialization(): void {
    if (!this.initialized || !this.api) {
      throw new Error('CoinbaseOnramp SDK not initialized. Call initialize() first.');
    }
  }
}
