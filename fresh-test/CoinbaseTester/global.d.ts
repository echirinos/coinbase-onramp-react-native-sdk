import ErrorBoundary from './components/ErrorBoundary';

declare global {
  var ErrorBoundary: typeof ErrorBoundary;

  // Add any other global types here
  interface Window {
    ErrorBoundary: typeof ErrorBoundary;
  }
}

export {};
