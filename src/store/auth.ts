import { create } from 'zustand';
import { AuthState } from '../types';
import toast from 'react-hot-toast';

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// In a real app, these would be in a secure database
const DEMO_USER = {
  id: '1',
  email: 'admin@example.com',
  // This would be a hashed password in production
  password: 'Admin123!',
  name: 'Admin User',
  role: 'admin' as const,
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // In production, this would validate against a secure backend
      if (email === DEMO_USER.email && password === DEMO_USER.password) {
        const { password: _, ...userWithoutPassword } = DEMO_USER;
        set({ user: userWithoutPassword, isLoading: false });
        toast.success('Successfully logged in!');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  logout: () => {
    set({ user: null });
    toast.success('Successfully logged out');
  },

  clearError: () => set({ error: null }),
}));