import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from '@/lib/auth';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  setUser: (user: UserSession | null) => void;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  signOut: async () => {},
  checkSession: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const cached = localStorage.getItem('nutri_user_session');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      // Better-auth client getSession
      const res = await (authClient as any).getSession();
      if (res?.data?.user) {
        const u = res.data.user;
        const sessionUser: UserSession = {
          id: u.id,
          name: u.name || '',
          email: u.email || '',
          image: u.image,
        };
        setUser(sessionUser);
        localStorage.setItem('nutri_user_session', JSON.stringify(sessionUser));
      } else if (!res?.data?.session) {
        // Clear if invalid
        setUser(null);
        localStorage.removeItem('nutri_user_session');
      }
    } catch (err) {
      console.warn('Erro ao verificar sessão:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const signOut = async () => {
    try {
      await (authClient as any).signOut();
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('nutri_user_session');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, signOut, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

