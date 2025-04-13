import React, { createContext, useState, useContext } from "react";
import { login, logout } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const signIn = async (email, password) => {
    const response = await login(email, password);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem("token", response.token);
  };

  const signOut = () => {
    logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
