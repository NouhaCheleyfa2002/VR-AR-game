import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);
      // Set axios headers if token exists
      if (parsedAuth.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedAuth.token}`;
      }
      return parsedAuth;
    }
    return { user: null, token: '' };
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const login = ({ token, user }) => {
    const authData = { user, token };
    localStorage.setItem('auth', JSON.stringify(authData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAuth(authData);
  };

  const logout = () => {
    localStorage.removeItem('auth');
    delete axios.defaults.headers.common['Authorization'];
    setAuth({ user: null, token: '' });
  };

  // Add this to ensure token is included in user object for compatibility
  const getUserWithToken = () => {
    return auth.user ? { ...auth.user, token: auth.token } : null;
  };

  return (
    <AuthContext.Provider value={{ 
      user: getUserWithToken(), // This ensures user.token exists
      token: auth.token,
      login, 
      logout, 
      backendUrl 
    }}>
      {children}
    </AuthContext.Provider>
  );
};