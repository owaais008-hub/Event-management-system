import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './tailwind.css'
import './index.css'
import axios from 'axios'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Set axios defaults with better error handling
try {
  // Determine backend URL:
  // 1. Use VITE_BACKEND_URL if provided (e.g., for external API or specific dev setup)
  // 2. In development, default to http://localhost:5000
  // 3. In production (e.g., Vercel), default to the current origin for serverless functions
  const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);
  axios.defaults.baseURL = backendUrl;
  axios.defaults.withCredentials = true;

  // Add request interceptor for logging
  if (import.meta.env.DEV) {
    axios.interceptors.request.use(request => {
      console.log('🚀 Axios Request:', {
        url: request.url,
        method: request.method,
        baseURL: request.baseURL,
        headers: request.headers
      });
      return request;
    });
  }

  // Add response interceptor for better error handling
  axios.interceptors.response.use(
    response => response,
    error => {
      console.error('❌ Axios Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message
      });
      return Promise.reject(error);
    }
  );
} catch (error) {
  console.warn('⚠️ Failed to configure axios defaults:', error);
}

// Ensure theme is applied immediately on app bootstrap
function applyThemeFromStorage() {
  try {
    const root = document.documentElement;
    const body = document.body;

    // Get theme from localStorage or default to light
    const storedTheme = localStorage.getItem('theme');
    const theme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';

    if (theme === 'dark') {
      root.classList.add('dark');
      body && body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body && body.classList.remove('dark');
    }

    // expose for debugging in dev mode only
    if (import.meta.env.DEV) {
      window.theme = {
        get: () => localStorage.getItem('theme'),
        set: (next) => { localStorage.setItem('theme', next); applyThemeFromStorage(); }
      };
    }
  } catch (error) {
    console.warn('⚠️ Failed to apply theme from storage:', error);
  }
}

// Apply theme before rendering
applyThemeFromStorage();

// Add performance monitoring (dev mode only)
if (import.meta.env.DEV && 'performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('📊 App Performance Metrics:', {
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        redirectCount: perfData.redirectCount
      });
    }, 0);
  });
}

// Error boundary for the entire app
window.addEventListener('error', (event) => {
  console.error('💥 Global Error:', event.error || event.message || 'Unknown error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 Unhandled Promise Rejection:', event.reason);
});

// Render the app
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} else {
  console.error('❌ Root element not found. Cannot render app.');
}