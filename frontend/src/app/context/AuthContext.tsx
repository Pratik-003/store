// /app/context/AuthContext.tsx
'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '../utils/api';

// 1. Define the type for the user object returned from the API
interface User {
  id: number;
  email: string;
  is_admin: boolean;
  // Add any other user properties here
}

// 2. Define the shape of the context's value
interface AuthContextType {
  user: User | null;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
}

// 3. Define the type for the component's props
interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          // Use the 'api' utility for the request
          const { data } = await api.get('/api/user/');
          setUser(data as User); // Assert the type of the user data
        } catch (error) {
          console.error("Failed to fetch user profile, clearing access token.", error);
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const loginUser = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/api/auth/login/', { email, password });
      
      localStorage.setItem('accessToken', data.access);
      
      setUser(data.user as User);
      
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
    localStorage.removeItem('accessToken');
    setUser(null);
    router.push('/login');
    // It's a good practice to also call a server-side logout endpoint here.
  };

  const contextData: AuthContextType = { user, loginUser, logoutUser };

  return (
    <AuthContext.Provider value={contextData}>
      {isLoading ? null : children}
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
