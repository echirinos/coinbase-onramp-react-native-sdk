import axios, { AxiosInstance } from 'axios';
import { createHmac } from 'crypto';
import {
  OnrampConfig,
  SupportedAsset,
  PurchaseParams,
  CountriesConfig,
  OnrampOptions,
  QuoteParams,
  OnrampQuote,
  TransactionStatusParams,
  OnrampTransaction,
  SessionTokenParams,
  SessionTokenResponse
} from '../types';

export class CoinbaseApi {
  private axiosInstance: AxiosInstance;
  private config: OnrampConfig;
  private baseUrls = {
    sandbox: 'https://api.developer.coinbase.com/onramp/v1',
    production: 'https://api.developer.coinbase.com/onramp/v1'
  };

  constructor(config: OnrampConfig) {
    this.config = config;

    this.axiosInstance = axios.create({
      baseURL: this.baseUrls[config.environment],
      headers: {
        'Content-Type': 'application/json',
        'CB-ACCESS-KEY': config.apiKey,
        'CB-VERSION': '2023-05-12',
      }
    });

    // Add request interceptor for authentication (CDP API key authentication)
    this.axiosInstance.interceptors.request.use(request => {
      if (request.method && request.url) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const message = `${timestamp}${request.method.toUpperCase()}${request.url}${JSON.stringify(request.data || '')}`;

        const signature = createHmac('sha256', this.config.apiSecret)
          .update(message)
          .digest('hex');

        request.headers['CB-ACCESS-TIMESTAMP'] = timestamp;
        request.headers['CB-ACCESS-SIGN'] = signature;
      }

      return request;
    });
  }

  /**
   * Create a session token for securely authenticating users
   */
  async createSessionToken(params: SessionTokenParams): Promise<SessionTokenResponse> {
    try {
      const response = await this.axiosInstance.post('/token', params);
      return response.data;
    } catch (error) {
      console.error('Error creating session token:', error);
      throw error;
    }
  }

  /**
   * Get supported countries and payment methods
   */
  async getConfig(): Promise<CountriesConfig> {
    try {
      const response = await this.axiosInstance.get('/buy/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching config:', error);
      throw error;
    }
  }

  /**
   * Get supported fiat currencies and available crypto assets
   */
  async getOptions(country: string, subdivision?: string): Promise<OnrampOptions> {
    try {
      const url = `/buy/options?country=${country}${subdivision ? `&subdivision=${subdivision}` : ''}`;
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching options:', error);
      throw error;
    }
  }

  /**
   * Get a quote for a cryptocurrency purchase
   */
  async getQuote(params: QuoteParams): Promise<OnrampQuote> {
    try {
      const response = await this.axiosInstance.post('/buy/quote', params);
      return response.data;
    } catch (error) {
      console.error('Error getting quote:', error);
      throw error;
    }
  }

  /**
   * Get real-time transaction status for a specific user
   */
  async getTransactionStatus(partnerUserId: string, params?: TransactionStatusParams): Promise<{transactions: OnrampTransaction[], next_page_key?: string, total_count: number}> {
    try {
      let url = `/buy/user/${partnerUserId}/transactions`;

      if (params) {
        const queryParams = new URLSearchParams();
        if (params.page_key) queryParams.append('page_key', params.page_key);
        if (params.page_size) queryParams.append('page_size', params.page_size.toString());

        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }

      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }

  /**
   * Get historical transaction data
   */
  async getTransactions(params: {
    page_key?: string,
    page_size?: number,
    start_date?: string,
    end_date?: string
  }): Promise<{transactions: OnrampTransaction[], next_page_key?: string}> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page_key) queryParams.append('page_key', params.page_key);
      if (params.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const url = `/buy/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Generate an Onramp URL with query parameters
   */
  generateOnrampUrl(params: {
    appId?: string,
    addresses?: Record<string, string[]>,
    assets?: string[],
    defaultNetwork?: string,
    defaultAsset?: string,
    presetCryptoAmount?: number,
    presetFiatAmount?: number,
    defaultExperience?: 'send' | 'buy',
    defaultPaymentMethod?: string,
    fiatCurrency?: string,
    handlingRequestedUrls?: boolean,
    partnerUserId?: string,
    sessionToken?: string,
    redirectUrl?: string,
    quoteId?: string
  }): string {
    // Base URL
    let url = 'https://pay.coinbase.com/buy/select-asset';

    // Add query parameters
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        // Handle special cases for objects and arrays
        if (key === 'addresses' && typeof value === 'object') {
          queryParams.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          queryParams.append(key, JSON.stringify(value));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    // Return full URL
    return `${url}?${queryParams.toString()}`;
  }
}
