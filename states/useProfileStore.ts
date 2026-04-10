import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface ProfileState {
  profileUser: any | null;
  userPosts: any[];
  followersCount: number;
  followingCount: number;
  isLoading: boolean;

  fetchProfileData: (userId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profileUser: null,
  userPosts: [],
  followersCount: 0,
  followingCount: 0,
  isLoading: false,

  fetchProfileData: async (userId: string) => {
    set({ isLoading: true });

    try {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      set({
        profileUser: user,
        userPosts: posts || [],
        followersCount: followers || 0,
        followingCount: following || 0,
        isLoading: false,
      });

    } 
    
    catch (error) {
      console.error('Erro ao carregar perfil:', error);
      set({ isLoading: false });
    }
  },
}));