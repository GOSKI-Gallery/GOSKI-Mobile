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
      const user = useAuthStore.getState().user;

      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .or("moderation_status.is.null,moderation_status.in.(UNKNOWN,VERY_UNLIKELY,UNLIKELY)")
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("[Feed] Erro ao buscar posts:", JSON.stringify(postsError));
        set({ posts: [] });
        return;
      }

      let posts = postsData || [];

      if (posts.length > 0) {
        const postIds = posts.map((p: any) => p.id);
        const userIds = [...new Set(posts.map((p: any) => p.user_id))];

        const [usersResult, likesResult, followsResult, allFollowsResult] = await Promise.all([
          supabase.from("users").select("id, username, profile_photo_url").in("id", userIds),
          supabase.from("likes").select("post_id, user_id").in("post_id", postIds),
          user ? supabase.from("follows").select("follower_id, followed_id").eq("follower_id", user.id) : Promise.resolve({ data: [] }),
          supabase.from("follows").select("follower_id, followed_id").in("followed_id", userIds),
        ]);

        const usersMap = new Map((usersResult.data || []).map((u: any) => [u.id, u]));

        const likesByPost: Record<string, { user_id: string }[]> = {};
        if (!likesResult.error) {
          likesResult.data?.forEach((l: any) => {
            if (!likesByPost[l.post_id]) likesByPost[l.post_id] = [];
            likesByPost[l.post_id].push({ user_id: l.user_id });
          });
        }

        const followersByUser: Record<string, { follower_id: string }[]> = {};
        if (!allFollowsResult.error) {
          allFollowsResult.data?.forEach((f: any) => {
            if (!followersByUser[f.followed_id]) followersByUser[f.followed_id] = [];
            followersByUser[f.followed_id].push({ follower_id: f.follower_id });
          });
        }

        const followingIds = new Set((followsResult.data || []).map((f: any) => f.followed_id));

        let likedTagIds: number[] = [];
        if (user) {
          const { data: userLikes } = await supabase
            .from("likes")
            .select("post_id")
            .eq("user_id", user.id);

          const likedPostIds = userLikes?.map((l: any) => l.post_id) || [];
          if (likedPostIds.length > 0) {
            const { data: likedPostTags } = await supabase
              .from("post_tag")
              .select("tag_id")
              .in("post_id", likedPostIds);
            likedTagIds = [...new Set(likedPostTags?.map((pt: any) => pt.tag_id) || [])];
          }
        }

        let tagsByPost: Record<string, any[]> = {};
        const { data: postTagData, error: postTagError } = await supabase
          .from("post_tag")
          .select("post_id, tag_id")
          .in("post_id", postIds);
        if (!postTagError && postTagData) {
          postTagData.forEach((pt: any) => {
            if (!tagsByPost[pt.post_id]) tagsByPost[pt.post_id] = [];
            tagsByPost[pt.post_id].push(pt);
          });
        }

        posts = posts.map((post: any) => {
          let score = 0;

          if (followingIds.has(post.user_id)) {
            score += 100;
          }

          const postTags = tagsByPost[post.id] || [];
          if (likedTagIds.length > 0 && postTags.length > 0) {
            const overlap = postTags.some((pt: any) =>
              likedTagIds.includes(pt.tag_id)
            );
            if (overlap) score += 50;
          }

          const userData = usersMap.get(post.user_id);

          return {
            ...post,
            users: {
              id: userData?.id || post.user_id,
              username: userData?.username || "Usuário",
              profile_photo_url: userData?.profile_photo_url || null,
              followers: followersByUser[post.user_id] || [],
            },
            likes: likesByPost[post.id] || [],
            post_tag: postTags,
            score,
          };
        });

        posts.sort((a: any, b: any) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          if (dateA !== dateB) return dateB - dateA;
          return (b.score || 0) - (a.score || 0);
        });
      }

      set({ posts });
    } catch (error) {
      console.error("[Feed] Erro no catch:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addPostOptimistic: (newPost) =>
    set((state) => ({ posts: [newPost, ...state.posts] })),
}));
