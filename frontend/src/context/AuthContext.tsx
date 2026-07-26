import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'client' | 'professional' | 'admin' | null;

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  token?: string;
}

interface AuthContextType {
  user: UserSession | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: UserRole) => Promise<void>;
  register: (fullName: string, email: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [role, setRoleState] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initial session hydration check (simulated / storage read)
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const login = async (email: string, targetRole: UserRole) => {
    setIsLoading(true);
    // Simulate auth session setting
    const session: UserSession = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email,
      fullName: email.split('@')[0],
      role: targetRole,
      token: 'jwt_mock_token_12345',
    };
    setUser(session);
    setRoleState(targetRole);
    setIsLoading(false);
  };

  const register = async (fullName: string, email: string, targetRole: UserRole) => {
    setIsLoading(true);
    const session: UserSession = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email,
      fullName,
      role: targetRole,
      token: 'jwt_mock_token_12345',
    };
    setUser(session);
    setRoleState(targetRole);
    setIsLoading(false);
  };

  const logout = async () => {
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
