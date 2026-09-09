import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const TOKEN_KEY = 'itisep_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }
    let cancelled = false;
    api.me(token)
      .then(({ user }) => {
        if (cancelled) return;
        setUser(user);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
        setReady(true);
      });
    return () => { cancelled = true; };
  }, [token]);

  function applySession(nextToken, nextUser) {
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    }
    setUser(nextUser || null);
  }

  async function signIn(identifier, password) {
    const res = await api.login(identifier, password);
    applySession(res.token, res.user);
    return res.user;
  }

  async function signUp(name, email, password) {
    const res = await api.register(name, email, password);
    applySession(res.token, res.user);
    return res.user;
  }

  async function signOut() {
    try {
      if (token) await api.logout(token);
    } catch { /* ignore */ }
    applySession(null, null);
  }

  function updateUser(next) {
    setUser(prev => (prev ? { ...prev, ...next } : next));
  }

  return (
    <AuthContext.Provider value={{ user, token, ready, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}