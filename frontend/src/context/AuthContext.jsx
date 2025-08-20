import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('chatUser')) || null);

  const login = (data) => {
    console.log('Login data:', data); 
    localStorage.setItem('chatUser', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('chatUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};