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
    refreshUser: () => Promise<void>;
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

            refreshUser: async () => {
                const { user } = get();
                if (!user?.id) return;

                const { data: updatedUserData } = await supabase
                    .from('users')
                    .select('id, email, username, profile_photo_url')
                    .eq('id', user.id)
                    .maybeSingle();

                if (updatedUserData) {
                    set((state) => ({ ...state, user: updatedUserData }));
                }
            },
        }),
        {
            name: 'goski-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: (state) => {
                return async (rehydratedState, error) => {
                    if (error) {
                        console.error('Failed to rehydrate auth store:', error);
                        return;
                    }
                    try {
                        const { data: { session } } = await supabase.auth.getSession();
                        if (session) {
                            const { data: userData } = await supabase
                                .from('users')
                                .select('*')
                                .eq('id', session.user.id)
                                .maybeSingle();
                            if (userData) {
                                rehydratedState?.setAuth(
                                    {
                                        id: userData.id,
                                        email: userData.email,
                                        username: userData.username,
                                        profile_photo_url: userData.profile_photo_url,
                                    },
                                    session.access_token
                                );
                            } else {
                                const now = new Date().toISOString();
                                const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user';
                                await supabase.from('users').upsert({
                                    id: session.user.id,
                                    username,
                                    email: session.user.email,
                                    created_at: now,
                                    updated_at: now,
                                });
                                rehydratedState?.setAuth(
                                    {
                                        id: session.user.id,
                                        email: session.user.email,
                                        username,
                                    },
                                    session.access_token
                                );
                            }
                        } else {
                            rehydratedState?.clearAuth();
                        }
                    } catch (err) {
                        console.error('Session refresh failed:', err);
                        rehydratedState?.clearAuth();
                        await AsyncStorage.multiRemove([
                            'supabase.auth.token',
                            'supabase.auth.token-code-verifier',
                            'supabase.auth.token-user',
                        ]);
                    }
                };
            },
        }
    )
);