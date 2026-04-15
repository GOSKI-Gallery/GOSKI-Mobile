import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

interface User {
    id: string;
    email?: string;
    username?: string;
    profile_photo_url?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    signOut: () => Promise<void>;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user, token) =>
                set({ user, token, isAuthenticated: true }),

            signOut: async () => {
                await supabase.auth.signOut();
                set({ user: null, token: null, isAuthenticated: false });
            },

            clearAuth: () => {
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'goski-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: (state) => {
                return (rehydratedState, error) => {
                    if (error) {
                        console.error('Failed to rehydrate auth store:', error);
                        return;
                    }
                    const refreshSession = async () => {
                        const { data: { session } } = await supabase.auth.getSession();
                        if (session) {
                            const { data: userData, error: userError } = await supabase
                                .from('users')
                                .select('*')
                                .eq('id', session.user.id)
                                .single();
                            if (userError) {
                                console.error('Error refreshing user data, signing out', userError);
                                rehydratedState?.signOut();
                            } else {
                                rehydratedState?.setAuth(
                                    {
                                        id: userData.id,
                                        email: userData.email,
                                        username: userData.username,
                                        profile_photo_url: userData.profile_photo_url,
                                    },
                                    session.access_token
                                );
                            }
                        } else {
                           rehydratedState?.clearAuth();
                        }
                    };
                    refreshSession();
                };
            },
        }
    )
);