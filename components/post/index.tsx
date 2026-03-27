import React from "react";
import { View } from "react-native";
import PostCard from "./PostCard";

export default function Post() {
  return (
    <View>
      <PostCard isLoading={false} posts={[]} />
    </View>
  );
}
