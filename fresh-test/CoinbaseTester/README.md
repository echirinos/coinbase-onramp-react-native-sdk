# Coinbase Onramp React Native Tester

A React Native application for testing the Coinbase Onramp SDK and direct URL integration.

## Features

- Basic Example: Test the Coinbase Onramp SDK with pre-populated parameters and dropdown selectors
- One-Click Buy: Test the one-click buy flow with the Coinbase Onramp SDK
- Direct URL: Generate and test direct URLs for the Coinbase Onramp flow without using the SDK
- WebView integration for handling Onramp flows

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Expo CLI
- A Coinbase Onramp App ID

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and add your Coinbase App ID:
   ```
   cp .env.example .env
   ```
4. Start the Expo development server:
   ```
   npx expo start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
COINBASE_APP_ID=your_app_id_here
DEFAULT_WALLET_ADDRESS=your_wallet_address_here
```

## Usage

- **Basic Example**: Test the basic Coinbase Onramp SDK integration with pre-populated parameters
- **One-Click Buy**: Test the one-click buy flow with the Coinbase Onramp SDK
- **Direct URL**: Generate and test direct URLs for the Coinbase Onramp flow without using the SDK

## Troubleshooting

If you encounter issues with the crypto polyfills or ErrorBoundary, check the following files:

- `pre-init.js`: Sets up temporary global objects
- `global-init.js`: Initializes global objects
- `shim.js`: Provides crypto polyfills
- `index.js`: Main entry point that imports initialization files

## License

This project is licensed under the MIT License - see the LICENSE file for details.
