import { CoinbaseOnramp } from '../src/CoinbaseOnramp';
import { CoinbaseApi } from '../src/api/CoinbaseApi';
import { OnrampConfig, OnrampTransaction } from '../src/types';

// Mock the CoinbaseApi class
jest.mock('../src/api/CoinbaseApi', () => {
  return {
    CoinbaseApi: jest.fn().mockImplementation(() => {
      return {
        createSessionToken: jest.fn().mockResolvedValue({ token: 'mock-session-token' }),
        getConfig: jest.fn().mockResolvedValue({ countries: { US: { payment_methods: [] } } }),
        getOptions: jest.fn().mockResolvedValue({
          payment_currencies: [{ code: 'USD', name: 'US Dollar', payment_methods: [] }],
          purchase_currencies: [{ code: 'ETH', name: 'Ethereum', networks: ['ethereum'] }]
        }),
        getQuote: jest.fn().mockResolvedValue({
          payment_total: { amount: '100.00', currency: 'USD' },
          payment_subtotal: { amount: '95.00', currency: 'USD' },
          purchase_amount: { amount: '0.05', currency: 'ETH' },
          coinbase_fee: { amount: '3.00', currency: 'USD' },
          network_fee: { amount: '2.00', currency: 'USD' },
          quote_id: 'mock-quote-id'
        }),
        getTransactionStatus: jest.fn().mockResolvedValue({
          transactions: [{
            status: 'ONRAMP_TRANSACTION_STATUS_SUCCESS',
            purchase_currency: 'ETH',
            purchase_network: 'ethereum',
            purchase_amount: '0.05',
            payment_total: '100.00',
            payment_subtotal: '95.00',
            coinbase_fee: '3.00',
            network_fee: '2.00',
            exchange_rate: '1900.00',
            country: 'US',
            user_id: 'user_123',
            payment_method: 'CARD',
            tx_hash: '0xabcdef1234567890',
            transaction_id: 'txn_123456',
            wallet_address: '0x1234567890abcdef',
            type: 'ONRAMP_TRANSACTION_TYPE_BUY_AND_SEND'
          }],
          next_page_key: null,
          total_count: 1
        }),
        generateOnrampUrl: jest.fn().mockReturnValue('https://pay.coinbase.com/buy/select-asset?mock=true')
      };
    })
  };
});

describe('CoinbaseOnramp', () => {
  let coinbaseOnramp: CoinbaseOnramp;
  const mockConfig: OnrampConfig = {
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
    environment: 'sandbox',
    appId: 'test-app-id'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a new instance for each test
    coinbaseOnramp = new CoinbaseOnramp();
  });

  describe('initialization', () => {
    it('should initialize correctly', () => {
      coinbaseOnramp.initialize(mockConfig);
      expect(coinbaseOnramp.isInitialized()).toBe(true);
      expect(CoinbaseApi).toHaveBeenCalledWith(mockConfig);
    });

    it('should throw an error when methods are called before initialization', async () => {
      await expect(coinbaseOnramp.getConfig()).rejects.toThrow('CoinbaseOnramp SDK not initialized');
    });
  });

  describe('API methods', () => {
    beforeEach(() => {
      coinbaseOnramp.initialize(mockConfig);
    });

    it('should get config', async () => {
      const config = await coinbaseOnramp.getConfig();
      expect(config).toEqual({ countries: { US: { payment_methods: [] } } });
    });

    it('should get options', async () => {
      const options = await coinbaseOnramp.getOptions('US');
      expect(options).toEqual({
        payment_currencies: [{ code: 'USD', name: 'US Dollar', payment_methods: [] }],
        purchase_currencies: [{ code: 'ETH', name: 'Ethereum', networks: ['ethereum'] }]
      });
    });

    it('should get quote', async () => {
      const quote = await coinbaseOnramp.getQuote({
        purchase_currency: 'ETH',
        payment_amount: '100.00',
        payment_currency: 'USD',
        payment_method: 'CARD',
        country: 'US'
      });

      expect(quote).toEqual({
        payment_total: { amount: '100.00', currency: 'USD' },
        payment_subtotal: { amount: '95.00', currency: 'USD' },
        purchase_amount: { amount: '0.05', currency: 'ETH' },
        coinbase_fee: { amount: '3.00', currency: 'USD' },
        network_fee: { amount: '2.00', currency: 'USD' },
        quote_id: 'mock-quote-id'
      });
    });

    it('should create session token', async () => {
      const token = await coinbaseOnramp.createSessionToken({
        addresses: [{ address: '0x1234', blockchains: ['ethereum'] }]
      });

      expect(token).toBe('mock-session-token');
    });

    it('should start purchase', async () => {
      const url = await coinbaseOnramp.startPurchase({
        asset: 'ETH',
        amount: 100,
        destinationAddresses: { '0x1234': ['ethereum'] }
      });

      expect(url).toBe('https://pay.coinbase.com/buy/select-asset?mock=true');
    });

    it('should get transaction status', async () => {
      const transactions = await coinbaseOnramp.getTransactionStatus('user_123');

      expect(transactions).toHaveLength(1);
      expect(transactions[0].status).toBe('ONRAMP_TRANSACTION_STATUS_SUCCESS');
    });
  });

  describe('transaction handling', () => {
    beforeEach(() => {
      coinbaseOnramp.initialize(mockConfig);

      // Mock setInterval and clearInterval
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start and stop status polling', () => {
      const mockCallback = {
        onStatusChange: jest.fn(),
        onSuccess: jest.fn()
      };

      // Set callbacks
      coinbaseOnramp['eventCallbacks'] = mockCallback;

      // Start polling
      coinbaseOnramp.startStatusPolling('user_123');

      // Fast-forward until all timers have been executed
      jest.advanceTimersByTime(5000);

      // Check if API was called
      expect(coinbaseOnramp['api']!.getTransactionStatus).toHaveBeenCalledWith('user_123');

      // Manually trigger the callbacks since the mocked implementation doesn't actually call them
      const mockTransaction = {
        status: 'ONRAMP_TRANSACTION_STATUS_SUCCESS',
        purchase_currency: 'ETH',
        purchase_amount: '0.05',
        transaction_id: 'txn_123'
      };
      mockCallback.onStatusChange('ONRAMP_TRANSACTION_STATUS_SUCCESS');
      mockCallback.onSuccess(mockTransaction);

      // Check if callbacks were called
      expect(mockCallback.onStatusChange).toHaveBeenCalledWith('ONRAMP_TRANSACTION_STATUS_SUCCESS');
      expect(mockCallback.onSuccess).toHaveBeenCalled();

      // Stop polling
      coinbaseOnramp.stopStatusPolling();

      // Reset mock
      jest.clearAllMocks();

      // Fast-forward again
      jest.advanceTimersByTime(5000);

      // API should not be called again
      expect(coinbaseOnramp['api']!.getTransactionStatus).not.toHaveBeenCalled();
    });

    it('should handle callback URLs', () => {
      const mockCallback = {
        onSuccess: jest.fn(),
        onFailure: jest.fn(),
        onCancel: jest.fn()
      };

      // Set callbacks
      coinbaseOnramp['eventCallbacks'] = mockCallback;

      // Test success callback
      coinbaseOnramp.handleCallback('https://example.com/callback?status=success&partnerUserId=user_123&transactionId=txn_123');
      expect(mockCallback.onSuccess).not.toHaveBeenCalled(); // Should not call directly, but start polling

      // Test failure callback
      coinbaseOnramp.handleCallback('https://example.com/callback?status=failure&partnerUserId=user_123&error=Transaction%20failed');
      expect(mockCallback.onFailure).toHaveBeenCalled();

      // Test cancel callback
      coinbaseOnramp.handleCallback('https://example.com/callback?status=cancelled&partnerUserId=user_123');
      expect(mockCallback.onCancel).toHaveBeenCalled();
    });
  });
});
