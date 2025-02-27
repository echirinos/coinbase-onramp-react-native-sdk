import { CoinbaseApi } from '../src/api/CoinbaseApi';
import axios from 'axios';
import { OnrampConfig } from '../src/types';

// Mock axios
jest.mock('axios', () => {
  return {
    create: jest.fn().mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn()
        }
      }
    })
  };
});

describe('CoinbaseApi', () => {
  let api: CoinbaseApi;
  const mockConfig: OnrampConfig = {
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
    environment: 'sandbox',
    appId: 'test-app-id'
  };

  // Mock axios instance
  const mockAxiosInstance = axios.create();

  beforeEach(() => {
    jest.clearAllMocks();
    api = new CoinbaseApi(mockConfig);
  });

  it('should initialize with correct config', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://api.developer.coinbase.com/onramp/v1',
      headers: {
        'Content-Type': 'application/json',
        'CB-ACCESS-KEY': 'test-api-key',
        'CB-VERSION': '2023-05-12',
      }
    });

    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
  });

  describe('API methods', () => {
    beforeEach(() => {
      // Setup mock responses
      (mockAxiosInstance.get as jest.Mock).mockImplementation((url) => {
        if (url === '/buy/config') {
          return Promise.resolve({ data: { countries: { US: { payment_methods: [] } } } });
        } else if (url.includes('/buy/options')) {
          return Promise.resolve({
            data: {
              payment_currencies: [{ code: 'USD', name: 'US Dollar', payment_methods: [] }],
              purchase_currencies: [{ code: 'ETH', name: 'Ethereum', networks: ['ethereum'] }]
            }
          });
        } else if (url.includes('/buy/user/')) {
          return Promise.resolve({
            data: {
              transactions: [{
                status: 'ONRAMP_TRANSACTION_STATUS_SUCCESS',
                purchase_currency: 'ETH'
              }],
              next_page_key: null,
              total_count: 1
            }
          });
        }
        return Promise.reject(new Error('Not found'));
      });

      (mockAxiosInstance.post as jest.Mock).mockImplementation((url, data) => {
        if (url === '/token') {
          return Promise.resolve({ data: { token: 'mock-session-token' } });
        } else if (url === '/buy/quote') {
          return Promise.resolve({
            data: {
              payment_total: { amount: '100.00', currency: 'USD' },
              quote_id: 'mock-quote-id'
            }
          });
        }
        return Promise.reject(new Error('Not found'));
      });
    });

    it('should create a session token', async () => {
      const params = {
        addresses: [{ address: '0x1234', blockchains: ['ethereum'] }]
      };

      const result = await api.createSessionToken(params);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/token', params);
      expect(result).toEqual({ token: 'mock-session-token' });
    });

    it('should get config', async () => {
      const result = await api.getConfig();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/buy/config');
      expect(result).toEqual({ countries: { US: { payment_methods: [] } } });
    });

    it('should get options', async () => {
      const result = await api.getOptions('US');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/buy/options?country=US');
      expect(result).toEqual({
        payment_currencies: [{ code: 'USD', name: 'US Dollar', payment_methods: [] }],
        purchase_currencies: [{ code: 'ETH', name: 'Ethereum', networks: ['ethereum'] }]
      });
    });

    it('should get options with subdivision', async () => {
      const result = await api.getOptions('US', 'NY');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/buy/options?country=US&subdivision=NY');
      expect(result).toEqual({
        payment_currencies: [{ code: 'USD', name: 'US Dollar', payment_methods: [] }],
        purchase_currencies: [{ code: 'ETH', name: 'Ethereum', networks: ['ethereum'] }]
      });
    });

    it('should get quote', async () => {
      const params = {
        purchase_currency: 'ETH',
        payment_amount: '100.00',
        payment_currency: 'USD',
        payment_method: 'CARD',
        country: 'US'
      };

      const result = await api.getQuote(params);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/buy/quote', params);
      expect(result).toEqual({
        payment_total: { amount: '100.00', currency: 'USD' },
        quote_id: 'mock-quote-id'
      });
    });

    it('should get transaction status', async () => {
      const result = await api.getTransactionStatus('user_123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/buy/user/user_123/transactions');
      expect(result).toEqual({
        transactions: [{
          status: 'ONRAMP_TRANSACTION_STATUS_SUCCESS',
          purchase_currency: 'ETH'
        }],
        next_page_key: null,
        total_count: 1
      });
    });

    it('should get transaction status with pagination', async () => {
      const result = await api.getTransactionStatus('user_123', { page_key: 'next_page', page_size: 10 });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/buy/user/user_123/transactions?page_key=next_page&page_size=10');
      expect(result).toEqual({
        transactions: [{
          status: 'ONRAMP_TRANSACTION_STATUS_SUCCESS',
          purchase_currency: 'ETH'
        }],
        next_page_key: null,
        total_count: 1
      });
    });

    it('should generate an onramp URL', () => {
      const params = {
        appId: 'test-app-id',
        addresses: { '0x1234': ['ethereum'] },
        defaultAsset: 'ETH',
        presetFiatAmount: 100,
        fiatCurrency: 'USD'
      };

      const url = api.generateOnrampUrl(params);

      expect(url).toContain('https://pay.coinbase.com/buy/select-asset?');
      expect(url).toContain('appId=test-app-id');
      expect(url).toContain('addresses=%7B%220x1234%22%3A%5B%22ethereum%22%5D%7D');
      expect(url).toContain('defaultAsset=ETH');
      expect(url).toContain('presetFiatAmount=100');
      expect(url).toContain('fiatCurrency=USD');
    });

    it('should handle API errors', async () => {
      // Mock a failed request
      (mockAxiosInstance.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(api.getConfig()).rejects.toThrow('API Error');
    });
  });
});
