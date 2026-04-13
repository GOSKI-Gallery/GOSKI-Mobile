import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';
import { useFollowStore } from './useFollowStore';

interface ProfileState {
  profileUser: any | null;
  userPosts: any[];
  followersCount: number;
  followingCount: number;
  isLoading: boolean;
  fetchProfileData: (userId: string) => Promise<void>;
  clearProfile: () => void;
  incrementFollowers: () => void;
  decrementFollowers: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profileUser: null,
  userPosts: [],
  followersCount: 0,
  followingCount: 0,
  isLoading: false,

  fetchProfileData: async (userId: string) => {
    set({ isLoading: true });
    const currentUserId = useAuthStore.getState().user?.id;

    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (userError) throw userError;

      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*, users (id, username, profile_photo_url)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (postsError) throw postsError;

      const { count: followers, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', userId);
      if (followersError) throw followersError;

      const { count: following, error: followingError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);
      if (followingError) throw followingError;

      let isFollowing = false;
      if (currentUserId) {
        const { data: followStatus, error: followStatusError } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUserId)
          .eq('followed_id', userId);
        if (followStatusError) throw followStatusError;
        isFollowing = followStatus && followStatus.length > 0;
      }

      useFollowStore.getState().setFollowingState(userId, isFollowing);

      set({
        profileUser: user,
        userPosts: posts || [],
        followersCount: followers || 0,
        followingCount: following || 0,
        isLoading: false,
      });

    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error.message);
      set({ isLoading: false });
    }
  },
  
  incrementFollowers: () => set((state) => ({ followersCount: state.followersCount + 1 })),
  decrementFollowers: () => set((state) => ({ followersCount: state.followersCount - 1 })),

  clearProfile: () => {
    set({ profileUser: null, userPosts: [], followersCount: 0, followingCount: 0, isLoading: false });
  }
}));
