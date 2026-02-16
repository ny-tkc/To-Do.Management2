import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Global error handler to show uncaught errors on screen
window.onerror = (message, source, lineno, colno) => {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#dc2626;color:white;padding:16px;z-index:99999;font-size:12px;word-break:break-all;';
  errorDiv.textContent = `Error: ${message} at ${source}:${lineno}:${colno}`;
  document.body.appendChild(errorDiv);
};

window.addEventListener('unhandledrejection', (event) => {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#dc2626;color:white;padding:16px;z-index:99999;font-size:12px;word-break:break-all;';
  errorDiv.textContent = `Unhandled Promise: ${event.reason}`;
  document.body.appendChild(errorDiv);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
