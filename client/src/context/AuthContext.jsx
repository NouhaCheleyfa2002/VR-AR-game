import { createContext, useState } from 'react';
import axios from 'axios';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
 
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('token') || '';
    if (saved) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${saved}`;
    }
    return saved;//it automatically sets the header if the user refreshes the page.
  });
  

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization']; 
    setToken('');
    setUser(null);
  };
  

  const value = {
    user,
    setUser,
    backendUrl,
    token,
    setToken,
    logout,
  };

  

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
