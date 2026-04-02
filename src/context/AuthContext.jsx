import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Axios configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/';
axios.defaults.baseURL = API_BASE_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null); // Added token state

  // Add request/response interceptors to include token and handle auth errors
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn('Global Auth: Unauthorized access or expired token.');
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);

          // Optional: Redirect to login if not already there
          if (!window.location.hash.includes('/signin') && !window.location.hash.includes('/signup')) {
            window.location.hash = '#/signin';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await axios.get('profile');
          setUser(response.data);
          setToken(storedToken);
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('signin', { email, password });
      const { token: receivedToken, ...userData } = response.data;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed'
      };
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await axios.post('signup', { username, email, password });
      const { token: receivedToken, ...userData } = response.data;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Signup failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, signIn: login, signUp: signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
 
 
 
 
 
 
