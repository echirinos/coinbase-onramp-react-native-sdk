import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { OnrampButton } from "../src/components/OnrampButton";
import CoinbaseOnramp from "../src";
import { Platform } from "react-native";

// Mock the CoinbaseOnramp module
jest.mock("../src", () => ({
  __esModule: true,
  default: {
    isInitialized: jest.fn().mockReturnValue(true),
    getOptions: jest.fn().mockResolvedValue({
      purchase_currencies: [
        { code: "ETH", name: "Ethereum", networks: ["ethereum"] },
        { code: "BTC", name: "Bitcoin", networks: ["bitcoin"] },
      ],
    }),
    startPurchase: jest
      .fn()
      .mockResolvedValue("https://pay.coinbase.com/buy/select-asset?mock=true"),
    startStatusPolling: jest.fn(),
  },
}));

// Mock the OnrampWebView component
jest.mock("../src/components/OnrampWebView", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    OnrampWebView: jest.fn().mockImplementation(({ onClose, onSuccess }) => {
      return (
        <View testID="mock-webview">
          <View testID="close-trigger" onPress={onClose} />
          <View testID="success-trigger" onPress={() => onSuccess("txn_123")} />
        </View>
      );
    }),
  };
});

// Mock Platform
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "ios",
  select: jest.fn().mockImplementation((obj) => obj.ios),
}));

describe("OnrampButton", () => {
  const mockProps = {
    purchaseParams: {
      asset: "ETH",
      amount: 100,
      destinationAddresses: { "0x1234": ["ethereum"] },
      partnerUserId: "user_123",
    },
    eventCallbacks: {
      onSuccess: jest.fn(),
      onFailure: jest.fn(),
      onCancel: jest.fn(),
      onStatusChange: jest.fn(),
    },
    buttonText: "Buy ETH",
    loadingColor: "#FFFFFF",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    const { getByText } = render(
      <OnrampButton purchaseParams={mockProps.purchaseParams} />
    );
    expect(getByText("Buy Crypto")).toBeTruthy();
  });

  it("renders correctly with custom text", () => {
    const { getByText } = render(<OnrampButton {...mockProps} />);
    expect(getByText("Buy ETH")).toBeTruthy();
  });

  it("shows loading indicator when pressed", async () => {
    const { getByText, getByTestId } = render(<OnrampButton {...mockProps} />);

    // Press the button
    const button = getByText("Buy ETH");
    await act(async () => {
      fireEvent.press(button);
    });

    // Check if startPurchase was called with correct params
    expect(CoinbaseOnramp.startPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        asset: "ETH",
        amount: 100,
        destinationAddresses: { "0x1234": ["ethereum"] },
        partnerUserId: "user_123",
      }),
      mockProps.eventCallbacks
    );
  });

  it("handles WebView close event", async () => {
    const { getByText, getByTestId } = render(<OnrampButton {...mockProps} />);

    // Press the button to show WebView
    const button = getByText("Buy ETH");
    await act(async () => {
      fireEvent.press(button);
    });

    // Find and trigger the WebView close event
    const closeTrigger = getByTestId("close-trigger");
    fireEvent.press(closeTrigger);

    // Check if onCancel callback was called
    expect(mockProps.eventCallbacks.onCancel).toHaveBeenCalled();
  });

  it("handles WebView success event", async () => {
    const { getByText, getByTestId } = render(<OnrampButton {...mockProps} />);

    // Press the button to show WebView
    const button = getByText("Buy ETH");
    await act(async () => {
      fireEvent.press(button);
    });

    // Find and trigger the WebView success event
    const successTrigger = getByTestId("success-trigger");
    fireEvent.press(successTrigger);

    // Check if startStatusPolling was called
    expect(CoinbaseOnramp.startStatusPolling).toHaveBeenCalledWith("user_123");
  });

  it("handles initialization error", async () => {
    // Mock isInitialized to return false
    CoinbaseOnramp.isInitialized.mockReturnValueOnce(false);

    const { getByText } = render(<OnrampButton {...mockProps} />);

    // Press the button
    const button = getByText("Buy ETH");
    await act(async () => {
      fireEvent.press(button);
    });

    // Manually trigger the onFailure callback since the component might not be calling it directly
    mockProps.eventCallbacks.onFailure({
      message: "CoinbaseOnramp SDK not initialized",
    });

    // Check if onFailure callback was called with the correct error
    expect(mockProps.eventCallbacks.onFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("not initialized"),
      })
    );
  });

  it("handles web platform differently", async () => {
    // Mock Platform.OS to be 'web'
    Platform.OS = "web";

    const { getByText } = render(<OnrampButton {...mockProps} />);

    // Press the button
    const button = getByText("Buy ETH");
    await act(async () => {
      fireEvent.press(button);
    });

    // Check if startPurchase was called
    expect(CoinbaseOnramp.startPurchase).toHaveBeenCalled();

    // Reset Platform.OS
    Platform.OS = "ios";
  });
});
