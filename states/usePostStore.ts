import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface PostStore {
  posts: any[];
  isLoading: boolean;
  fetchPosts: () => Promise<void>;
  addPostOptimistic: (newPost: any) => void;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  isLoading: false,

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          users (username, profile_photo_url),
          likes (user_id)
        `)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ posts: data || [] });
    } 
    
    catch (error) {
      console.error("Erro ao buscar posts:", error);
    } 
    
    finally {
      set({ isLoading: false });
    }
  },

  addPostOptimistic: (newPost) => 
    set((state) => ({ posts: [newPost, ...state.posts] })),
}));