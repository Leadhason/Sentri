import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { apiClient } from '../lib/apiClient';

export type UserRole = 'client' | 'professional' | 'admin' | null;

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  token?: string;
}

interface AuthContextType {
  user: UserSession | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, targetRole?: UserRole) => Promise<void>;
  register: (fullName: string, email: string, password: string, phone: string, targetRole: UserRole) => Promise<void>;
  syncProfile: (details: { bio?: string; hourlyRate?: number; specializations?: string[]; operatingLocations?: string[] }) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [role, setRoleState] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBackendUser = async (sessionUser: any, sessionToken?: string): Promise<UserSession> => {
    const role: UserRole = sessionUser.user_metadata?.role || 'client';
    const fullName: string = sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User';
    const phone: string = sessionUser.user_metadata?.phone || '';

    try {
      console.log('[AuthContext] Syncing real user with backend at /api/auth/sync:', fullName, role);
      const syncResult = await apiClient.post<any>('/api/auth/sync', {
        fullName,
        phone,
        role,
      });
      console.log('[AuthContext] Backend sync successful:', syncResult);
      return {
        id: syncResult.id || sessionUser.id,
        email: syncResult.email || sessionUser.email,
        fullName: syncResult.fullName || fullName,
        phone: syncResult.phone || phone,
        role: (syncResult.role as UserRole) || role,
        token: sessionToken,
      };
    } catch (syncErr: any) {
      console.error('[AuthContext] Backend sync warning/error:', syncErr?.message || syncErr);
      return {
        id: sessionUser.id,
        email: sessionUser.email || '',
        fullName,
        phone,
        role,
        token: sessionToken,
      };
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchBackendUser(session.user, session.access_token).then((userSession) => {
          setUser(userSession);
          setRoleState(userSession.role);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userSession = await fetchBackendUser(session.user, session.access_token);
        setUser(userSession);
        setRoleState(userSession.role);
      } else {
        setUser(null);
        setRoleState(null);
      }
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, targetRole?: UserRole) => {
    setIsLoading(true);
    try {
      console.log('[AuthContext] Authenticating real user with Supabase:', email);
      const res = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (res.error) {
        console.error('[AuthContext] Supabase signIn error:', res.error);
        throw res.error;
      }

      if (res.data?.session?.user) {
        console.log('[AuthContext] Supabase authentication successful. User ID:', res.data.session.user.id);
        const userSession = await fetchBackendUser(res.data.session.user, res.data.session.access_token);
        if (targetRole && userSession.role !== targetRole) {
          userSession.role = targetRole;
        }
        setUser(userSession);
        setRoleState(userSession.role);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    phone: string,
    targetRole: UserRole
  ) => {
    setIsLoading(true);
    try {
      console.log('[AuthContext] Registering real user with Supabase:', email, fullName);
      const res = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role: targetRole,
          },
        },
      });

      if (res.error) {
        console.error('[AuthContext] Supabase signUp error:', res.error);
        throw res.error;
      }

      if (res.data?.user) {
        console.log('[AuthContext] Supabase registration successful. User ID:', res.data.user.id);
        const userSession = await fetchBackendUser(res.data.user, res.data.session?.access_token);
        setUser(userSession);
        setRoleState(targetRole);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const syncProfile = async (details: {
    bio?: string;
    hourlyRate?: number;
    specializations?: string[];
    operatingLocations?: string[];
  }) => {
    if (!user) return;
    try {
      await apiClient.post('/api/auth/sync', {
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        bio: details.bio,
        hourlyRate: details.hourlyRate,
        specializations: details.specializations,
        operatingLocations: details.operatingLocations,
      });
    } catch {
      // Ignore if backend offline
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    setUser(null);
    setRoleState(null);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        syncProfile,
        logout,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
