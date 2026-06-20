import React from "react";
import { RefreshControl, ScrollView, View, Text } from "react-native";
import PostSkeleton from "../ui/PostSkeleton";
import SinglePost from "./SinglePost";
import { useThemeStore } from "../../states/useThemeStore";

export default function PostCard({
  isLoading,
  refreshing,
  posts,
  onRefresh,
}: {
  isLoading: boolean;
  refreshing: boolean;
  posts: any[];
  onRefresh: () => void;
}) {
  const isDark = useThemeStore((s) => s.isDark);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={isDark ? "#a1a1aa" : "#18181b"}
      colors={[isDark ? "#a1a1aa" : "#18181b"]}
    />
  );

  if (isLoading && posts.length === 0) {
    return (
      <ScrollView
        className="flex-1 w-full"
        refreshControl={refreshControl}
      >
        {[1, 2, 3].map((key) => <PostSkeleton key={key} />)}
      </ScrollView>
    );
  }

  if (posts.length === 0) {
    return (
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        refreshControl={refreshControl}
      >
        <Text className="text-zinc-400">Nenhum post registrado</Text>
      </ScrollView>
    );
  }

  return (
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={refreshControl}
      >
      {posts.map((post) => (
        <SinglePost key={post.id} post={post} />
      ))}
    </ScrollView>
  );
}
