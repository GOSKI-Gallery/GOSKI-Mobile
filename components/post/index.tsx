import React, { useEffect } from "react";
import { View } from "react-native";
import { usePostStore } from "../../states/usePostStore";
import PostCard from "./PostCard";

export default function Post() {
  const { posts, isLoading, fetchPosts } = usePostStore();

  useEffect(() => {
    fetchPosts().then(() => {
    });
  }, []);

  return (
    <View className="flex-1"> 
      <PostCard isLoading={isLoading} posts={posts} />
    </View>
  );
}