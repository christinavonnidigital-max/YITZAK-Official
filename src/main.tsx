// Ensure window.fetch is writable and configurable in all environments
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  try {
    const nativeFetch = window.fetch.bind(window);
    Object.defineProperty(window, 'fetch', {
      value: nativeFetch,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch (_e) {
    // Non-fatal if already configured
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

