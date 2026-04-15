import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Alert } from "react-native";

interface FollowState {
  following: Record<string, boolean>;
  setInitialFollowing: (posts: any[], userId: string | undefined) => void;
  setFollowingState: (userId: string, isFollowing: boolean) => void;
  toggleFollow: (followedId: string, followerId: string | undefined) => Promise<boolean>;
}

export const useFollowStore = create<FollowState>((set, get) => ({
  following: {},
  setInitialFollowing: (posts, userId) => {
    if (!userId) return;

    const initialFollowing = posts.reduce((acc, post) => {
      if (post.users?.id) {
        acc[post.users.id] = post.users.followers?.some(
          (f: any) => f.follower_id === userId
        );
      }
      return acc;
    }, {} as Record<string, boolean>);

    set((state) => ({ following: { ...state.following, ...initialFollowing } }));
  },
  setFollowingState: (userId, isFollowing) => {
    set((state) => ({
      following: { ...state.following, [userId]: isFollowing },
    }));
  },
  toggleFollow: async (followedId, followerId) => {
    if (!followerId) {
      Alert.alert("Erro", "Você precisa estar logado para seguir.");
      return false;
    }

    const isCurrentlyFollowing = get().following[followedId] || false;
    set((state) => ({
      following: { ...state.following, [followedId]: !isCurrentlyFollowing },
    }));

    try {
      if (isCurrentlyFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .match({ follower_id: followerId, followed_id: followedId });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: followerId, followed_id: followedId });

        if (error) throw error;
      }

      return !isCurrentlyFollowing;
    } catch (error: any) {
      set((state) => ({
        following: { ...state.following, [followedId]: isCurrentlyFollowing },
      }));
      Alert.alert("Erro", "Não foi possível processar a sua solicitação.");
      console.error(error.message);
      return isCurrentlyFollowing;
    }
  },
}));
