import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

interface User {
    id: string;
    email: string;
    username?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user, token) =>
                set({ user, token, isAuthenticated: true }),

            logout: async () => {
                await supabase.auth.signOut();
                set({ user: null, token: null, isAuthenticated: false }); // Limpa o Zustand
            },
        }),
        {
            name: 'goski-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);