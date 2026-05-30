import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';

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
          users (
            id,
            username,
            profile_photo_url,
            followers:follows!followed_id ( follower_id )
          ),
          likes (user_id),
          post_tag (
            tag_id,
            tags ( id, name )
          )
        `)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      let posts = data || [];

      const user = useAuthStore.getState().user;
      if (user && posts.length > 0) {
        const { data: userLikes } = await supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", user.id);

        const likedPostIds = userLikes?.map((l: any) => l.post_id) || [];

        let likedTagIds: number[] = [];
        if (likedPostIds.length > 0) {
          const { data: likedPostTags } = await supabase
            .from("post_tag")
            .select("tag_id")
            .in("post_id", likedPostIds);
          likedTagIds = [...new Set(likedPostTags?.map((pt: any) => pt.tag_id) || [])];
        }

        const scoredPosts = posts.map((post) => {
          let score = 0;

          if (post.users?.followers?.some((f: any) => f.follower_id === user.id)) {
            score += 100;
          }

          if (likedTagIds.length > 0 && post.post_tag) {
            const overlap = post.post_tag.some((pt: any) =>
              likedTagIds.includes(pt.tag_id)
            );
            if (overlap) score += 50;
          }

          return { ...post, score };
        });

        scoredPosts.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          if (dateA !== dateB) return dateB - dateA;
          return (b.score || 0) - (a.score || 0);
        });

        posts = scoredPosts;
      }

      set({ posts });
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addPostOptimistic: (newPost) =>
    set((state) => ({ posts: [newPost, ...state.posts] })),
}));
