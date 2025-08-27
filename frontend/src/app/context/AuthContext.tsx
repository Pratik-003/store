'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '../utils/api';

//=========== INTERFACES ===========//
interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  cartItemCount: number;
  fetchCartCount: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

//=========== CONTEXT CREATION ===========//
const AuthContext = createContext<AuthContextType | null>(null);

//=========== PROVIDER COMPONENT ===========//
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  const router = useRouter();

  const fetchCartCount = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setCartItemCount(0);
      return;
    }
    try {
      const response = await api.get('/api/orders/cart/');
      setCartItemCount(response.data.items.length || 0);
    } catch (error) {
      console.error("Could not fetch cart count.", error);
      setCartItemCount(0);
    }
  };

  useEffect(() => {
    const fetchUserAndCart = async () => {
      setIsLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const { data } = await api.get('/api/auth/profile');
          setUser(data as User);
          await fetchCartCount();
        } catch (error) {
          console.error("Session expired or invalid, logging out.", error);
          localStorage.removeItem('accessToken');
          setUser(null);
          setCartItemCount(0);
        }
      }
      setIsLoading(false);
    };

    fetchUserAndCart();
  }, []);

  const loginUser = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/api/auth/login/', { email, password });
      localStorage.setItem('accessToken', data.access);
      setUser(data.user as User);
      await fetchCartCount();

      if (data.user && (data.user as User).is_admin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const logoutUser = async () => {
    try {
      await api.post('/api/auth/logout/');
    } catch (error) {
      console.error("Server-side logout failed:", error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setCartItemCount(0);
      router.push('/login');
    }
  };

  const contextData: AuthContextType = {
    user,
    loginUser,
    logoutUser,
    cartItemCount,
    fetchCartCount,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

//=========== CUSTOM HOOKS ===========//
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useCart = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useCart must be used within an AuthProvider');
    }
    return context;
};