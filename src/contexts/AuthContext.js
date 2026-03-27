import React, { createContext, useContext, useState, useCallback } from 'react';
import { getFromStorage, saveToStorage, storageKeys } from '../utils/storage';
import { generateId } from '../utils/formatters';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    return getFromStorage(storageKeys.CURRENT_USER);
  });

  const getUsers = useCallback(() => {
    return getFromStorage(storageKeys.USERS) || [];
  }, []);

  const register = useCallback((name, email, password) => {
    const users = getUsers();
    if (users.find((u) => u.email === email)) {
      return { success: false, message: 'E-mail já cadastrado.' };
    }
    const user = {
      id: generateId(),
      name,
      email,
      password: btoa(password),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveToStorage(storageKeys.USERS, users);
    const safeUser = { id: user.id, name: user.name, email: user.email };
    setCurrentUser(safeUser);
    saveToStorage(storageKeys.CURRENT_USER, safeUser);
    return { success: true };
  }, [getUsers]);

  const login = useCallback((email, password) => {
    const users = getUsers();
    const user = users.find(
      (u) => u.email === email && u.password === btoa(password)
    );
    if (!user) {
      return { success: false, message: 'E-mail ou senha inválidos.' };
    }
    const safeUser = { id: user.id, name: user.name, email: user.email };
    setCurrentUser(safeUser);
    saveToStorage(storageKeys.CURRENT_USER, safeUser);
    return { success: true };
  }, [getUsers]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    saveToStorage(storageKeys.CURRENT_USER, null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
