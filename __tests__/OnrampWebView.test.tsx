import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { OnrampWebView } from "../src/components/OnrampWebView";
import { WebView } from "react-native-webview";
import CoinbaseOnramp from "../src";

// Mock the WebView component
jest.mock("react-native-webview", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    WebView: jest
      .fn()
      .mockImplementation(({ onNavigationStateChange, onMessage, source }) => {
        return (
          <View testID="mock-webview">
            <View
              testID="navigation-trigger"
              onPress={() => {
                onNavigationStateChange({
                  url: "https://example.com/callback?status=success&transactionId=123",
                  loading: false,
                  canGoBack: true,
                });
              }}
            />
            <View
              testID="message-trigger"
              onPress={() => {
                onMessage({
                  nativeEvent: {
                    data: JSON.stringify({
                      type: "transaction_complete",
                      status: "success",
                    }),
                  },
                });
              }}
            />
          </View>
        );
      }),
  };
});

// Mock the CoinbaseOnramp module
jest.mock("../src", () => ({
  __esModule: true,
  default: {
    handleCallback: jest.fn(),
  },
}));

describe("OnrampWebView", () => {
  const mockProps = {
    sessionUrl: "https://pay.coinbase.com/buy/select-asset?mock=true",
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    onFailure: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByTestId } = render(<OnrampWebView {...mockProps} />);
    expect(getByTestId("mock-webview")).toBeTruthy();
  });

  it("passes the correct props to WebView", () => {
    render(<OnrampWebView {...mockProps} />);
    expect(WebView).toHaveBeenCalledWith(
      expect.objectContaining({
        source: { uri: mockProps.sessionUrl },
        javaScriptEnabled: true,
        domStorageEnabled: true,
        startInLoadingState: true,
      }),
      expect.anything()
    );
  });

  it("handles navigation state changes for callbacks", () => {
    const { getByTestId } = render(<OnrampWebView {...mockProps} />);

    // Simulate a navigation state change
    const navigationTrigger = getByTestId("navigation-trigger");
    fireEvent.press(navigationTrigger);

    // Check if the SDK's handleCallback was called
    expect(CoinbaseOnramp.handleCallback).toHaveBeenCalledWith(
      "https://example.com/callback?status=success&transactionId=123"
    );

    // Check if onSuccess was called
    expect(mockProps.onSuccess).toHaveBeenCalledWith("123");

    // Check if onClose was called
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it("handles WebView messages for transaction completion", () => {
    const { getByTestId } = render(<OnrampWebView {...mockProps} />);

    // Simulate a message from the WebView
    const messageTrigger = getByTestId("message-trigger");
    fireEvent.press(messageTrigger);

    // Check if onSuccess was called
    expect(mockProps.onSuccess).toHaveBeenCalledWith("pending");

    // Check if onClose was called
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});
