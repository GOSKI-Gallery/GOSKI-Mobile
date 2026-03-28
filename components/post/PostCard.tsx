import React from "react";
import { ScrollView, View, Text } from "react-native";
import PostSkeleton from "../ui/PostSkeleton";
import SinglePost from "./SinglePost";
import { useAuthStore } from "../../states/useAuthStore";

export default function PostCard({ isLoading, posts }: { isLoading: boolean, posts: any[] }) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  if (isLoading) {
    return (
      <ScrollView className="flex-1 w-full" contentContainerStyle={{ paddingTop: 110 }}>
        {[1, 2, 3].map((key) => <PostSkeleton key={key} />)}
      </ScrollView>
    );
  }
  
  if (posts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-zinc-400">Nenhum post aprovado ainda...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 110, paddingBottom: 100 }}>
      {posts.map((post) => (
        <SinglePost key={post.id} post={post} />
      ))}
    </ScrollView>
  );
}
