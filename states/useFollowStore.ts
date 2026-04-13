import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Alert } from "react-native";
import { useProfileStore } from "./useProfileStore";

interface FollowState {
  following: { [key: string]: boolean };
  setInitialFollowing: (posts: any[], userId: string | undefined) => void;
  setFollowingState: (userId: string, isFollowing: boolean) => void;
  toggleFollow: (followedId: string, followerId: string | undefined) => void;
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
    }, {} as { [key: string]: boolean });
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
      return;
    }

    const isCurrentlyFollowing = get().following[followedId] || false;
    const profileUserId = useProfileStore.getState().profileUser?.id;

    set((state) => ({
      following: { ...state.following, [followedId]: !isCurrentlyFollowing },
    }));

    if (profileUserId === followedId) {
      if (isCurrentlyFollowing) {
        useProfileStore.getState().decrementFollowers();
      } else {
        useProfileStore.getState().incrementFollowers();
      }
    }

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
    } catch (error: any) {
      set((state) => ({
        following: { ...state.following, [followedId]: isCurrentlyFollowing },
      }));

      if (profileUserId === followedId) {
        if (isCurrentlyFollowing) {
          useProfileStore.getState().incrementFollowers();
        } else {
          useProfileStore.getState().decrementFollowers();
        }
      }

      Alert.alert("Erro", "Não foi possível processar a sua solicitação.");
      console.error(error.message);
    }
  },
}));
