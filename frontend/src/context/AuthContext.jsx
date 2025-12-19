import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import useSocket from '../hooks/useSocket.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    console.log('🔑 Token loaded from localStorage:', !!storedToken);
    return storedToken;
  });
  
  const [refreshToken, setRefreshToken] = useState(() => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    console.log('🔄 Refresh token loaded from localStorage:', !!storedRefreshToken);
    return storedRefreshToken;
  });
  
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    const userData = u ? JSON.parse(u) : null;
    console.log('👤 User loaded from localStorage:', !!userData);
    return userData;
  });
  
  const [initialSessionChecked, setInitialSessionChecked] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize socket with user ID
  useSocket(window.location.origin, user?.id);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      console.log('🔒 Axios authorization header set');
    } else {
      delete axios.defaults.headers.common.Authorization;
      console.log('🔓 Axios authorization header cleared');
    }
  }, [token]);

  const login = useCallback((data) => {
    console.log('📥 Login called with data:', { hasToken: !!data.token, hasUser: !!data.user });
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Clear any session destroyed flag on login
    sessionStorage.removeItem('sessionDestroyed');
    
    setToken(data.token);
    setRefreshToken(data.refreshToken);
    setUser(data.user);
    
    console.log('✅ Login completed successfully');
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint if we have a token
      if (token) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      // Silently handle logout errors
    } finally {
      // Set session destroyed flag in sessionStorage
      sessionStorage.setItem('sessionDestroyed', 'true');
      
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear axios default headers
      delete axios.defaults.headers.common.Authorization;
      
      // Reset state
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      
      // Clear all cookies
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      });
    }
  }, [token]);

  // Check session validity on app load (only once)
  useEffect(() => {
    const checkSessionOnLoad = async () => {
      // Only run once per app session
      if (initialSessionChecked) {
        setIsInitializing(false);
        return;
      }
      
      // Check if session was explicitly destroyed
      const sessionDestroyed = sessionStorage.getItem('sessionDestroyed');
      
      // If there's an existing session and it wasn't explicitly destroyed, verify it's still valid
      if (token && !sessionDestroyed) {
        try {
          // Try to get user profile to verify token is still valid
          const response = await axios.get('/api/auth/me');
          // If successful, update user data
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
          // If token is invalid, logout the user
          await logout();
        }
      } else if (sessionDestroyed) {
        // Clear the session destroyed flag if it was set
        sessionStorage.removeItem('sessionDestroyed');
      }
      
      // Mark that we've checked the initial session
      setInitialSessionChecked(true);
      setIsInitializing(false);
    };
    
    checkSessionOnLoad();
  }, [initialSessionChecked, token, logout]); // Add missing dependencies

  // Setup interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const response = await axios.post('/api/auth/refresh', { refreshToken });
            const { token: newToken, refreshToken: newRefreshToken } = response.data;
            
            // Update tokens in state and localStorage
            setToken(newToken);
            setRefreshToken(newRefreshToken);
            localStorage.setItem('token', newToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            // Update axios default header
            axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            
            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // If refresh fails, logout the user
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // Clean up interceptor
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken, logout]);

  const value = useMemo(() => ({ 
    token, 
    refreshToken, 
    user, 
    login, 
    logout,
    initialSessionChecked,
    isInitializing
  }), [token, refreshToken, user, login, logout, initialSessionChecked, isInitializing]); // Add missing dependency

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}