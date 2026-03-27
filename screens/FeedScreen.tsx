import React from "react";
import { View } from "react-native";
import Header from "../components/header";
import Post from "../components/post/PostCard";

export default function FeedScreen() {
  return (
    <View className="flex-1">
      <Header />

      <View className="flex-1">
        <Post isLoading={true} posts={[]} />
      </View>
    </View>
  );
}
