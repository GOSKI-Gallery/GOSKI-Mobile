import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { usePostStore } from "../../states/usePostStore";
import PostCard from "./PostCard";
import { useLikeStore } from "../../states/useLikeStore";
import { useAuthStore } from "../../states/useAuthStore";
import { useFollowStore } from "../../states/useFollowStore";

export default function Post() {
  console.log("[Post] Componente montou");
  const { posts, isLoading, fetchPosts } = usePostStore();
  const setInitialLikes = useLikeStore((state) => state.setInitialLikes);
  const setInitialFollowing = useFollowStore((state) => state.setInitialFollowing);
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log("[Post] useEffect rodou");
    fetchPosts().then(() => {
      console.log("[Post] fetchPosts concluiu");
      const allPosts = usePostStore.getState().posts;
      if (user) {
        setInitialLikes(allPosts, user.id);
        setInitialFollowing(allPosts, user.id);
      }
    });
  }, [fetchPosts, user, setInitialLikes, setInitialFollowing]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    const allPosts = usePostStore.getState().posts;
    if (user) {
      setInitialLikes(allPosts, user.id);
      setInitialFollowing(allPosts, user.id);
    }
    setRefreshing(false);
  }, [fetchPosts, user, setInitialLikes, setInitialFollowing]);

  return (
    <View className="flex-1" style={{ paddingTop: 110 }}>
      <PostCard
        isLoading={isLoading}
        refreshing={refreshing}
        posts={posts}
        onRefresh={handleRefresh}
      />
    </View>
  );
}