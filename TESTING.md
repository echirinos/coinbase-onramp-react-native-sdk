# Testing the Coinbase Onramp React Native SDK

This document provides guidelines for testing the Coinbase Onramp React Native SDK.

## Running Tests

The SDK uses Jest for testing. You can run the tests using the following npm scripts:

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized in the `__tests__` directory, mirroring the structure of the `src` directory. Each test file corresponds to a source file with the same name but with a `.test.ts` or `.test.tsx` extension.

### Main Test Files

- `CoinbaseOnramp.test.ts` - Tests for the main SDK class
- `CoinbaseApi.test.ts` - Tests for the API client
- `OnrampButton.test.tsx` - Tests for the OnrampButton component
- `OnrampWebView.test.tsx` - Tests for the OnrampWebView component

## Writing Tests

### Testing Components

For React components, we use `@testing-library/react-native` to render and interact with components in a way that resembles how users would use them.

Example:

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { OnrampButton } from '../src/components/OnrampButton';

describe('OnrampButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <OnrampButton
        purchaseParams={{
          asset: 'ETH',
          amount: 100,
          destinationAddresses: { '0x1234': ['ethereum'] }
        }}
      />
    );

    expect(getByText('Buy Crypto')).toBeTruthy();
  });
});
```

### Testing API Classes

For API classes, we mock external dependencies like `axios` to test the behavior without making actual network requests.

Example:

```typescript
import { CoinbaseApi } from '../src/api/CoinbaseApi';
import axios from 'axios';

jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    get: jest.fn(),
    post: jest.fn(),
    interceptors: { request: { use: jest.fn() } }
  })
}));

describe('CoinbaseApi', () => {
  it('should get config', async () => {
    const api = new CoinbaseApi({ /* config */ });
    axios.create().get.mockResolvedValueOnce({ data: { /* mock data */ } });

    const result = await api.getConfig();

    expect(axios.create().get).toHaveBeenCalledWith('/buy/config');
    expect(result).toEqual({ /* expected result */ });
  });
});
```

### Mocking Dependencies

The SDK uses several dependencies that need to be mocked in tests:

1. **axios** - For API requests
2. **react-native-webview** - For the WebView component
3. **crypto** - For HMAC signature generation

These mocks are set up in the `jest.setup.js` file.

## Test Coverage

We aim for high test coverage to ensure the SDK's reliability. Run the coverage report to identify areas that need more testing:

```bash
npm run test:coverage
```

## Debugging Tests

If you encounter issues with tests, you can use the following techniques:

1. **Console Logs**: Add `console.log` statements to your tests to see values during execution.
2. **Debug Mode**: Run Jest in debug mode with `node --inspect-brk node_modules/.bin/jest --runInBand`.
3. **Snapshot Testing**: For components, use snapshot testing to capture and verify the rendered output.

## Continuous Integration

Tests are automatically run in CI to ensure changes don't break existing functionality. Make sure all tests pass before submitting a pull request.

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state from other tests.
2. **Mock External Dependencies**: Always mock external services and APIs.
3. **Test Edge Cases**: Include tests for error conditions and edge cases.
4. **Keep Tests Fast**: Tests should run quickly to provide fast feedback.
5. **Descriptive Test Names**: Use descriptive names that explain what the test is verifying.
