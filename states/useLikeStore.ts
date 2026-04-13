import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Alert } from "react-native";

interface LikeState {
  likes: { [key: string]: boolean };
  likeCounts: { [key: string]: number };
  toggleLike: (postId: number, userId: string | undefined) => void;
  setInitialLikes: (posts: any[], userId: string | undefined) => void;
}

export const useLikeStore = create<LikeState>((set, get) => ({
  likes: {},
  likeCounts: {},
  setInitialLikes: (posts, userId) => {
    const initialLikes: { [key: string]: boolean } = {};
    const initialLikeCounts: { [key: string]: number } = {};

    for (const post of posts) {
      if (userId) {
        initialLikes[post.id] = post.likes?.some((l: any) => l.user_id === userId) || false;
      }
      initialLikeCounts[post.id] = post.likes_count ?? post.likes?.length ?? 0;
    }

    if (userId) {
        set({ likes: initialLikes, likeCounts: initialLikeCounts });
    } else {
        set({ likes: {}, likeCounts: initialLikeCounts });
    }
  },
  toggleLike: async (postId, userId) => {
    if (!userId) {
      Alert.alert("Erro", "Você precisa estar logado para curtir.");
      return;
    }

    const isLiked = get().likes[postId] || false;
    const currentLikeCount = get().likeCounts[postId] || 0;

    set((state) => ({
      likes: { ...state.likes, [postId]: !isLiked },
      likeCounts: {
        ...state.likeCounts,
        [postId]: currentLikeCount + (!isLiked ? 1 : -1),
      },
    }));

    try {
      if (!isLiked) {
        const { error } = await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: userId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("likes")
          .delete()
          .match({ post_id: postId, user_id: userId });
        if (error) throw error;
      }
    } catch (error: any) {
      set((state) => ({
        likes: { ...state.likes, [postId]: isLiked },
        likeCounts: {
          ...state.likeCounts,
          [postId]: currentLikeCount,
        },
      }));
      Alert.alert("Erro", "Não foi possível processar a sua solicitação.");
      console.error(error.message);
    }
  },
}));
