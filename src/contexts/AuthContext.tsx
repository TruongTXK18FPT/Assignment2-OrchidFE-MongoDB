import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import type { ReactNode } from 'react';
import type { User } from '../types/orchid';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user data on app start
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', userData.token);
  };

  const logout = () => {
    const userName = user?.accountName;
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    
    if (userName) {
      toast.info(`Goodbye, ${userName}! You have been logged out.`);
    } else {
      toast.info('You have been logged out.');
    }
  };

  const isAuthenticated = !!user;
  
  // Handle role checking for string roleId values from MongoDB
  const userRoleId = user?.roleId;
  const isAdmin = userRoleId === '1' || userRoleId === '2' ||
                  user?.roleName?.toLowerCase() === 'admin' || user?.roleName?.toLowerCase() === 'superadmin';
  const isSuperAdmin = userRoleId === '1' || user?.roleName?.toLowerCase() === 'superadmin';

  const value = useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
  }), [user, isAuthenticated, isAdmin, isSuperAdmin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
