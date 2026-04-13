import React, { useEffect } from "react";
import { View } from "react-native";
import { usePostStore } from "../../states/usePostStore";
import PostCard from "./PostCard";
import { useLikeStore } from "../../states/useLikeStore";
import { useAuthStore } from "../../states/useAuthStore";
import { useFollowStore } from "../../states/useFollowStore";

export default function Post() {
  const { posts, isLoading, fetchPosts } = usePostStore();
  const setInitialLikes = useLikeStore((state) => state.setInitialLikes);
  const setInitialFollowing = useFollowStore((state) => state.setInitialFollowing);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchPosts().then(() => {
      const allPosts = usePostStore.getState().posts;
      if (user) {
        setInitialLikes(allPosts, user.id);
        setInitialFollowing(allPosts, user.id);
      }
    });
  }, [fetchPosts, user, setInitialLikes, setInitialFollowing]);

  return (
    <View className="flex-1"> 
      <PostCard isLoading={isLoading} posts={posts} />
    </View>
  );
}